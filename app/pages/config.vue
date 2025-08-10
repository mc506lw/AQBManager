<template>
    <div class="flex flex-col h-full">
        <div class="flex flex-col md:flex-row justify-between w-full border-b border-base-300">
            <div class="mt-2 p-4 ml-6">
                <div class="text-2xl font-bold">插件配置</div>
                <div class="text-xl">更改插件配置项</div>
            </div>
            <div class="mr-6 mt-4 md:mt-8 mb-4 md:mb-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
                <button class="btn btn-outline" @click="refreshData">刷新</button>
                <select class="select select-bordered w-full md:w-64" v-model="selectedServer">
                    <option value="">请选择服务器</option>
                    <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}</option>
                </select>
                <button class="btn btn-primary hidden md:inline-block" @click="saveAllConfig"
                    :disabled="!selectedServer">保存全部</button>
                <button class="btn hidden md:inline-block" @click="resetAllConfig"
                    :disabled="!selectedServer">恢复默认</button>
            </div>
        </div>
        <div class="flex-1 overflow-y-auto mx-6 p-4">
            <div v-if="!selectedServer">
                <p class="text-center text-gray-500 py-10">请选择服务器以查看和编辑配置</p>
            </div>
            <div v-else>
                <div v-for="(item, index) in configItems" :key="index" class="mb-6 p-4 bg-base-100 rounded-lg">
                    <div class="mb-2">
                        <h3 class="font-bold text-lg">{{ item.name }}</h3>
                        <p class="text-sm text-gray-500 mt-1">{{ item.description }}</p>
                    </div>
                    <div class="mt-3">
                        <input v-if="item.type === 'boolean'" type="checkbox" class="toggle toggle-primary"
                            :checked="item.value" @change="item.value = $event.target.checked" />
                        <input v-else-if="item.type === 'array'" type="text" class="input input-bordered w-full"
                            :value="formatArrayValue(item.value)"
                            @input="updateArrayValue(item, $event.target.value)" />
                        <input v-else type="text" class="input input-bordered w-full" v-model="item.value" />
                    </div>
                    <div class="mt-3 flex space-x-2">
                        <button class="btn btn-sm btn-primary" @click="saveConfigItem(item.key, item.value)">保存</button>
                        <button class="btn btn-sm" @click="resetConfigItem(item.key)">默认</button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 底部固定操作按钮 -->
        <div class="w-full h-16 flex items-center justify-end pr-6 border-t border-base-300">
            <button class="btn btn-primary mr-2" @click="saveAllConfig" :disabled="!selectedServer">保存全部</button>
            <button class="btn" @click="resetAllConfig" :disabled="!selectedServer">恢复默认</button>
        </div>

        <!-- Toast 组件 -->
        <div class="toast toast-end">
            <div v-if="toastMessage" :class="['alert', toastClass]">
                <span>{{ toastMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';

const token = useCookie('auth_token');
const servers = ref([]);
const selectedServer = ref('');

// 配置项数据
const configItems = ref([]);

// Toast 相关
const toastMessage = ref('');
const toastType = ref('');

const toastClass = computed(() => {
    switch (toastType.value) {
        case 'success':
            return 'alert-success';
        case 'error':
            return 'alert-error';
        case 'warning':
            return 'alert-warning';
        default:
            return 'alert-info';
    }
});

const showToastMessage = (message, type) => {
    toastMessage.value = message;
    toastType.value = type;
    setTimeout(() => {
        toastMessage.value = '';
        toastType.value = '';
    }, 3000);
};

// 获取服务器列表
const getservers = async () => {
    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'get_servers',
                token: token.value
            },
        });
        if (result.success) {
            servers.value = result.servers;
            console.log('服务器列表获取成功');
        } else {
            showToastMessage(`服务器列表获取失败: ${result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`获取服务器列表时发生错误: ${error.message}`, 'error');
    }
};

// 刷新数据
const refreshData = async () => {
    await getservers();
    if (selectedServer.value) {
        await loadServerConfig();
    }
};

// 加载服务器配置
const loadServerConfig = async () => {
    if (!selectedServer.value) return;

    try {
        // 获取完整配置
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: selectedServer.value,
                action_name: '/api/v1/config/get',
                params: {
                    key: ''
                }
            },
        });

        if (result.success) {
            // 解析配置并构建界面
            parseConfig(result.response.value);
            showToastMessage('配置加载成功', 'success');
        } else {
            showToastMessage(`配置加载失败: ${result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`加载配置时发生错误: ${error.message}`, 'error');
    }
};

