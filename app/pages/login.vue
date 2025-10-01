<template>
  <div class="flex items-center justify-center w-full bg-base-100 min-h-screen transition-colors duration-300">
    <div class="card w-96 shadow-2xl bg-base-100 transition-all duration-300 transform hover:scale-105">
      <div class="card-body">
        <h2 class="card-title text-2xl font-bold mb-6 text-center">管理员登录</h2>

        <div class="form-control mb-4">
          <label class="label">
            <span class="label-text">用户名</span>
          </label>
          <input v-model="username" type="text" placeholder="请输入用户名"
            class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleLogin" />
        </div>

        <div class="form-control mb-6">
          <label class="label">
            <span class="label-text">密码</span>
          </label>
          <input v-model="password" type="password" placeholder="请输入密码"
            class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary"
            @keyup.enter="handleLogin" />
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

        <div class="card-actions flex justify-center">
          <button @click="handleLogin"
            class="btn btn-primary w-full transition-all duration-300 transform hover:scale-105">
            {{ loading ? '登录中...' : '登录' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const password = ref('');
const username = ref('admin');
const error = ref('');
const loading = ref(false);

const handleLogin = async () => {
  error.value = '';
  if (!username.value || !password.value) {
    error.value = '请输入用户名和密码';
    return;
  }

  try {
    loading.value = true;
    // 使用模拟数据替代真实API调用
    // 模拟认证过程
    await new Promise(resolve => setTimeout(resolve, 1000)); // 模拟网络延迟
    
    // 简单的模拟认证逻辑
    if (username.value === 'admin' && password.value === 'admin') {
      const result = {
        success: true,
        token: 'mock-auth-token-12345'
      };
      
      if (result.success === true) {
        const tokenCookie = useCookie('auth_token', {
          maxAge: 60 * 60 * 24 * 30, // 30天过期（秒）
          sameSite: true,
          secure: false // 如果是HTTPS环境，设置为true
        })
        tokenCookie.value = result.token
        // 验证成功，跳转到主页
        navigateTo('/')
      } else {
        error.value = result.msg || '认证失败';
      }
    } else {
      error.value = '用户名或密码错误';
    }
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>