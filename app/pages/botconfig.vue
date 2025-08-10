<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col md:flex-row justify-between w-full border-b border-base-300">
      <div class="mt-2 p-4 ml-6">
        <div class="text-2xl font-bold">OneBot配置</div>
        <div class="text-xl">配置OneBot连接信息</div>
      </div>
      <div class="mr-6 mt-4 md:mt-8 mb-4 md:mb-0 flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
        <button class="btn btn-outline" @click="refreshData">刷新</button>
        <select class="select select-bordered w-full md:w-64" v-model="selectedServer">
          <option value="">请选择服务器</option>
          <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}</option>
        </select>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto mx-6 p-4">
      <div v-if="!selectedServer">
        <p class="text-center text-gray-500 py-10">请选择服务器以查看和编辑OneBot配置</p>
      </div>
      <div v-else>
        <div class="mb-6 p-4 bg-base-100 rounded-lg">
          <div class="mb-2">
            <h3 class="font-bold text-lg">OneBot连接状态</h3>
            <p class="text-sm text-gray-500 mt-1">当前服务器的OneBot连接状态</p>
          </div>
          <div class="mt-3">
            <div class="badge badge-primary" :class="{'badge-success': isConnected, 'badge-error': !isConnected}">
              {{ isConnected ? '已连接' : '未连接' }}
            </div>
          </div>
        </div>
        
        <div class="mb-6 p-4 bg-base-100 rounded-lg">
          <div class="mb-2">
            <h3 class="font-bold text-lg">OneBot配置信息</h3>
            <p class="text-sm text-gray-500 mt-1">配置OneBot后端连接信息</p>
          </div>
          
          <div class="mt-3 mb-4">
            <label class="label">
              <span class="label-text">主机地址</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered w-full" 
              v-model="oneBotConfig.host" 
              placeholder="请输入OneBot后端服务器地址"
            />
          </div>
          
          <div class="mt-3 mb-4">
            <label class="label">
              <span class="label-text">端口</span>
            </label>
            <input 
              type="number" 
              class="input input-bordered w-full" 
              v-model="oneBotConfig.port" 
              placeholder="请输入OneBot后端服务器端口"
            />
          </div>
          
          <div class="mt-3 mb-4">
            <label class="label">
              <span class="label-text">访问令牌</span>
            </label>
            <input 
              type="text" 
              class="input input-bordered w-full" 
              v-model="oneBotConfig.access_token" 
              placeholder="请输入OneBot后端服务器的访问令牌"
            />
          </div>
          
          <div class="mt-3 flex space-x-2">
            <button class="btn btn-sm btn-primary" @click="saveConfig">保存配置</button>
            <button class="btn btn-sm" @click="checkConnection">检查连接</button>
          </div>
        </div>
      </div>
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
import { ref, computed, watch } from 'vue';

const token = useCookie('auth_token');
const servers = ref([]);
const selectedServer = ref('');

// OneBot配置
const oneBotConfig = ref({
  host: '',
  port: 3001,
  access_token: ''
});

// 连接状态
const isConnected = ref(false);

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
    await loadOneBotConfig();
    await checkConnection();
  }
};

// 加载OneBot配置
const loadOneBotConfig = async () => {
  if (!selectedServer.value) return;
  
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/onebot/info',
        params: {}
      },
    });
    
    if (result.success) {
      oneBotConfig.value = {
        host: result.response.host || '',
        port: result.response.port || 3001,
        access_token: result.response.access_token || ''
      };
      showToastMessage('配置加载成功', 'success');
    } else {
      showToastMessage(`配置加载失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`加载配置时发生错误: ${error.message}`, 'error');
  }
};

// 保存OneBot配置
const saveConfig = async () => {
  if (!selectedServer.value) return;
  
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/onebot/set',
        params: {
          host: oneBotConfig.value.host,
          port: parseInt(oneBotConfig.value.port),
          access_token: oneBotConfig.value.access_token
        }
      },
    });
    
    if (result.success) {
      showToastMessage('配置保存成功', 'success');
    } else {
      showToastMessage(`配置保存失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`保存配置时发生错误: ${error.message}`, 'error');
  }
};

// 检查连接状态
const checkConnection = async () => {
  if (!selectedServer.value) return;
  
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/onebot/status',
        params: {}
      },
    });
    
    if (result.success) {
      isConnected.value = result.response.connected || false;
      showToastMessage(`连接状态检查成功: ${isConnected.value ? '已连接' : '未连接'}`, 'success');
    } else {
      showToastMessage(`连接状态检查失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`检查连接状态时发生错误: ${error.message}`, 'error');
  }
};

// 监听服务器选择变化
watch(selectedServer, async (newVal) => {
  if (newVal) {
    await loadOneBotConfig();
    await checkConnection();
  }
});

// 组件挂载时获取服务器列表
onMounted(() => {
  getservers();
});
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>