import tailwindcss from "@tailwindcss/vite"
import { initializeAllServerConnections, shutdownServerConnections } from './server/utils/serversmanager'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: false },
  css: ['~/main.css'],
  ssr: true,
  vite: {
    plugins: [tailwindcss()]
  },
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'AQQBot' },
        { name: 'keywords', content: 'AQQBot' }
      ],
      link: [
        { rel: 'stylesheet', href: 'https://at.alicdn.com/t/c/font_4978976_gi1af6bwgm.css' },
        { rel: 'icon', type: 'image/x-icon', href: '/logo.png' },
      ]
    },
    pageTransition: { name: 'page', mode: 'out-in' },
    layoutTransition: { name: 'layout', mode: 'out-in' }
  },
  modules: [
    '@pinia/nuxt',
  ],
  hooks: {
    'nitro:init': async (nitro) => {
      console.log('🔄 正在初始化所有服务器连接...');
      await initializeAllServerConnections();
      console.log('✅ 所有服务器连接初始化完成');
    },
    'close': async () => {
      console.log('收到关闭信号');
      await shutdownServerConnections();
      console.log('✅ 所有服务器连接已关闭。');
    }
  },
  ignore: [
    'server/data'
  ]
})