// 解析YAML配置文件内容
const parseConfig = (configData) => {
    // 根据实际的YAML文件结构来解析
    configItems.value = [
        // 存储相关配置
        {
            key: 'storage.type',
            name: '存储方式',
            description: '可选方式: file, sqlite, mysql',
            value: configData.storage?.type || 'file',
            type: 'string'
        },
        {
            key: 'storage.sqlite.file',
            name: 'SQLite数据库文件',
            description: 'SQLite数据库文件路径',
            value: configData.storage?.sqlite?.file || 'aqqbot.db',
            type: 'string'
        },
        {
            key: 'storage.mysql.host',
            name: 'MySQL主机地址',
            description: 'MySQL数据库主机地址',
            value: configData.storage?.mysql?.host || '127.0.0.1',
            type: 'string'
        },
        {
            key: 'storage.mysql.port',
            name: 'MySQL端口',
            description: 'MySQL数据库端口号',
            value: configData.storage?.mysql?.port || 3306,
            type: 'number'
        },
        {
            key: 'storage.mysql.user',
            name: 'MySQL用户名',
            description: 'MySQL数据库用户名',
            value: configData.storage?.mysql?.user || 'root',
            type: 'string'
        },
        {
            key: 'storage.mysql.password',
            name: 'MySQL密码',
            description: 'MySQL数据库密码',
            value: configData.storage?.mysql?.password || '123456',
            type: 'string'
        },
        {
            key: 'storage.mysql.database',
            name: 'MySQL数据库名',
            description: 'MySQL数据库名称',
            value: configData.storage?.mysql?.database || 'aqqbot',
            type: 'string'
        },

        // 白名单配置
        {
            key: 'whitelist.enable',
            name: '是否启用白名单功能',
            description: '是否启用白名单功能',
            value: configData.whitelist?.enable || false,
            type: 'boolean'
        },
        {
            key: 'whitelist.need_bind_to_login',
            name: '是否必须绑定后才能进入游戏',
            description: '是否必须绑定后才能进入游戏',
            value: configData.whitelist?.need_bind_to_login || true,
            type: 'boolean'
        },
        {
            key: 'whitelist.verify_method',
            name: '验证方法',
            description: '验证方法: GROUP_NAME, VERIFY_CODE',
            value: configData.whitelist?.verify_method || 'GROUP_NAME',
            type: 'string'
        },
        {
            key: 'whitelist.verify_code_expire_time',
            name: '验证码过期时间',
            description: '验证码过期时间(秒)',
            value: configData.whitelist?.verify_code_expire_time || 300,
            type: 'number'
        },
        {
            key: 'whitelist.max_bind_count',
            name: '一个QQ号最多可以绑定多少个账户',
            description: '一个QQ号最多可以绑定多少个账户',
            value: configData.whitelist?.max_bind_count || 1,
            type: 'number'
        },
        {
            key: 'whitelist.name_rule',
            name: '名称验证规则',
            description: '名称验证规则(正则表达式)',
            value: configData.whitelist?.name_rule || '[\S]*',
            type: 'string'
        },
        {
            key: 'whitelist.unbind_on_leave',
            name: '是否开启退群自动解绑',
            description: '是否开启退群自动解绑',
            value: configData.whitelist?.unbind_on_leave || true,
            type: 'boolean'
        },
        {
            key: 'whitelist.cooldown.bind',
            name: '绑定指令的冷却时间',
            description: '绑定指令的冷却时间(秒)',
            value: configData.whitelist?.cooldown?.bind || 60,
            type: 'number'
        },
        {
            key: 'whitelist.cooldown.unbind',
            name: '解绑指令的冷却时间',
            description: '解绑指令的冷却时间(秒)',
            value: configData.whitelist?.cooldown?.unbind || 86400,
            type: 'number'
        },
        {
            key: 'whitelist.change_nickname_on_bind.enable',
            name: '是否启用绑定后修改群名称功能',
            description: '是否启用绑定后修改群名称功能',
            value: configData.whitelist?.change_nickname_on_bind?.enable || false,
            type: 'boolean'
        },
        {
            key: 'whitelist.change_nickname_on_bind.format',
            name: '修改群昵称的格式',
            description: '修改群昵称的格式',
            value: configData.whitelist?.change_nickname_on_bind?.format || '[${nickName}] ${playerName}',
            type: 'string'
        },
        {
            key: 'whitelist.prefix.bind',
            name: '绑定指令前缀',
            description: '绑定指令前缀',
            value: configData.whitelist?.prefix?.bind || ['/绑定', '/bind'],
            type: 'array'
        },
        {
            key: 'whitelist.prefix.unbind',
            name: '解绑指令前缀',
            description: '解绑指令前缀',
            value: configData.whitelist?.prefix?.unbind || ['/解绑', '/unbind'],
            type: 'array'
        },
        {
            key: 'whitelist.admin.bind',
            name: '管理绑定指令前缀',
            description: '管理绑定指令前缀',
            value: configData.whitelist?.admin?.bind || ['/管理绑定', '/abind'],
            type: 'array'
        },
        {
            key: 'whitelist.admin.unbind',
            name: '管理解绑指令前缀',
            description: '管理解绑指令前缀',
            value: configData.whitelist?.admin?.unbind || ['/管理解绑', '/aunbind'],
            type: 'array'
        },

        // 信息查询配置
        {
            key: 'information.list.enable',
            name: '是否启用查询服务器在线玩家功能',
            description: '是否启用查询服务器在线玩家功能',
            value: configData.information?.list?.enable || true,
            type: 'boolean'
        },
        {
            key: 'information.list.filter',
            name: '查询服务器在线玩家过滤规则',
            description: '查询服务器在线玩家过滤规则',
            value: configData.information?.list?.filter || [''],
            type: 'array'
        },

        // 聊天配置
        {
            key: 'chat.max_forward_length',
            name: '最大转发字数',
            description: '最大转发字数(多余的会被替换为...)',
            value: configData.chat?.max_forward_length || 200,
            type: 'number'
        },
        {
            key: 'chat.group_to_server.enable',
            name: '是否启用群->服聊天转发功能',
            description: '是否启用群->服聊天转发功能',
            value: configData.chat?.group_to_server?.enable || true,
            type: 'boolean'
        },
        {
            key: 'chat.group_to_server.vc_broadcast',
            name: '是否将消息发送到所有子服',
            description: '是否将消息发送到所有子服(仅Velocity可用)',
            value: configData.chat?.group_to_server?.vc_broadcast || false,
            type: 'boolean'
        },
        {
            key: 'chat.group_to_server.prefix',
            name: '群->服聊天转发前缀',
            description: '群->服聊天转发前缀',
            value: configData.chat?.group_to_server?.prefix || [''],
            type: 'array'
        },
        {
            key: 'chat.group_to_server.filter',
            name: '群->服聊天过滤规则',
            description: '群->服聊天过滤规则',
            value: configData.chat?.group_to_server?.filter || [''],
            type: 'array'
        },
        {
            key: 'chat.server_to_group.enable',
            name: '是否启用服->群聊天转发功能',
            description: '是否启用服->群聊天转发功能',
            value: configData.chat?.server_to_group?.enable || true,
            type: 'boolean'
        },
        {
            key: 'chat.server_to_group.filter',
            name: '服->群聊天过滤规则',
            description: '服->群聊天过滤规则',
            value: configData.chat?.server_to_group?.filter || [''],
            type: 'array'
        },
        {
            key: 'chat.server_to_group.default_format',
            name: '是否格式化消息',
            description: '是否格式化消息(将颜色符号去除)',
            value: configData.chat?.server_to_group?.default_format || true,
            type: 'boolean'
        },
        {
            key: 'chat.server_to_group.prefix',
            name: '服->群聊天转发前缀',
            description: '服->群聊天转发前缀',
            value: configData.chat?.server_to_group?.prefix || [''],
            type: 'array'
        },

        // 通知配置
        {
            key: 'notify.server_status.enable',
            name: '是否开启服务器启停通知',
            description: '是否开启服务器启停通知',
            value: configData.notify?.server_status?.enable || true,
            type: 'boolean'
        },
        {
            key: 'notify.server_status.start',
            name: '服务器启动通知消息',
            description: '服务器启动时发送的消息',
            value: configData.notify?.server_status?.start || '[AQQBot] XXX服务器已启动!',
            type: 'string'
        },
        {
            key: 'notify.server_status.stop',
            name: '服务器关闭通知消息',
            description: '服务器关闭时发送的消息',
            value: configData.notify?.server_status?.stop || '[AQQBot] XXX服务器已关闭!',
            type: 'string'
        },
        {
            key: 'notify.player_status.enable',
            name: '是否开启玩家进出通知',
            description: '是否开启玩家进出通知',
            value: configData.notify?.player_status?.enable || true,
            type: 'boolean'
        },
        {
            key: 'notify.player_status.join',
            name: '玩家进入通知消息',
            description: '玩家进入时发送的消息',
            value: configData.notify?.player_status?.join || '[AQQBot] ${playerName}(${userId}) 进入了服务器!',
            type: 'string'
        },
        {
            key: 'notify.player_status.leave',
            name: '玩家离开通知消息',
            description: '玩家离开时发送的消息',
            value: configData.notify?.player_status?.leave || '[AQQBot] ${playerName}(${userId}) 离开了服务器!',
            type: 'string'
        },

        // 命令执行配置
        {
            key: 'command_execution.enable',
            name: '是否启用命令远程执行功能',
            description: '是否启用命令远程执行功能',
            value: configData.command_execution?.enable || true,
            type: 'boolean'
        },
        {
            key: 'command_execution.format',
            name: '是否格式化命令输出消息',
            description: '是否格式化命令输出消息(将颜色符号去除)',
            value: configData.command_execution?.format || true,
            type: 'boolean'
        },
        {
            key: 'command_execution.delay',
            name: '等待输出结果时间',
            description: '等待输出结果多长时间(秒)',
            value: configData.command_execution?.delay || 2,
            type: 'number'
        },
        {
            key: 'command_execution.prefix',
            name: '命令执行前缀',
            description: '命令执行前缀',
            value: configData.command_execution?.prefix || ['/sudo', '/执行'],
            type: 'array'
        },
        {
            key: 'command_execution.sort',
            name: '执行命令的方案排序',
            description: '执行命令的方案排序',
            value: configData.command_execution?.sort || ['NATIVE', 'DECIDATED_SERVER', 'MINECRAFT_SERVER', 'SIMULATE_CONSOLE'],
            type: 'array'
        },
        {
            key: 'command_execution.allow_users',
            name: '允许使用该功能的人',
            description: '允许使用该功能的人',
            value: configData.command_execution?.allow || ['$ADMIN'],
            type: 'array'
        },
        {
            key: 'command_execution.filter',
            name: '命令执行过滤规则',
            description: '命令执行过滤规则',
            value: configData.command_execution?.filter || [''],
            type: 'array'
        },

        // Webhook配置
        {
            key: 'webhook.enable',
            name: '是否启用Webhook功能',
            description: '是否启用Webhook功能',
            value: configData.webhook?.enable || false,
            type: 'boolean'
        },
        {
            key: 'webhook.host',
            name: 'Webhook主机地址',
            description: '远程WebSocket服务器地址',
            value: configData.webhook?.host || '0.0.0.0',
            type: 'string'
        },
        {
            key: 'webhook.port',
            name: 'Webhook端口',
            description: '远程WebSocket服务器端口',
            value: configData.webhook?.port || 8080,
            type: 'number'
        },
        {
            key: 'webhook.token',
            name: 'Webhook Token',
            description: '远程WebSocket服务器Token',
            value: configData.webhook?.token || 'type_your_token_here',
            type: 'string'
        },
        {
            key: 'webhook.name',
            name: '服务器名称',
            description: '服务器的名称',
            value: configData.webhook?.name || 'A Minecraft Server',
            type: 'string'
        },
        {
            key: 'webhook.filter',
            name: 'Webhook过滤规则',
            description: 'Webhook过滤规则',
            value: configData.webhook?.filter || [''],
            type: 'array'
        },

        // 调试配置
        {
            key: 'debug.enable',
            name: '是否启用调试功能',
            description: '是否启用调试功能',
            value: configData.debug?.enable || false,
            type: 'boolean'
        },
        {
            key: 'debug.logger.enable',
            name: '是否启用日志调试功能',
            description: '是否启用日志调试功能',
            value: configData.debug?.logger?.enable || true,
            type: 'boolean'
        },
        {
            key: 'debug.logger.file',
            name: '日志存储文件名',
            description: '日志存储文件名',
            value: configData.debug?.logger?.file || 'debug.log',
            type: 'string'
        },
        {
            key: 'debug.logger.save_interval',
            name: '日志保存间隔',
            description: '每隔多长时间保存一次日志文件(秒)',
            value: configData.debug?.logger?.save_interval || 0,
            type: 'number'
        }
    ];
};

