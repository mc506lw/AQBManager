// server/api/test.js
export default defineEventHandler((event) => {
  console.log('=== Test API 被调用了 ===')
  return {
    message: 'API工作正常',
    timestamp: new Date().toISOString()
  }
})