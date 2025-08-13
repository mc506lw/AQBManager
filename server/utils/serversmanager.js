import fs from 'fs'
import path from 'path'
import { authentication } from './authmanager.js'
import { WebSocket } from 'ws'

const dataPath = path.join(process.cwd(), 'server/data/servers.json')

// --- 全局连接池和相关常量 ---
const serverConnections = {} // { [uuid]: { ws: WebSocket, lastKnownName: string, reconnectTimer: NodeJS.Timeout } }
const RECONNECT_INTERVAL = 5000; // 5秒重连间隔
let isShuttingDown = false; // 标记是否正在关闭，防止关闭时重连

// --- 初始化所有服务器连接 ---
export async function initializeAllServerConnections() {
    console.log('🔄 正在初始化所有服务器连接...');
    const data = await get_data();
    if (!data) {
        console.error('❌ 无法读取服务器数据，跳过初始化连接。');
        return;
    }

    const servers = Object.values(data);
    if (servers.length === 0) {
        console.log('📭 没有配置服务器，无需初始化连接。');
        return;
    }

    console.log(`🔌 尝试连接 ${servers.length} 个服务器...`);
    for (const server of servers) {
        connectToServer(server);
    }
}

// --- 连接到单个服务器 ---
export function connectToServer(server) {
    const { uuid, ip, token } = server;

    if (isShuttingDown) {
        console.log(`🚫 应用正在关闭，跳过连接服务器 ${uuid}`);
        return;
    }

    // 防止重复连接
    if (serverConnections[uuid] && serverConnections[uuid].ws && serverConnections[uuid].ws.readyState === WebSocket.OPEN) {
        console.log(`✅ 服务器 ${uuid} 已连接，跳过重复连接`);
        return;
    }

    // 清除旧的重连定时器
    if (serverConnections[uuid] && serverConnections[uuid].reconnectTimer) {
        clearTimeout(serverConnections[uuid].reconnectTimer);
        delete serverConnections[uuid].reconnectTimer;
    }

    console.log(`🔌 正在连接服务器 ${uuid} (${ip})...`);
    let ws;
    try {
        ws = new WebSocket(`ws://${ip}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error(`❌ 创建 WebSocket 连接失败 (${uuid}):`, error.message);
        scheduleReconnect(server);
        return;
    }

    // --- 为连接对象添加标识和回调处理 ---
    ws.serverUuid = uuid; // 标记这个连接属于哪个服务器

    ws.on('open', () => {
        console.log(`✅ 与服务器 ${uuid} (${ip}) 的连接已建立`);
        // 可以在这里发送初始验证或获取信息的请求，如果需要的话
        serverConnections[uuid] = {
            ws: ws,
            lastKnownName: serverConnections[uuid]?.lastKnownName || server.name || 'Unknown',
            reconnectTimer: null // 清除重连定时器引用
        };
    });

    ws.on('message', (data) => {
        try {
            const msg = JSON.parse(data);
            // console.log(`📥 收到来自服务器 ${uuid} 的消息:`, msg); // 详细日志

            // --- 缓存关键信息 ---
            if (msg.name) {
                if (serverConnections[uuid]) {
                    serverConnections[uuid].lastKnownName = msg.name;
                }
                console.log(`🏷️ 服务器 ${uuid} 名称更新: ${msg.name}`);
            }

        } catch (error) {
            console.error(`❌ 解析来自服务器 ${uuid} 的消息失败:`, error);
            // console.log('原始数据:', data.toString());
        }
    });

    ws.on('error', (error) => {
        console.error(`❌ 服务器 ${uuid} WebSocket 错误:`, error.message);
        // 触发重连
        scheduleReconnect(server);
    });

    ws.on('close', (code, reason) => {
        if (serverConnections[uuid] && serverConnections[uuid].ws === ws) {
            console.log(`🔚 服务器 ${uuid} 连接已关闭 (Code: ${code}, Reason: ${reason?.toString() || 'N/A'})`);
            // 触发重连
            scheduleReconnect(server);
        } else {
            // 这可能是旧的 ws 实例被新实例替换后关闭的
            console.log(`🔚 服务器 ${uuid} 的旧连接已关闭 (Code: ${code})`);
        }
    });
}

// --- 调度重连 ---
export function scheduleReconnect(server) {
    const { uuid } = server;
    if (isShuttingDown) {
        console.log(`🚫 应用正在关闭，取消服务器 ${uuid} 的重连计划`);
        return;
    }

    console.log(`⏳ 为服务器 ${uuid} 安排 ${RECONNECT_INTERVAL / 1000} 秒后重连...`);

    // 清除旧的定时器
    if (serverConnections[uuid] && serverConnections[uuid].reconnectTimer) {
        clearTimeout(serverConnections[uuid].reconnectTimer);
    }

    // 设置新的重连定时器
    const timer = setTimeout(() => {
        console.log(`🔄 正在重连服务器 ${uuid}...`);
        connectToServer(server); // 尝试重连
    }, RECONNECT_INTERVAL);

    // 更新连接池中的定时器引用
    if (!serverConnections[uuid]) {
        serverConnections[uuid] = { ws: null, lastKnownName: server.name || 'Unknown', reconnectTimer: timer };
    } else {
        serverConnections[uuid].reconnectTimer = timer;
    }
}

// --- 通过已连接的 WebSocket 发送动作 ---
export async function sendActionToConnectedServer(uuid, action, params = null) {
    // 检查连接状态，如果没有连接则建立连接
    let connection = serverConnections[uuid];
    
    if (!connection || !connection.ws || connection.ws.readyState !== WebSocket.OPEN) {
        console.log(`🔌 服务器 ${uuid} 未连接，正在尝试连接...`);
        
        // 获取服务器信息
        const data = await get_data();
        if (!data || !data[uuid]) {
            throw new Error(`服务器 ${uuid} 不存在`);
        }
        
        // 建立连接
        connectToServer(data[uuid]);
        
        // 等待连接建立
        await new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`连接服务器 ${uuid} 超时`));
            }, 5000);
            
            const checkConnection = () => {
                connection = serverConnections[uuid];
                if (connection && connection.ws && connection.ws.readyState === WebSocket.OPEN) {
                    clearTimeout(timeout);
                    resolve();
                } else {
                    setTimeout(checkConnection, 100);
                }
            };
            
            checkConnection();
        });
        
        console.log(`✅ 服务器 ${uuid} 连接已建立`);
    }
    
    // 使用新的连接发送动作
    connection = serverConnections[uuid];
    const ws = connection.ws;
    
    const requestData = {
        action: action
    };
    
    // 如果 params 存在，则将其属性直接附加到 requestData 对象上
    if (params) {
        Object.assign(requestData, params);
    }
    
    console.log(`📤 向服务器 ${uuid} 发送动作: ${action}`, params ? params : '');
    
    // 发送消息并等待响应
    return new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
            ws.removeListener('message', handleMessage);
            console.warn(`⏰ 向服务器 ${uuid} 发送动作 ${action} 超时`);
            reject(new Error(`向服务器 ${uuid} 发送动作 ${action} 超时`));
        }, 5000);
        
        const handleMessage = (data) => {
            try {
                const response = JSON.parse(data);
                clearTimeout(timeout);
                ws.removeListener('message', handleMessage);
                resolve(response); // 直接返回完整回复内容
            } catch (e) {
                console.warn(`⚠️ 解析来自 ${uuid} 的消息失败:`, e.message);
            }
        };
        
        ws.on('message', handleMessage);
        
        try {
            ws.send(JSON.stringify(requestData));
        } catch (sendError) {
            clearTimeout(timeout);
            ws.removeListener('message', handleMessage);
            console.error(`❌ 向服务器 ${uuid} 发送消息失败:`, sendError);
            reject(new Error(`发送消息失败: ${sendError.message}`));
        }
    });
}

// --- 获取单个服务器状态 ---
export async function get_server_status(token, uuid) {
    // 1. 认证检查
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };

    const data = await get_data();
    if (!data) return { success: false, msg: '系统错误' };
    const server = data[uuid];
    if (!server) return { success: false, msg: '服务器不存在' };
    // 通过发送 getuuid 动作判断是否正常在线
    try {
        const result = await sendActionToConnectedServer(uuid, '/api/v1/server/uuid');
        return { success: true, msg: '服务器在线', response: result };
    } catch (error) {
        return { success: false, msg: '服务器不在线' };
    }

}

// --- 获取所有服务器状态 ---
export async function get_all_servers_status(token) {
    // 1. 认证检查
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    const data = await get_data();
    if (!data) return { success: false, msg: '系统错误' };

    const results = {};
    const promises = [];

    for (const uuid in data) {
        // 为每个服务器创建一个获取状态的 Promise
        const promise = get_server_status(token, uuid)
            .then(res => {
                results[uuid] = {
                    server: { uuid: data[uuid].uuid, name: serverConnections[uuid]?.lastKnownName || data[uuid].name || 'Unknown', ip: data[uuid].ip },
                    status: res.response || {},
                    success: res.success,
                    msg: res.msg
                };
            })
            .catch(err => {
                results[uuid] = {
                    server: { uuid: data[uuid].uuid, name: serverConnections[uuid]?.lastKnownName || data[uuid].name || 'Unknown', ip: data[uuid].ip },
                    status: {},
                    success: false,
                    msg: `获取失败: ${err.message}`
                };
            });
        promises.push(promise);
    }

    // 等待所有状态获取完成
    await Promise.allSettled(promises);

    return { success: true, allStatus: results, msg: '批量状态获取完成' };
}


export async function do_action(token, uuid, action, params = null) {
    // 1. 认证检查
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    const data = await get_data();
    if (!data) return { success: false, msg: '系统错误' };
    const server = data[uuid];
    if (!server) return { success: false, msg: '服务器不存在' };

    try {
        // --- 使用已建立的连接发送动作 ---
        const response = await sendActionToConnectedServer(uuid, action, params);
        // 根据服务器响应判断成功与否
        if (response.success === false || response.status === 'error') {
            return { success: false, msg: response.error || response.message || response.msg || `动作 ${action} 执行失败` };
        } else {
            return { success: true, msg: response.message || response.msg || '动作执行成功', response: response };
        }
        // --- ---
    } catch (error) {
        console.error('执行服务器动作失败:', error);
        return { success: false, msg: `执行失败: ${error.message}` };
    }
}

export async function edit_server(token, uuid, serverip, servertoken, servername) {
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    const data = await get_data()
    if (!data) return { success: false, msg: '系统错误' }
    if (!data[uuid]) return { success: false, msg: '服务器不存在' }
    // 验证新的服务器信息
    console.log(`开始验证新服务器 ${serverip}`)
    const server = await verify_server(serverip, servertoken)
    if (!server || !server.success) {
        return { success: false, msg: server?.msg || '新服务器验证失败' }
    }
    // 检查新的 UUID 是否与其他服务器冲突（除了当前服务器）
    const existingServer = Object.values(data).find(s => s.uuid === server.uuid && s.uuid !== uuid)
    if (existingServer) {
        return { success: false, msg: '该服务器已存在' }
    }
    // --- 在更新数据前，先断开旧连接 ---
    if (serverConnections[uuid]) {
        console.log(`🔌 正在关闭服务器 ${uuid} 的旧连接...`);
        if (serverConnections[uuid].reconnectTimer) {
            clearTimeout(serverConnections[uuid].reconnectTimer);
        }
        if (serverConnections[uuid].ws && serverConnections[uuid].ws.readyState === WebSocket.OPEN) {
            serverConnections[uuid].ws.close();
        }
        delete serverConnections[uuid]; // 从连接池中移除
        console.log(`🗑️ 服务器 ${uuid} 的旧连接已关闭并从连接池移除`);
    }
    // 更新服务器信息
    data[uuid].uuid = server.uuid
    data[uuid].name = server.name
    data[uuid].ip = serverip
    data[uuid].token = servertoken
    const success = await write_data(data)
    if (success) {
        console.log(`✅ 服务器 ${uuid} 信息修改成功，正在使用新配置连接...`);
        const updatedServerData = data[uuid]; // 获取更新后的数据
        connectToServer(updatedServerData); // 使用新配置连接
        // 等待连接建立
        await new Promise(resolve => {
            const checkConnection = () => {
                const connection = serverConnections[uuid];
                if (connection && connection.ws && connection.ws.readyState === WebSocket.OPEN) {
                    resolve();
                } else {
                    setTimeout(checkConnection, 100); // 每100毫秒检查一次
                }
            };
            setTimeout(checkConnection, 100);
        });

        if (data[uuid].name != servername) {
            try {
                const res = await sendActionToConnectedServer(uuid, '/api/v1/server/name/set', { name: servername });
                if (res.success) {
                    data[uuid].name = servername;
                    return { success: true, msg: '修改成功', server: data[uuid] };
                } else {
                    return { success: true, msg: '修改成功，但是修改名称失败: ' + res.msg, server: data[uuid] };
                }
            } catch (err) {
                console.error('修改服务器名称失败:', err);
                return { success: true, msg: '修改成功，但是修改名称失败: ' + err.message, server: data[uuid] };
            }
        }
        return { success: true, msg: '修改成功', server: data[uuid] }
    } else {
        return { success: false, msg: '修改失败' }
    }
}

export async function delete_server(token, uuid) {
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    const data = await get_data()
    if (!data) return { success: false, msg: '系统错误' }
    if (!data[uuid]) return { success: false, msg: '服务器不存在' }

    // --- 删除前关闭连接 ---
    if (serverConnections[uuid]) {
        console.log(`🔌 正在关闭服务器 ${uuid} 的连接...`);
        if (serverConnections[uuid].reconnectTimer) {
            clearTimeout(serverConnections[uuid].reconnectTimer);
        }
        if (serverConnections[uuid].ws && serverConnections[uuid].ws.readyState === WebSocket.OPEN) {
            serverConnections[uuid].ws.close();
        }
        delete serverConnections[uuid]; // 从连接池中移除
        console.log(`🗑️ 服务器 ${uuid} 的连接已关闭并从连接池移除`);
    }
    //----------------------------

    delete data[uuid]
    const success = await write_data(data)
    if (success) {
        return { success: true, msg: '删除成功' }
    } else {
        return { success: false, msg: '删除失败' }
    }
}

export async function add_server(token, serverip, servertoken) {
    console.log(`开始添加服务器 ${serverip}`)
    // 1. 认证检查
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    // 2. 获取现有数据
    const data = await get_data()
    if (!data) return { success: false, msg: '系统错误' }
    // 3. 验证服务器
    console.log(`开始验证服务器 ${serverip}`)
    const server = await verify_server(serverip, servertoken)
    if (!server || !server.success) {
        return { success: false, msg: server?.msg || '服务器验证失败' }
    }
    // 4. 检查服务器是否已存在（避免重复添加）
    if (data[server.uuid]) {
        return { success: false, msg: '服务器已存在' }
    }
    // 5. 添加新服务器到数据中（使用 UUID 作为键名）
    const newServerData = {
        uuid: server.uuid,
        name: server.name,
        ip: serverip,
        token: servertoken
    }
    data[server.uuid] = newServerData
    // 6. 保存数据
    const success = await write_data(data)
    if (success) {
        console.log(`服务器 ${server.uuid} 添加成功`)
        // --- 添加后立即尝试连接 ---
        connectToServer(newServerData);
        return {
            success: true,
            msg: '服务器添加成功',
            server: newServerData
        }
    } else {
        return { success: false, msg: '保存失败' }
    }
}

// 确保文件存在
export function serverensureDataFile() {
    // 检查文件夹是否存在，不存在就创建
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }
    // 检查文件是否存在，不存在就创建
    if (!fs.existsSync(dataPath)) {
        const defaultData = {}
        fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2))
    }
}

async function get_data() {
    serverensureDataFile()
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
        return data
    } catch (error) {
        console.error('读取数据失败:', error)
        return null
    }
}
async function write_data(data) {
    serverensureDataFile()
    try {
        const jsonData = JSON.stringify(data, null, 2)
        fs.writeFileSync(dataPath, jsonData)
        return true
    } catch (error) {
        console.error('写入数据失败:', error)
        return false
    }
}
async function verify_server(serverip, servertoken) {
    return new Promise((resolve) => {
        let ws;
        try {
            ws = new WebSocket(`ws://${serverip}`, {
                headers: {
                    'Authorization': `Bearer ${servertoken}`,
                    'Content-Type': 'application/json'
                }
            })
        } catch (error) {
            console.error('创建 WebSocket 连接失败:', error)
            resolve({ success: false, msg: `连接创建失败: ${error.message}` })
            return
        }

        // 主连接超时定时器
        const mainTimeout = setTimeout(() => {
            if (ws) {
                // 确保关闭事件被触发，清理可能存在的子定时器
                ws.removeAllListeners();
                ws.close();
            }
            // 注意：这里不直接 resolve，因为可能子定时器已经触发了
            // 但如果主定时器触发，说明整个过程超时了
            // 可以通过一个标志位来避免重复 resolve，但 Promise 本身会处理
            resolve({ success: false, msg: '连接总超时' });
        }, 10000); // 总超时时间

        // 子步骤超时定时器 (例如 5 秒)
        let stepTimeout;

        const clearAllTimeouts = () => {
            clearTimeout(mainTimeout);
            if (stepTimeout) {
                clearTimeout(stepTimeout);
                stepTimeout = null;
            }
        };

        ws.on('open', () => {
            clearAllTimeouts(); // 清除主连接超时
            console.log(`连接到服务器 ${serverip} 成功`)

            // 设置获取 UUID 的步骤超时
            stepTimeout = setTimeout(() => {
                console.error(`获取 UUID 超时 (${serverip})`);
                ws.close();
                resolve({ success: false, msg: '获取 UUID 超时' });
            }, 5000); // 5秒步骤超时

            // 先获取 UUID
            try {
                ws.send(JSON.stringify({
                    action: '/api/v1/server/uuid'
                }))
            } catch (sendError) {
                clearAllTimeouts();
                console.error('发送获取 UUID 消息失败:', sendError)
                ws.close();
                resolve({ success: false, msg: '发送获取 UUID 请求失败' })
            }
        })

        ws.on('message', (data) => {
            try {
                const msg = JSON.parse(data)
                if (msg.uuid) {
                    // 成功获取到 UUID
                    clearAllTimeouts(); // 清除 UUID 获取的超时
                    console.log(`获取到 UUID: ${msg.uuid}`)
                    ws.uuid = msg.uuid

                    // 设置获取名称的步骤超时
                    stepTimeout = setTimeout(() => {
                        console.error(`获取名称超时 (${serverip})`);
                        ws.close();
                        resolve({ success: false, msg: '获取名称超时' });
                    }, 5000); // 5秒步骤超时

                    // 获取到 UUID 后，获取名称
                    try {
                        ws.send(JSON.stringify({
                            action: '/api/v1/server/name'
                        }))
                    } catch (sendError) {
                        clearAllTimeouts();
                        console.error('发送获取名称请求失败:', sendError)
                        ws.close();
                        resolve({ success: false, msg: '发送获取名称请求失败' })
                    }
                }
                else if (msg.name) {
                    // 成功获取到名称，验证完成
                    clearAllTimeouts(); // 清除名称获取的超时
                    console.log(`获取到名称: ${msg.name}`)
                    const result = {
                        success: true,
                        uuid: ws.uuid,
                        name: msg.name,
                        ip: serverip
                    }
                    ws.close()
                    resolve(result)
                }
                else if (msg.error || msg.success === false) {
                    // 服务器返回错误
                    clearAllTimeouts();
                    console.log(`服务器返回错误: ${msg.error || '验证失败'}`)
                    ws.close()
                    resolve({ success: false, msg: msg.error || '验证失败' })
                }
            } catch (error) {
                clearAllTimeouts();
                console.error('解析响应失败:', error)
                console.log('原始数据:', data)
                ws.close()
                resolve({ success: false, msg: '解析响应失败' })
            }
        })

        ws.on('error', (error) => {
            clearAllTimeouts();
            console.error(`连接错误: ${error.message}`)
            let errorMsg = `连接错误: ${error.message}`
            if (error.message.includes('ECONNREFUSED')) {
                errorMsg = '连接被拒绝：服务器未启动或端口不可访问'
            } else if (error.message.includes('ENOTFOUND')) {
                errorMsg = '无法解析服务器地址：检查IP是否正确'
            } else if (error.message.includes('ETIMEDOUT')) {
                errorMsg = '连接超时：服务器无响应'
            }
            resolve({ success: false, msg: errorMsg })
        })

        ws.on('close', () => {
            // 当连接关闭时，确保清除所有定时器
            // 注意：close 事件可能在 resolve 之后由 ws 内部触发，所以要检查 ws 是否还存在
            if (ws) {
                clearAllTimeouts();
                // 只有在没有成功 resolve 的情况下才可能需要处理
                // 但由于 Promise 的特性，多次 resolve 只有第一次有效
                // 所以这里可以简化逻辑，主要确保定时器被清理
            }
            // 注意：不要在这里 resolve，因为 resolve 应该在 message/error/timeout 中处理
            // 如果因为超时而关闭，超时处理函数已经 resolve 了
            // 如果因为收到数据而关闭，message 处理函数已经 resolve 了
            // 如果因为错误而关闭，error 处理函数已经 resolve 了
            // 如果因为其他原因关闭且未 resolve，open 事件中未发送请求也可能导致此情况，
            // 但 open 事件中已经设置了主超时，主超时会处理。
        })
    })
}

