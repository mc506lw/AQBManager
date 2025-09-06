<template>
  <div class="min-h-screen flex items-center justify-center bg-base-200 p-4">
    <div class="card w-full max-w-md shadow-2xl bg-base-100 transition-all duration-300 transform hover:scale-105">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6 text-center">欢迎使用 AQQBot</h2>
        <p class="mb-6 text-center">您需要先添加一个服务器才能开始使用。</p>
        
        <div class="space-y-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">服务器IP</span>
            </label>
            <input 
              type="text" 
              placeholder="例如: 127.0.0.1:5700" 
              class="input input-bordered ml-2" 
              v-model="serverIp"
            />
          </div>
          
          <div class="form-control">
            <label class="label">
              <span class="label-text">访问令牌</span>
            </label>
            <input 
              type="password" 
              placeholder="服务器访问令牌" 
              class="input input-bordered ml-2" 
              v-model="serverToken"
            />
          </div>
          
          <div class="form-control mt-6">
            <button 
              class="btn btn-primary" 
              @click="addServer"
              :disabled="isAdding"
            >
              <span v-if="isAdding" class="loading loading-spinner"></span>
              {{ isAdding ? '添加中...' : '添加服务器' }}
            </button>
          </div>
        </div>
        
        <div v-if="error" class="alert alert-error mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>
        
        <div v-if="success" class="alert alert-success mt-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>服务器添加成功！1秒后将自动跳转到仪表盘</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const serverIp = ref('')
const serverToken = ref('')
const isAdding = ref(false)
const error = ref('')
const success = ref(false)

const addServer = async () => {
  if (!serverIp.value || !serverToken.value) {
    error.value = '请填写所有字段'
    return
  }
  
  error.value = ''
  success.value = false
  isAdding.value = true
  
  try {
    const token = useCookie('auth_token').value
    
    const response = await $fetch('/api/servers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        action: 'add',
        token: token,
        serverip: serverIp.value,
        servertoken: serverToken.value
      }
    })
    
    if (response.success) {
      success.value = true
      serverIp.value = ''
      serverToken.value = ''
      
      // 1秒后跳转到仪表盘
      setTimeout(() => {
        navigateTo('/')
      }, 1000)
    } else {
      error.value = response.message || '添加服务器失败'
    }
  } catch (err) {
    error.value = err.message || '网络错误，请稍后重试'
  } finally {
    isAdding.value = false
  }
}
</script>

<style scoped>
.animate-fade-in-down {
  animation: fadeInDown 0.3s ease-in-out;
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>