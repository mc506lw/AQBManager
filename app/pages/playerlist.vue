<template>
    <div class="w-full bg-base-100">
        <div class="flex justify-between w-full outline-1 outline-base-300">
            <div class="flex w-full my-6">
                <div class="ml-6">
                    <div class="text-2xl font-bold">玩家管理</div>
                    <div class="text-xl">管理所有玩家</div>
                </div>
                <div class="ml-6 w-48 flex items-center justify-center">
                    <input type="checkbox" checked="checked" class="toggle toggle-md" v-model="onlineStatus"
                        @change="performSearch" />
                    <span class="ml-2">仅在线玩家</span>
                </div>
                <select class="select ml-6 mt-2 w-64" v-model="selectedServer">
                    <option value="">全部</option>
                    <option v-for="server in uniqueServers" :key="server" :value="server">{{ server }}</option>
                </select>
                <select class="select ml-6 mt-2 w-64" v-model="selectedQQGroup">
                    <option value="">全部</option>
                    <option v-for="group in uniqueQQGroups" :key="group" :value="group">{{ group }}</option>
                </select>
                <div class="join ml-6 mt-2 w-96">
                    <div>
                        <div>
                            <input class="input join-item" placeholder="搜索内容" v-model="searchInput"
                                @keyup.enter="performSearch" />
                        </div>
                    </div>
                    <div class="indicator">
                        <button class="btn join-item" @click="performSearch">搜索</button>
                    </div>
                </div>
            </div>
            <div class="mr-6 mt-8 w-96">
                <button class="btn btn-outline" @click="refreshData">刷新状态</button>
                <button class="btn btn-outline ml-4" onclick="addplayermodal.showModal()">添加玩家</button>
            </div>
        </div>
        <div class="overflow-auto h-[85vh]">
            <table class="table">
                <thead>
                    <tr>
                        <th class="w-16">在线状态</th>
                        <th class="w-96">ID</th>
                        <th class="w-96">QQ</th>
                        <th class="w-96">服务器</th>
                        <th class="w-120">QQ群</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in displayedItems" :key="index">
                        <td>
                            <span v-if="item.online" class="inline-block w-4 h-4 rounded-full bg-green-500"></span>
                        </td>
                        <td>
                            <div class="font-bold">{{ item.id }}</div>
                        </td>
                        <td>
                            {{ item.qq }}
                        </td>
                        <td>{{ item.server }}</td>
                        <td>{{ item.qq_group }}</td>
                        <th class="w-64">
                            <div class="join">
                                <button class="btn btn-soft btn-info join-item"
                                    @click="showPlayerDetails(item)">详细</button>
                                <button @click="showDeleteConfirm(item)"
                                    class="btn btn-soft btn-error join-item">删除</button>

                            </div>
                        </th>
                    </tr>
                </tbody>
            </table>
            <!-- 分页组件 -->
            <div class="join w-full mt-4 mb-4 justify-center" v-if="totalPages > 1">
                <button class="join-item btn" @click="goToPage(1)" :disabled="currentPage === 1">«</button>

                <!-- 显示当前页前后几页的按钮 -->
                <template v-for="page in displayedPages" :key="page">
                    <button class="join-item btn" :class="{ 'btn-active': page === currentPage }"
                        @click="goToPage(page)">
                        {{ page }}
                    </button>
                </template>

                <button class="join-item btn" @click="goToPage(totalPages)"
                    :disabled="currentPage === totalPages">»</button>
            </div>
        </div>
        <dialog id="playerinfomodal" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold">玩家详细信息</h3>
                <div v-if="currentPlayerDetails">
                    <div class="flex justify-between py-2">
                        <p>UUID:</p>
                        <p>{{ currentPlayerDetails.uuid }}</p>
                    </div>
                    <div class="flex justify-between py-2">
                        <p>在线状态:</p>
                        <p>{{ currentPlayerDetails.online ? '在线' : '离线' }}</p>
                    </div>
                    <div v-if="currentPlayerDetails.online" class="flex justify-between py-2">
                        <p>IP地址:</p>
                        <p>{{ currentPlayerDetails.ip }}</p>
                    </div>
                </div>
                <div v-else>
                    <p>加载中...</p>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>关闭</button>
            </form>
        </dialog>
        <dialog id="deleteconfirm" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold">确认删除玩家</h3>
                <p class="py-4">确认删除玩家 {{ currentDeletePlayer?.id }} 吗？</p>
                <div class="modal-action">
                    <button class="btn btn-error" @click="confirmDelete">确认删除</button>
                    <form method="dialog">
                        <button class="btn">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <dialog id="addplayermodal" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold">添加玩家</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-8.5">服务器</span>
                    </label>
                    <select class="select mt-2 w-64" v-model="selectedServer">
                        <option v-for="server in uniqueServers" :key="server" :value="server">{{ server }}</option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-10">QQ号</span>
                    </label>
                    <input v-model="newplayerqq" type="text" placeholder="请输入QQ号"
                        class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-8.5">玩家ID</span>
                    </label>
                    <input v-model="newplayerid" type="text" placeholder="请输入玩家ID"
                        class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="modal-action">
                    <button class="btn btn-success" @click="confirmAdd">确认添加</button>
                    <form method="dialog">
                        <button class="btn">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <div class="toast toast-end" v-if="showToast">
            <div
                :class="`alert alert-${toastType} transition-all duration-300 ease-in-out transform ${showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`">
                <span>{{ toastMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';

const items = ref([]);
const searchInput = ref('');
const searchText = ref('');
const selectedServer = ref('');
const selectedQQGroup = ref('');
const onlineStatus = ref(false); // 添加在线状态切换变量
const currentPlayerDetails = ref(null); // 添加存储玩家详细信息的变量
const currentDeletePlayer = ref(null); // 添加存储当前要删除的玩家信息的变量
const newplayerqq = ref(''); // 添加存储新玩家QQ号的变量
const newplayerid = ref(''); // 添加存储新玩家ID的变量

// Toast相关变量
const toastMessage = ref('');
const toastType = ref('info'); // 'info', 'success', 'warning', 'error'
const showToast = ref(false);

// 显示toast消息的函数
const showToastMessage = (message, type = 'info') => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;

    // 3秒后自动隐藏
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

// 分页相关变量
const currentPage = ref(1);
const itemsPerPage = 10;

// 计算唯一服务器列表
const uniqueServers = computed(() => {
    const servers = items.value.map(item => item.server);
    return [...new Set(servers)];
});

// 计算唯一QQ群列表
const uniqueQQGroups = computed(() => {
    const groups = [];
    items.value.forEach(item => {
        if (item.qq_group) {
            // 将逗号分隔的群组字符串拆分成单独的群组ID
            const groupIds = item.qq_group.split(', ').filter(id => id.trim() !== '');
            groups.push(...groupIds);
        }
    });
    return [...new Set(groups)];
});

// 计算筛选后的项目
const filteredItems = computed(() => {
    return items.value.filter(item => {
        // 仅显示在线玩家
        if (onlineStatus.value && !item.online) {
            return false;
        }

        // 服务器筛选
        if (selectedServer.value && item.server !== selectedServer.value) {
            return false;
        }

        // QQ群筛选
        if (selectedQQGroup.value && !item.qq_group.split(', ').includes(selectedQQGroup.value)) {
            return false;
        }

        // 搜索功能
            if (searchText.value) {
                const searchLower = searchText.value.toLowerCase();
                // 检查QQ群是否包含搜索关键词
                const qqGroupMatch = item.qq_group.split(', ').some(group => group.toLowerCase().includes(searchLower));
                return (
                    item.id.toLowerCase().includes(searchLower) ||
                    item.qq.toLowerCase().includes(searchLower) ||
                    item.server.toLowerCase().includes(searchLower) ||
                    qqGroupMatch
                );
            }

        return true;
    });
});

// 计算总页数
const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / itemsPerPage);
});

