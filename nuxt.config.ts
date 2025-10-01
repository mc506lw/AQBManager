import tailwindcss from "@tailwindcss/vite"

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/main.css'],
  ssr: false,
  target: 'static',
  vite: {
    plugins: [tailwindcss()]
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AQBManager：一个现代化的 AQQBot 管理平台，提供直观的 Web 界面来管理多个 AQQBot 服务器实例' },
        { name: 'keywords', content: 'AQQBot, 管理平台, 机器人管理, Nuxt, DaisyUI, Tailwind CSS, WebSocket, 我的世界插件' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://at.alicdn.com/t/c/font_4978976_oh7ag7mkjt9.css' },
        { rel: 'icon', type: 'image/x-icon', href: '/logo_LR.png' },
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  modules: [
    '@pinia/nuxt',
  ],
  ignore: [
    'server/data'
  ],
  generate: {
    fallback: '404.html'
  }
})