export async function get_servers(token) {
    const authResult = await authentication(token);
    if (!authResult) return { success: false, msg: '认证失败' };
    const data = await get_data()
    if (!data) return { success: false, msg: '系统错误' }
    // 返回所有服务器的数组
    const servers = Object.values(data)
    return { success: true, servers: servers }
}


// --- 应用关闭时的清理函数 ---
export async function shutdownServerConnections() {
    console.log('🛑 正在关闭所有服务器连接...');
    isShuttingDown = true; // 设置关闭标志

    const closePromises = [];
    for (const uuid in serverConnections) {
        const connection = serverConnections[uuid];
        if (connection.reconnectTimer) {
            clearTimeout(connection.reconnectTimer);
        }
        if (connection.ws && connection.ws.readyState === WebSocket.OPEN) {
            console.log(`🔌 关闭服务器 ${uuid} 的连接...`);
            const closePromise = new Promise((resolve) => {
                connection.ws.once('close', () => {
                    console.log(`✅ 服务器 ${uuid} 的连接已关闭`);
                    resolve();
                });
                connection.ws.close();
            });
            closePromises.push(closePromise);
        } else {
            console.log(`⏭️ 服务器 ${uuid} 的连接已关闭或不存在`);
        }
        delete serverConnections[uuid]; // 从池中移除引用
    }

    if (closePromises.length > 0) {
        await Promise.allSettled(closePromises); // 等待所有连接关闭
    }
    console.log('✅ 所有服务器连接已关闭。');
}

