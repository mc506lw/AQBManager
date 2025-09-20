<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col lg:flex-row justify-between w-full border-b border-base-300">
      <div class="my-6 ml-6">
        <div class="text-2xl font-bold">脚本管理</div>
        <div class="text-xl">管理服务器插件和脚本</div>
      </div>
      <div class="mx-6 mt-4 lg:mt-8 mb-4 lg:mb-0 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
        <button class="btn btn-outline" @click="refreshPlugins" :disabled="loading">
          {{ loading ? '刷新中...' : '刷新' }}
        </button>
        <select 
          class="select select-bordered w-full lg:w-64" 
          v-model="selectedServer"
          :disabled="servers.length === 0"
        >
          <option value="">请选择服务器</option>
          <option 
            v-for="server in servers" 
            :key="server.uuid" 
            :value="server.uuid"
          >
            {{ server.name || server.ip }}
          </option>
        </select>
      </div>
    </div>

    <!-- 插件市场 -->
    <div class="flex-1 overflow-y-auto mx-6 p-4">
      <div v-if="!selectedServer">
        <p class="text-center text-gray-500 py-10">请选择服务器以查看插件市场</p>
      </div>
      <div v-else>
        <div class="mb-4 flex justify-between items-center">
          <h2 class="text-xl font-bold">插件市场</h2>
          <div class="text-sm text-base-content/70" v-if="lastUpdate">
            更新于 {{ formatTimeAgo(lastUpdate) }}
          </div>
        </div>

        <!-- 搜索和筛选区域 -->
        <div class="mb-4 flex flex-col md:flex-row gap-2">
          <input 
            type="text" 
            placeholder="搜索插件..." 
            class="input input-bordered w-full md:w-64" 
            v-model="searchQuery"
          />
          <select 
            class="select select-bordered w-full md:w-64" 
            v-model="selectedAuthor"
          >
            <option value="">所有作者</option>
            <option 
              v-for="author in topAuthors" 
              :key="author" 
              :value="author"
            >
              {{ author }}
            </option>
          </select>
        </div>

        <!-- 插件列表 -->
        <div v-if="filteredPlugins && filteredPlugins.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="plugin in filteredPlugins" 
            :key="plugin.name" 
            class="card bg-base-200 card-sm"
          >
            <div class="card-body">
              <h3 class="card-title text-sm">{{ plugin.name }}</h3>
              <p class="text-sm text-base-content/80">{{ plugin.description }}</p>
              <div class="mt-2 text-xs">
                <div class="flex justify-between">
                  <span>作者:</span>
                  <span>{{ plugin.author }}</span>
                </div>
                <div class="flex justify-between">
                  <span>版本:</span>
                  <span>{{ plugin.version }}</span>
                </div>
              </div>
              <div class="card-actions justify-end mt-4">
                <button class="btn btn-sm btn-primary" @click="downloadPlugin(plugin)">
                  下载
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- 空状态 -->
        <div v-else-if="!loading" class="text-center py-8">
          <div class="text-base-content/50 mb-2">暂无插件数据</div>
          <button class="btn btn-sm btn-outline" @click="refreshPlugins">刷新数据</button>
        </div>

        <!-- 加载状态 -->
        <div v-else class="flex justify-center py-8">
          <div class="loading loading-spinner"></div>
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
import { ref, onMounted, computed, watch } from 'vue'

const token = useCookie('auth_token')
const servers = ref([])
const selectedServer = ref('')
const plugins = ref([])
const pluginRepoInfo = ref({})
const lastUpdate = ref(0)
const loading = ref(false)
const searchQuery = ref('')
const selectedAuthor = ref('')

// Toast 相关
const toastMessage = ref('')
const toastType = ref('')

const toastClass = computed(() => {
  switch (toastType.value) {
    case 'success':
      return 'alert-success'
    case 'error':
      return 'alert-error'
    case 'warning':
      return 'alert-warning'
    default:
      return 'alert-info'
  }
})