// 计算显示的页码（当前页前后几页）
const displayedPages = computed(() => {
    const pages = [];
    const delta = 2; // 当前页前后显示的页数

    const startPage = Math.max(1, currentPage.value - delta);
    const endPage = Math.min(totalPages.value, currentPage.value + delta);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
});

// 计算当前页显示的项目
const displayedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.value.slice(start, end);
});

// 翻页函数
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const performSearch = () => {
    // 将输入框的值赋给搜索文本，触发筛选
    searchText.value = searchInput.value;
    // 搜索时重置到第一页
    currentPage.value = 1;
};

const refreshData = async () => {
    // 重新获取服务器列表
    await getservers();
    // 重新获取玩家列表
    await getplayerlists();
    showToastMessage('数据已刷新', 'success');
};

onMounted(async () => {
    await getservers()
    await getplayerlists()

});

const token = useCookie('auth_token');
const playerlists = ref([])
const servers = ref([])

const getservers = async () => {
    const result = await $fetch('/api/servers', {
        method: 'POST',
        body: {
            action: 'get_servers',
            token: token.value
        },
    })
    if (result.success) {
        servers.value = result.servers
        console.log('服务器列表获取成功');
    } else {
        showToastMessage(`服务器列表获取失败: ${result.msg}`, 'error');
    }
}

