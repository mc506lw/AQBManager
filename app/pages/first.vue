<template>
  <div class="flex items-center justify-center w-full bg-base-100 min-h-screen transition-colors duration-300">
    <div class="card w-96 shadow-2xl bg-base-100 transition-all duration-300 transform hover:scale-105">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6 text-center">首次使用设置</h2>
        <p class="text-center mb-6 text-base-content/80">检测到您正在首次使用本系统，请修改默认的管理员账户信息</p>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">新用户名</span>
          </label>
          <input v-model="newUsername" type="text" placeholder="请输入新用户名"
            class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleChange" />
        </div>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">新密码</span>
          </label>
          <input v-model="newPassword" type="password" placeholder="请输入新密码"
            class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleChange" />
        </div>

        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text">确认新密码</span>
          </label>
          <input v-model="confirmPassword" type="password" placeholder="请再次输入新密码"
            class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleChange" />
        </div>

        <!-- 错误提示 -->
        <div v-if="error" class="alert alert-error shadow-lg mb-6 transition-all duration-300 animate-fade-in-down">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6 mr-2" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ error }}</span>
        </div>

        <!-- 成功提示 -->
        <div v-if="success" class="alert alert-success shadow-lg mb-6 transition-all duration-300 animate-fade-in-down">
          <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6 mr-2" fill="none"
            viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ success }}</span>
        </div>

        <div class="card-actions flex justify-center">
          <button @click="handleChange"
            class="btn btn-primary w-full transition-all duration-300 transform hover:scale-105">
            {{ loading ? '设置中...' : '完成设置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const newUsername = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');
const loading = ref(false);

const handleChange = async () => {
  error.value = ''
  success.value = ''
  
  // 基本验证
  if (!newUsername.value || !newPassword.value || !confirmPassword.value) {
    error.value = '请填写所有字段'
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    error.value = '两次输入的密码不一致'
    return
  }
  
  try {
    loading.value = true
    
    // 首次设置时，先使用默认用户名和密码登录获取token
    const loginResult = await $fetch('/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        name: 'admin',
        password: '123456',
      },
    })
    
    if (loginResult.success === true) {
      // 登录成功，使用返回的token修改密码
      const result = await $fetch('/api/auth', {
        method: 'POST',
        body: {
          action: 'change',
          token: loginResult.token,
          name: newUsername.value,
          password: newPassword.value,
        },
      })
      
      if (result.success === true) {
        success.value = '设置成功，正在登录...'
        
        // 使用新凭据自动登录
        const newLoginResult = await $fetch('/api/auth', {
          method: 'POST',
          body: {
            action: 'login',
            name: newUsername.value,
            password: newPassword.value,
          },
        })
        
        if (newLoginResult.success === true) {
          // 保存token到cookie
          const tokenCookie = useCookie('auth_token', {
            maxAge: 60 * 60 * 24 * 30, // 30天过期（秒）
            sameSite: true,
            secure: false // 如果是HTTPS环境，设置为true
          })
          tokenCookie.value = newLoginResult.token
          
          // 检查服务器列表
          try {
            const serversResponse = await $fetch('/api/servers', {
              method: 'POST',
              body: {
                action: 'get_servers',
                token: newLoginResult.token
              }
            })
            
            // 如果服务器列表为空，跳转到设置页面
            if (serversResponse.success && (!serversResponse.servers || serversResponse.servers.length === 0)) {
              navigateTo('/setup')
            } else {
              // 否则跳转到主页
              navigateTo('/')
            }
          } catch (err) {
            // 如果检查服务器失败，默认跳转到设置页面
            navigateTo('/setup')
          }
        } else {
          error.value = newLoginResult.msg
        }
      } else {
        error.value = result.msg
      }
    } else {
      error.value = loginResult.msg
    }
  } catch (err) {
    error.value = err.message || '设置过程中发生错误'
  } finally {
    loading.value = false
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