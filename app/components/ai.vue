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

  try {
    console.log('发送消息到AI');
    // 发送消息到AI
    const response = await fetch('/api/ai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        action: 'chat',
        messages: messages.value,
        token: useCookie('auth_token').value,
        question: userMessage
      })
    });
    console.log('收到AI响应:', response.body);

    // 检查响应是否包含流式数据
    if (response.body && typeof response.body.getReader === 'function') {
      // 处理流式响应
      messages.value.push({ role: 'assistant', content: '' });
      const aiMessageIndex = messages.value.length - 1;
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      try {
        let accumulatedData = '';
        let messageContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码数据
          const chunk = decoder.decode(value);
          accumulatedData += chunk;

          // 处理完整的数据行
          const lines = accumulatedData.split('\n');
          accumulatedData = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                // 更新AI消息内容
                if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  messageContent += parsed.choices[0].delta.content;
                  messages.value[aiMessageIndex].content = messageContent;
                  // 在下次DOM更新后滚动到底部
                  nextTick(() => {
                    scrollToBottom()
                  })
                }
              } catch (e) {
                // 如果不是JSON格式，直接添加到内容中
                messageContent += data;
                messages.value[aiMessageIndex].content = messageContent;
                // 在下次DOM更新后滚动到底部
                nextTick(() => {
                  scrollToBottom()
                })
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      return;
    }
  } catch (error) {
    console.error('发送消息时出错:', error);

    // 检查错误是否包含流式数据
    if (error && typeof error === 'object' && error.body && typeof error.body.getReader === 'function') {
      // 处理流式响应错误
      messages.value.push({ role: 'assistant', content: '' });
      const aiMessageIndex = messages.value.length - 1;
      const reader = error.body.getReader();
      const decoder = new TextDecoder();

      try {
        let accumulatedData = '';
        let messageContent = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          // 解码数据
          const chunk = decoder.decode(value);
          accumulatedData += chunk;

          // 处理完整的数据行
          const lines = accumulatedData.split('\n');
          accumulatedData = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              if (data === '[DONE]') break;
              try {
                const parsed = JSON.parse(data);
                // 更新AI消息内容
                if (parsed.choices && parsed.choices[0].delta && parsed.choices[0].delta.content) {
                  messageContent += parsed.choices[0].delta.content;
                  messages.value[aiMessageIndex].content = messageContent;
                  // 在下次DOM更新后滚动到底部
                  nextTick(() => {
                    scrollToBottom()
                  })
                }
              } catch (e) {
                // 如果不是JSON格式，直接添加到内容中
                messageContent += data;
                messages.value[aiMessageIndex].content = messageContent;
                // 在下次DOM更新后滚动到底部
                nextTick(() => {
                  scrollToBottom()
                })
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      return;
    }

    messages.value.push({ role: 'assistant', content: `抱歉，处理您的请求时出现错误。错误信息: ${error.message || error}` });
  }
}

const getAPIConfig = async () => {
  try {
    const response = await $fetch('/api/ai', {
      method: 'POST',
      body: {
        action: 'get_api',
        token: useCookie('auth_token').value
      }
    })

    // 检查响应是否为JSON格式
    if (typeof response === 'string') {
      const result = JSON.parse(response)
      if (result.success) {
        api_url.value = result.data.api_url
        api_key.value = result.data.api_key
        ai_model.value = result.data.model
        max_token.value = result.data.max_tokens
      } else {
        console.error('获取API配置失败:', result.msg)
      }
    } else if (response.success) {
      // 如果响应已经是对象格式
      api_url.value = response.data.api_url
      api_key.value = response.data.api_key
      ai_model.value = response.data.model
      max_token.value = response.data.max_tokens
    } else {
      console.error('获取API配置失败:', response.msg)
    }
  } catch (error) {
    console.error('获取API配置时出错:', error)
  }
}

const setai = async () => {
  errorMsg.value = ''

  // 首先验证API配置
  try {
    const verifyResponse = await $fetch('/api/ai', {
      method: 'POST',
      body: {
        action: 'verify_api',
        token: useCookie('auth_token').value,
        api_url: api_url.value,
        api_key: api_key.value,
        model: ai_model.value,
        max_tokens: max_token.value
      }
    })
    if (!verifyResponse.success) {
      errorMsg.value = verifyResponse.msg
      return
    }

    // 验证成功后保存配置
    const setResponse = await $fetch('/api/ai', {
      method: 'POST',
      body: {
        action: 'set_api',
        token: useCookie('auth_token').value,
        api_url: api_url.value,
        api_key: api_key.value,
        model: ai_model.value,
        max_tokens: max_token.value
      }
    })

    if (!setResponse.success) {
      errorMsg.value = setResponse.msg
    } else {
      // 配置保存成功，重新加载配置并关闭对话框
      await getAPIConfig()
      document.getElementById('aiset').close()
    }
  } catch (error) {
    console.error('设置API配置时出错:', error)
    errorMsg.value = '设置API配置时出错: ' + error.message
  }
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