const getplayerlists = async () => {
    // 清空之前的玩家列表
    playerlists.value = [];
    items.value = [];

    // 创建一个映射来跟踪已添加的玩家
    const addedPlayers = new Map();

    // 遍历所有服务器
    for (const server of servers.value) {
        try {
            const userResult = await $fetch('/api/servers', {
                method: 'POST',
                body: {
                    action: 'do_action',
                    token: token.value,
                    uuid: server.uuid,  // 使用服务器对象的uuid属性
                    action_name: '/api/v1/users'
                },
            });
            if (userResult.success && userResult.response) {
                console.log(`获取到玩家: ${userResult.msg}`);
                try {
                    // 获取在线玩家列表
                    const onlinePlayersResult = await $fetch('/api/servers', {
                        method: 'POST',
                        body: {
                            action: 'do_action',
                            token: token.value,
                            uuid: server.uuid,  // 使用服务器对象的uuid属性
                            action_name: '/api/v1/server/players'
                        },
                    });

                    // 处理在线玩家数据
                    let onlinePlayers = [];
                    if (onlinePlayersResult.success && onlinePlayersResult.response && onlinePlayersResult.response.players && Array.isArray(onlinePlayersResult.response.players)) {
                        onlinePlayers = onlinePlayersResult.response.players;
                    }

                    const groupResult = await $fetch('/api/servers', {
                        method: 'POST',
                        body: {
                            action: 'do_action',
                            token: token.value,
                            uuid: server.uuid,  // 使用服务器对象的uuid属性
                            action_name: '/api/v1/enable_groups'
                        },
                    });
                    if (groupResult.success && groupResult.response && Array.isArray(groupResult.response.groups)) {
                        // 创建一个映射来跟踪每个QQ号出现在哪些群组中
                        const qqGroupsMap = new Map();
                        
                        // 遍历群组列表，收集每个QQ号的群组信息
                        for (const group of groupResult.response.groups) {
                            try {
                                // 获取在群组的QQ列表
                                const qqListResult = await $fetch('/api/servers', {
                                    method: 'POST',
                                    body: {
                                        action: 'do_action',
                                        token: token.value,
                                        uuid: server.uuid,  // 使用服务器对象的uuid属性
                                        action_name: '/api/v1/enable_groups/users',
                                        params: { group_id: group }

                                    },
                                });
                                console.log(`获取到群组: ${qqListResult.msg}`);

                                // 处理数据
                                if (qqListResult.success && qqListResult.response) {
                                    // 处理群组数据
                                    const groupUsers = qqListResult.response;
                                    
                                    // 遍历群组成员
                                    for (const [qq, name] of Object.entries(groupUsers)) {
                                        // 如果QQ号还没有记录，初始化一个空数组
                                        if (!qqGroupsMap.has(qq)) {
                                            qqGroupsMap.set(qq, []);
                                        }
                                        // 将当前群组ID添加到该QQ号的群组列表中
                                        qqGroupsMap.get(qq).push(group);
                                    }
                                }
                            } catch (error) {
                                showToastMessage(`获取群组QQ列表失败: ${error.message}`, 'error');
                            }
                        }
                        
                        // 处理玩家数据
                        const players = userResult.response;
                        
                        // 遍历玩家数据
                        for (const [qq, playerNames] of Object.entries(players)) {
                            // 确保playerNames是数组
                            const names = Array.isArray(playerNames) ? playerNames : [playerNames];
                            // 遍历玩家名
                            for (const playerName of names) {
                                // 创建唯一标识符
                                const playerKey = `${server.uuid}-${qq}-${playerName}`;
                                
                                // 检查玩家是否已经添加过
                                if (!addedPlayers.has(playerKey)) {
                                    // 检查玩家是否在线
                                    const isOnline = onlinePlayers.includes(playerName);

                                    // 获取该QQ号所在的群组列表
                                    const qqGroups = qqGroupsMap.get(qq) || [];

                                    // 创建展示项，将群组列表合并显示
                                    const item = {
                                        id: playerName,
                                        qq: qq,
                                        server: server.name || server.uuid,
                                        qq_group: qqGroups.join(', '), // 以逗号分隔的群组列表
                                        online: isOnline // 添加在线状态
                                    };

                                    // 添加到展示列表
                                    items.value.push(item);
                                    
                                    // 标记玩家已添加
                                    addedPlayers.set(playerKey, true);
                                }
                            }
                        }
                    } else {
                        showToastMessage(`获取群组失败: ${groupResult.msg}`, 'warning');
                    }
                } catch (error) {
                    showToastMessage(`获取服务器 ${server.uuid} 群组失败: ${error.message}`, 'error');
                }
            } else {
                showToastMessage(`获取玩家失败: ${userResult.msg}`, 'warning');
            }
        } catch (error) {
            console.error(`服务器 ${server.uuid} 操作失败:`, error);
        }
    }
};