// 计算属性：过滤后的插件列表
const filteredPlugins = computed(() => {
  let result = plugins.value
  
  // 按搜索关键词过滤
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(plugin => 
      plugin.name.toLowerCase().includes(query) || 
      plugin.description.toLowerCase().includes(query)
    )
  }
  
  // 按作者过滤
  if (selectedAuthor.value) {
    result = result.filter(plugin => plugin.author === selectedAuthor.value)
  }
  
  return result
})

// 计算属性：获取插件最多的前10个作者
const topAuthors = computed(() => {
  if (!plugins.value || plugins.value.length === 0) return []
  
  // 统计每个作者的插件数量
  const authorCount = {}
  plugins.value.forEach(plugin => {
    if (plugin.author) {
      authorCount[plugin.author] = (authorCount[plugin.author] || 0) + 1
    }
  })
  
  // 按插件数量排序并取前10个
  return Object.entries(authorCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([author]) => author)
})

const showToastMessage = (message, type) => {
  toastMessage.value = message
  toastType.value = type
  setTimeout(() => {
    toastMessage.value = ''
    toastType.value = ''
  }, 3000)
}

// 获取服务器列表
const getservers = async () => {
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'get_servers',
        token: token.value
      },
    })
    if (result.success) {
      servers.value = result.servers
      console.log('服务器列表获取成功')
    } else {
      showToastMessage(`服务器列表获取失败: ${result.msg}`, 'error')
    }
  } catch (error) {
    showToastMessage(`获取服务器列表时发生错误: ${error.message}`, 'error')
  }
}

// 刷新插件数据
const refreshPlugins = async () => {
  if (!selectedServer.value) return
  
  loading.value = true
  try {
    const result = await $fetch('/api/plugin', {
      method: 'POST',
      body: {
        action: 'update',
        token: token.value
      },
    })
    
    if (result.success) {
      plugins.value = result.data.plugins || []
      pluginRepoInfo.value = {
        name: result.data.name,
        author: result.data.author,
        description: result.data.description,
        website: result.data.website
      }
      lastUpdate.value = result.lastUpdate || Date.now()
      showToastMessage('插件数据已更新', 'success')
    } else {
      showToastMessage(`插件数据更新失败: ${result.message}`, 'error')
    }
  } catch (error) {
    showToastMessage(`更新插件数据时发生错误: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 获取插件数据
const getPlugins = async () => {
  if (!selectedServer.value) return
  
  loading.value = true
  try {
    const result = await $fetch('/api/plugin', {
      method: 'POST',
      body: {
        action: 'get',
        token: token.value
      },
    })
    
    if (result.success) {
      plugins.value = result.data.plugins || []
      pluginRepoInfo.value = {
        name: result.data.name,
        author: result.data.author,
        description: result.data.description,
        website: result.data.website
      }
      lastUpdate.value = result.lastUpdate || Date.now()
    } else {
      showToastMessage(`插件数据获取失败: ${result.message}`, 'error')
    }
  } catch (error) {
    showToastMessage(`获取插件数据时发生错误: ${error.message}`, 'error')
  } finally {
    loading.value = false
  }
}

// 下载插件
const downloadPlugin = (plugin) => {
  // 这里可以实现插件下载逻辑
  // showToastMessage(`开始下载插件: ${plugin.name}`, 'info')
  // 实际下载逻辑需要后端支持
  // console.log('下载插件:', plugin)
  showToastMessage(`API暂不支持此功能！`, 'error')
}

// 格式化时间显示
const formatTimeAgo = (timestamp) => {
  const now = Date.now()
  const diff = now - timestamp
  const minutes = Math.floor(diff / 60000)
  
  if (minutes < 1) {
    return '刚刚'
  } else if (minutes < 60) {
    return `${minutes}分钟前`
  } else {
    const hours = Math.floor(minutes / 60)
    return `${hours}小时前`
  }
}

// 监听服务器选择变化
watch(selectedServer, async (newVal) => {
  if (newVal) {
    await getPlugins()
  } else {
    plugins.value = []
    lastUpdate.value = 0
  }
})

// 组件挂载时获取服务器列表
onMounted(() => {
  getservers()
})
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>