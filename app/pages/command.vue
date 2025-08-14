<template>
    <div class="mt-6 ml-6 flex flex-col lg:flex-row lg:items-center lg:justify-between">
        <div>
            <div class="text-2xl font-bold">执行命令</div>
            <div class="text-xl">执行控制台命令</div>
        </div>
    </div>
    <div class="mockup-window border border-base-300 mx-6 my-4 h-[81%] flex flex-col">
        <div class="border-t bg-base-200 border-base-300 h-full">
            <div class="h-[78%] md:h-[90%] w-full overflow-y-auto p-2">
                <p class="mb-1" v-for="(log, index) in commandLogs" :key="index" :class="getLogClass(log.type)">
                    [{{ log.timestamp }} {{ log.type.toUpperCase() }}]: {{ log.message }}
                </p>
            </div>
            <div class="h-auto border-t border-base-300 mx-2 flex flex-col sm:flex-row items-center mt-auto p-2 gap-2">
                <div class="dropdown dropdown-top w-full sm:w-48 join-item">
                    <div tabindex="0" role="button" class="btn w-full">{{ selectedServerName || '选择服务器' }}</div>
                    <ul tabindex="0" class="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm">
                        <li v-for="server in servers" :key="server.uuid">
                            <a @click="selectServer(server)">{{ server.name }}</a>
                        </li>
                    </ul>
                </div>
                <input type="text" placeholder="命令" class="input w-full join-item" v-model="commandInput"
                    @keyup.enter="executeCommand" />
                <button class="btn w-full sm:w-16 join-item" @click="executeCommand">发送</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const token = useCookie('auth_token');
const servers = ref([]);
const selectedServer = ref('');
const selectedServerName = ref('');
const commandInput = ref('');
const commandLogs = ref([]);

// 获取服务器列表
const getservers = async () => {
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
        addLog('info', `服务器列表获取成功`);
    } else {
        console.error(`服务器列表获取失败: ${result.msg}`);
        addLog('error', `服务器列表获取失败: ${result.msg}`);
    }
};

// 选择服务器
const selectServer = (server) => {
    selectedServer.value = server.uuid;
    selectedServerName.value = server.name;
};

// 添加日志到输出区域
const addLog = (type, message) => {
    const now = new Date();
    const timestamp = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    commandLogs.value.push({ type, message, timestamp });

    // 滚动到底部
    setTimeout(() => {
        const container = document.querySelector('.flex-1.w-full.overflow-y-auto');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, 0);
};

// 获取日志的CSS类
const getLogClass = (type) => {
    switch (type) {
        case 'info':
            return 'text-blue-400';
        case 'warn':
            return 'text-yellow-400';
        case 'error':
            return 'text-red-400';
        default:
            return 'text-gray-400';
    }
};

// 执行命令
const executeCommand = async () => {
    if (!selectedServer.value) {
        addLog('error', '请选择服务器');
        return;
    }

    if (!commandInput.value.trim()) {
        addLog('error', '请输入命令');
        return;
    }

    try {
        addLog('info', `[执行命令]: ${commandInput.value}`);

        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: selectedServer.value,
                action_name: '/api/v1/command/execute',
                params: {
                    command: commandInput.value
                }
            },
        });

        if (result.success) {
            addLog('info', `[命令返回]: ${result.response.result}`);
        } else {
            addLog('error', `命令执行失败: ${result.msg}`);
        }
    } catch (error) {
        addLog('error', `命令执行时发生错误: ${error.message}`);
    }
};

onMounted(async () => {
    await getservers();
});
</script>