// 格式化数组值显示
const formatArrayValue = (arr) => {
    // 处理null或undefined的情况
    if (!arr || !Array.isArray(arr)) return '';
    return arr.join(', ');
};

// 更新数组值
const updateArrayValue = (item, value) => {
    // 处理null或undefined的情况
    if (value === null || value === undefined) {
        item.value = [];
        return;
    }
    item.value = value.split(',').map(v => v.trim()).filter(v => v);
};

// 保存单个配置项
const saveConfigItem = async (key, value) => {
    if (!selectedServer.value) return;

    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: selectedServer.value,
                action_name: '/api/v1/config/set',
                params: {
                    key: key,
                    value: value
                }
            },
        });

        if (result.success && result.response.status === 'success') {
            showToastMessage(`配置项 ${key} 保存成功`, 'success');
        } else {
            showToastMessage(`配置项保存失败: ${result.response?.message || result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`保存配置项时发生错误: ${error.message}`, 'error');
    }
};

// 保存全部配置
const saveAllConfig = async () => {
    if (!selectedServer.value) return;

    try {
        // 显示保存中提示
        showToastMessage('正在保存全部配置...', 'info');

        // 遍历所有配置项并保存
        const savePromises = configItems.value.map(item =>
            saveConfigItem(item.key, item.value)
        );

        // 等待所有保存操作完成
        await Promise.all(savePromises);

        // 显示成功提示
        showToastMessage('全部配置保存成功', 'success');
    } catch (error) {
        showToastMessage(`保存全部配置时发生错误: ${error.message}`, 'error');
    }
};

// 恢复所有默认配置
const resetAllConfig = async () => {
    if (!selectedServer.value) return;

    try {
        // 显示恢复中提示
        showToastMessage('正在恢复默认配置...', 'info');

        // 遍历所有配置项并恢复默认值
        const resetPromises = configItems.value.map(item =>
            resetConfigItem(item.key)
        );

        // 等待所有恢复操作完成
        await Promise.all(resetPromises);

        // 重新加载配置
        await loadServerConfig();

        // 显示成功提示
        showToastMessage('已恢复默认配置', 'success');
    } catch (error) {
        showToastMessage(`恢复默认配置时发生错误: ${error.message}`, 'error');
    }
};

// 重置单个配置项为默认值
const resetConfigItem = async (key) => {
    if (!selectedServer.value) return;

    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: selectedServer.value,
                action_name: '/api/v1/config/set',
                params: {
                    key: key,
                    value: null  // 传入null表示恢复默认值
                }
            },
        });

        if (result.success && result.response.status === 'success') {
            showToastMessage(`配置项 ${key} 已恢复默认值`, 'success');
            // 重新加载配置以显示默认值
            await loadServerConfig();
        } else {
            showToastMessage(`配置项 ${key} 恢复默认值失败: ${result.response?.message || result.msg}`, 'error');
        }
    } catch (error) {
        showToastMessage(`恢复配置项 ${key} 默认值时发生错误: ${error.message}`, 'error');
    }
};

// 监听服务器选择变化
watch(selectedServer, (newVal) => {
    if (newVal) {
        loadServerConfig();
    } else {
        configItems.value = [];
    }
});

onMounted(async () => {
    await getservers();
});
</script>