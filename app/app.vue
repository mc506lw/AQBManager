<script setup>
import Navbar from './components/navbar.vue';
import Sidebar from './components/sidebar.vue';
import { useCustomStore } from '~/utils/custom';

const customStore = useCustomStore();

onMounted(() => {
  document.documentElement.setAttribute('data-theme', customStore.currentTheme);
})
// SEO 和页面配置
useHead({
  title: 'AQBManager',
  meta: [
    { name: 'robots', content: 'noindex, nofollow' },
    { name: 'googlebot', content: 'noindex, nofollow' }
  ]
});
</script>

<template>
  <div class="flex w-screen h-screen overflow-hidden bg-base-200">
    <Sidebar />
    <div class="m-2 w-full rounded-lg bg-base-100 outline-1 outline-base-300 lg:ml-0">
      <Navbar />
      <NuxtPage />
    </div>
  </div>
</template>