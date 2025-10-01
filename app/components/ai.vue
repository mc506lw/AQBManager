<template>
  <div class="p-2 w-96 h-screen overflow-y-hidden">
    <div class="h-[80%] md:h-[85%] overflow-y-auto" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index"
        :class="['chat', message.role === 'user' ? 'chat-end' : 'chat-start']">
        <div class="chat-image avatar">
          <div class="w-10 rounded-full">
            <img :alt="message.role === 'user' ? 'User' : 'AI'"
              :src="message.role === 'user' ? '/steve.png' : '/logo_LR.png'" />
          </div>
        </div>
        <div class="chat-header">
          {{ message.role === 'user' ? '用户' : 'AQBM AI' }}
          <time class="text-xs opacity-50">{{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          }}</time>
        </div>
        <div class="chat-bubble" v-html="message.content.length < 1 ? '深度思考中...' : renderMarkdown(message.content)"></div>
      </div>
    </div>

    <fieldset class="fieldset mb-2 h-28">
      <legend class="fieldset-legend">与 AQBM AI 对话</legend>
      <textarea class="textarea max-h-20 w-full" placeholder="请输入你的问题" v-model="input"
        @keyup.enter="sendMessage"></textarea>
      <div class="flex justify-end">
        <button class="btn mr-2" onclick="aiset.showModal()">配置</button>
        <button class="btn mr-2" @click="clearMessage">清空</button>
        <button class="btn btn-primary" @click="sendMessage">发送</button>
      </div>
    </fieldset>
  </div>
  <dialog id="aiset" class="modal w-screen h-full">
    <div class="modal-box w-96">
      <div class="flex"><h3 class="text-xl font-bold">配置AI</h3><p class="ml-2 mt-2 text-base-content icon icon-mianfei-xianxing">没有免费API？<a href="https://llm.506521.xyz/#/vendors" target="_blank" class="text-blue-500">去了解</a></p></div>
      <legend class="fieldset-legend mt-4">API地址</legend>
      <input v-model="api_url" type="text" class="input validator mt-1" required placeholder="API URL" />
      <legend class="fieldset-legend mt-1">API密钥</legend>
      <input v-model="api_key" type="password" class="input mt-1" required placeholder="API KEY" />
      <legend class="fieldset-legend mt-1">模型</legend>
      <input v-model="ai_model" type="text" class="input mt-1" required placeholder="模型" />
      <legend class="fieldset-legend mt-1">最大token</legend>
      <input v-model="max_token" type="text" class="input mt-1 mb-2" required placeholder="最大token" />
      <div v-if="errorMsg" role="alert" class="alert alert-error">
        <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current" fill="none" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{{ errorMsg }}</span>
      </div>
      <div class="modal-action">
        <button @click="setai" class="btn btn-accent">确认</button>
        <form method="dialog">
          <button class="btn">关闭</button>
        </form>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { Marked } from 'marked'

const messages = ref([
  { role: 'assistant', content: '你好，我是AQBM智能客服，有什么我可以帮助你的吗？' }
])
const input = ref('')
const messagesContainer = ref(null)
const isAutoScroll = ref(true)
const errorMsg = ref('')

// AI配置相关
const api_url = ref('')
const api_key = ref('')
const ai_model = ref('')
const max_token = ref(15000)

// 配置 marked 以正确解析链接
const marked = new Marked({
  gfm: true,
  breaks: true,
  sanitize: false // 允许渲染HTML标签，包括链接
})

const renderMarkdown = (content) => {
  return marked.parse(content)
}

const scrollToBottom = () => {
  if (messagesContainer.value && isAutoScroll.value) {
    messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
  }
}

const handleScroll = () => {
  if (messagesContainer.value) {
    const { scrollTop, scrollHeight, clientHeight } = messagesContainer.value
    // 判断是否滚动到底部
    isAutoScroll.value = scrollTop + clientHeight >= scrollHeight - 10
  }
}

onMounted(async () => {
  if (messagesContainer.value) {
    messagesContainer.value.addEventListener('scroll', handleScroll)
  }
  // 组件加载时获取API配置
  await getAPIConfig()
})

onUnmounted(() => {
  if (messagesContainer.value) {
    messagesContainer.value.removeEventListener('scroll', handleScroll)
  }
})

const clearMessage = () => {
  messages.value = [
    { role: 'assistant', content: '你好，我是AQBM智能助手，有什么我可以帮助你的吗？' }
  ]
}

const sendMessage = async () => {
  if (!input.value.trim()) return

  // 添加用户消息
  messages.value.push({ role: 'user', content: input.value })
  const userMessage = input.value
  input.value = ''

  // 模拟AI回复延迟
  messages.value.push({ role: 'assistant', content: '' });
  const aiMessageIndex = messages.value.length - 1;
  
  // 模拟AI思考时间
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // 模拟AI回复内容
  const mockResponses = [
    "这是一个模拟的AI回复。在实际应用中，这里会连接到真正的AI服务来处理您的问题。",
    "感谢您的提问！这是来自模拟AI的回复。在真实环境中，您的问题会被发送到AI模型进行处理。",
    "您好！我是模拟AI助手。在生产环境中，我会将您的问题传递给真实的AI服务来获得准确答案。",
    "这是一个演示环境，AI回复是预设的模拟内容。在实际部署中，您将获得来自真实AI模型的个性化回复。",
    "模拟AI在此为您服务！在正式版本中，您的问题将由强大的AI引擎实时分析和回答。"
  ];
  
  const randomResponse = mockResponses[Math.floor(Math.random() * mockResponses.length)];
  
  // 流式显示回复
  let accumulatedContent = '';
  for (let i = 0; i < randomResponse.length; i++) {
    accumulatedContent += randomResponse[i];
    messages.value[aiMessageIndex].content = accumulatedContent;
    
    // 滚动到底部
    nextTick(() => {
      scrollToBottom()
    })
    
    // 模拟打字效果延迟
    await new Promise(resolve => setTimeout(resolve, 20));
  }
}

const getAPIConfig = async () => {
  // 模拟API配置数据
  api_url.value = 'https://api.example.com/v1/chat/completions'
  api_key.value = 'sk-****************************************'
  ai_model.value = 'gpt-3.5-turbo'
  max_token.value = 15000
  
  console.log('使用模拟API配置')
}

const setai = async () => {
  errorMsg.value = ''

  // 模拟API配置验证
  if (!api_url.value || !api_key.value || !ai_model.value || !max_token.value) {
    errorMsg.value = '请填写所有必填字段'
    return
  }

  // 模拟验证过程
  await new Promise(resolve => setTimeout(resolve, 800))
  
  // 模拟验证成功
  console.log('模拟API配置验证成功')
  
  // 模拟保存配置
  await new Promise(resolve => setTimeout(resolve, 500))
  
  // 配置保存成功，重新加载配置并关闭对话框
  await getAPIConfig()
  document.getElementById('aiset').close()
  
  console.log('模拟API配置保存成功')
}
</script>

<style scoped>
.chat-bubble a {
  color: #3b82f6;
  /* 蓝色 */
  text-decoration: underline;
}

.chat-bubble a:hover {
  color: #1d4ed8;
  /* 深蓝色 */
}
</style>