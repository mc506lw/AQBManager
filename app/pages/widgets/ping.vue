<template>
  <div class="bg-base-100 p-6">
    <!-- 标题区域 -->
    <div class="mb-8">
      <h1 @click="navigateTo('/widgets')" class="text-3xl font-bold cursor-pointer">← Ping工具</h1>
      <p class="text-sm text-base-content/70 mt-2">输入服务器IP地址获取服务器信息</p>
    </div>

    <!-- 输入区域 -->
    <div class="mb-8">
      <div class="form-control w-full max-w-xs">
        <label class="label">
          <span class="label-text">服务器IP地址</span>
        </label>
        <div class="flex space-x-2">
          <input 
            v-model="serverIP" 
            type="text" 
            placeholder="例如: mc.hypixel.net:25565" 
            class="input input-bordered w-full max-w-xs flex-1" 
            @keyup.enter="fetchServerInfo"
          />
          <button 
            class="btn btn-primary" 
            @click="fetchServerInfo"
            :disabled="loading"
          >
            {{ loading ? '查询中...' : '查询' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 结果显示区域 -->
    <div v-if="serverInfo" class="mb-8">
      <h2 class="text-2xl font-bold mb-4">服务器信息</h2>
      <div class="overflow-x-auto">
        <table class="table w-full">
          <tbody>
            <tr>
              <td class="font-bold w-1/4">主机名</td>
              <td>{{ serverInfo.hostname || 'N/A' }}</td>
            </tr>
            <tr>
              <td class="font-bold">IP地址</td>
              <td>{{ serverInfo.ip || 'N/A' }}</td>
            </tr>
            <tr>
              <td class="font-bold">端口</td>
              <td>{{ serverInfo.port || 'N/A' }}</td>
            </tr>
            <tr>
              <td class="font-bold">在线状态</td>
              <td>
                <div class="badge" :class="serverInfo.online ? 'badge-success' : 'badge-error'">
                  {{ serverInfo.online ? '在线' : '离线' }}
                </div>
              </td>
            </tr>
            <tr v-if="serverInfo.online">
              <td class="font-bold">版本</td>
              <td>{{ serverInfo.version || 'N/A' }}</td>
            </tr>
            <tr v-if="serverInfo.online">
              <td class="font-bold">协议版本</td>
              <td>{{ serverInfo.protocol || 'N/A' }}</td>
            </tr>
            <tr v-if="serverInfo.online">
              <td class="font-bold">玩家数量</td>
              <td>{{ serverInfo.players ? `${serverInfo.players.online}/${serverInfo.players.max}` : 'N/A' }}</td>
            </tr>
            <tr v-if="serverInfo.online && serverInfo.motd">
              <td class="font-bold">服务器描述</td>
              <td>{{ serverInfo.motd.clean || 'N/A' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 错误信息 -->
    <div v-if="error" class="alert alert-error shadow-lg mb-8">
      <div>
        <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const serverIP = ref('');
const serverInfo = ref(null);
const loading = ref(false);
const error = ref('');

const fetchServerInfo = async () => {
  if (!serverIP.value.trim()) {
    error.value = '请输入服务器IP地址';
    return;
  }

  loading.value = true;
  error.value = '';
  serverInfo.value = null;

  try {
    // 使用MCSrvStat API获取服务器信息
    const response = await fetch(`https://api.mcsrvstat.us/3/${encodeURIComponent(serverIP.value)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    serverInfo.value = data;
  } catch (err) {
    console.error('获取服务器信息失败:', err);
    error.value = '获取服务器信息失败，请检查IP地址是否正确';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>