// 获取玩家详细信息
const getPlayerDetails = async (playerId, serverUuid) => {
    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: serverUuid,
                action_name: '/api/v1/server/player',
                params: { player: playerId }
            },
        });
        if (result.success && result.response) {
            return result.response;
        } else {
            showToastMessage(`获取玩家详细信息失败: ${result.msg}`, 'error');
            return null;
        }
    } catch (error) {
        showToastMessage(`获取玩家详细信息时发生错误: ${error.message}`, 'error');
        return null;
    }
};

const showPlayerDetails = async (player) => {
    // 获取玩家详细信息
    const details = await getPlayerDetails(player.id, getServersUuidByName(player.server));
    if (details) {
        currentPlayerDetails.value = details;
        // 显示模态框
        document.getElementById('playerinfomodal').showModal();
    }
};

// 显示删除确认模态框
const showDeleteConfirm = (player) => {
    currentDeletePlayer.value = player;
    document.getElementById('deleteconfirm').showModal();
};

// 确认删除玩家
const confirmDelete = async () => {
    if (!currentDeletePlayer.value) return;

    try {
        const serverUuid = getServersUuidByName(currentDeletePlayer.value.server);
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: serverUuid,
                action_name: '/api/v1/users/unbind',
                params: {
                    qq: currentDeletePlayer.value.qq,
                    player: currentDeletePlayer.value.id
                }
            },
        });

        if (result.success && result.response) {
            if (result.response.status === 'success') {
                // 删除成功，从列表中移除该玩家
                const index = items.value.findIndex(item =>
                    item.id === currentDeletePlayer.value.id &&
                    item.qq === currentDeletePlayer.value.qq
                );
                if (index !== -1) {
                    items.value.splice(index, 1);
                }
                // 关闭模态框
                document.getElementById('deleteconfirm').close();
                showToastMessage('玩家删除成功', 'success');
            } else {
                showToastMessage(`删除玩家失败: ${result.response.message}`, 'error');
            }
        } else {
            showToastMessage(`删除玩家失败: ${result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`删除玩家时发生错误: ${error.message}`, 'error');
    }
};

// 根据服务器名称获取UUID
const getServersUuidByName = (serverName) => {
    const server = servers.value.find(s => s.name === serverName || s.uuid === serverName);
    return server ? server.uuid : null;
};

// 确认添加玩家
const confirmAdd = async () => {
    // 检查必填字段
    if (!selectedServer.value) {
        showToastMessage('请选择服务器', 'warning');
        return;
    }
    if (!newplayerqq.value) {
        showToastMessage('请输入QQ号', 'warning');
        return;
    }
    if (!newplayerid.value) {
        showToastMessage('请输入玩家ID', 'warning');
        return;
    }

    try {
        const serverUuid = getServersUuidByName(selectedServer.value);
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: serverUuid,
                action_name: '/api/v1/users/bind',
                params: {
                    qq: newplayerqq.value,
                    player: newplayerid.value
                }
            },
        });

        if (result.success && result.response) {
            if (result.response.status === 'success') {
                // 添加成功，刷新数据
                await refreshData();
                // 关闭模态框
                document.getElementById('addplayermodal').close();
                // 清空输入框
                newplayerqq.value = '';
                newplayerid.value = '';
                showToastMessage('玩家添加成功', 'success');
            } else {
                showToastMessage(`添加玩家失败: ${result.response.message}`, 'error');
            }
        } else {
            showToastMessage(`添加玩家失败: ${result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`添加玩家时发生错误: ${error.message}`, 'error');
    }
};
</script>