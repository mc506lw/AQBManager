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
        { rel: 'icon', type: 'image/x-icon', href: '/logo_LR.png' },
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
      await initializeAllServerConnections();
    },
    'close': async () => {
      await shutdownServerConnections();
    }
  },
  ignore: [
    'server/data'
  ]
})
