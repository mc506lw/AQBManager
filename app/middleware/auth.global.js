// middleware/auth.global.js
export default defineNuxtRouteMiddleware(async (to, from) => {
  // 公开页面（不需要登录）
  const publicPages = ['/login', '/api/test']
  
  // 是否是公开页面
  const isPublic = publicPages.some(page => 
    to.path === page || to.path.startsWith(page + '/')
  )
  
  // 获取token
  const token = useCookie('auth_token')
  const tokenValue = token.value
  
  // 如果用户已登录，检查特殊条件
  if (tokenValue) {
    try {
      // 检查是否是第一次使用
      const isFirstResponse = await $fetch('/api/is_first')
      if (isFirstResponse.is_first) {
        // 是第一次使用 → 跳转到首次设置页面
        // 只有在当前页面不是/first时才重定向，防止无限循环
        if (to.path !== '/first') {
          return navigateTo('/first')
        }
      } else {
        // 不是第一次使用，检查服务器列表
        // 添加重试机制以防止在添加服务器后立即检查时出现空列表
        let serversResponse = null
        let retryCount = 0
        const maxRetries = 3
        
        while (retryCount <= maxRetries) {
          serversResponse = await $fetch('/api/servers', {
            method: 'POST',
            body: {
              action: 'get_servers',
              token: tokenValue
            }
          })
          
          // 如果成功获取到服务器列表且不为空，跳出循环
          if (serversResponse.success && serversResponse.servers && serversResponse.servers.length > 0) {
            break
          }
          
          // 如果是最后一次重试，跳出循环
          if (retryCount === maxRetries) {
            break
          }
          
          // 等待一段时间再重试
          await new Promise(resolve => setTimeout(resolve, 500))
          retryCount++
        }
        
        // 如果服务器列表为空且当前页面不是/setup或/servers，则重定向到/setup
        if (serversResponse && serversResponse.success && 
            (!serversResponse.servers || serversResponse.servers.length === 0) && 
            to.path !== '/setup' && to.path !== '/servers') {
          return navigateTo('/setup')
        }
      }
    } catch (error) {
      console.error('检查用户状态时出错:', error)
      // 即使检查失败，也允许用户继续访问，避免因API错误导致无法访问
    }
  }
  
  // 鉴权逻辑
  if (!isPublic && !tokenValue) {
    // 需要登录但没登录 → 跳转登录页
    return navigateTo('/login')
  }
  
  if (tokenValue && to.path === '/login') {
    // 已登录但访问登录页 → 跳转首页
    return navigateTo('/')
  }
})