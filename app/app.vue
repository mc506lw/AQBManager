<script setup>
import Navbar from './components/navbar.vue';
import Sidebar from './components/sidebar.vue';
import Announcement from './components/announcement.vue';
import { useCustomStore } from '~/utils/custom';

const customStore = useCustomStore();

onMounted(() => {
  // 从localStorage中读取保存的主题
  const savedTheme = localStorage.getItem('selected-theme');
  const lightTheme = localStorage.getItem('light-theme');
  const darkTheme = localStorage.getItem('dark-theme');
  const themes = [
    'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'synthwave', 'retro',
    'cyberpunk', 'valentine', 'halloween', 'garden', 'forest', 'aqua', 'lofi', 'pastel',
    'fantasy', 'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn', 'business',
    'acid', 'lemonade', 'night', 'coffee', 'winter', 'dim', 'sunset', 'abyss', 'aqua'
  ];

  // 优先使用selected-theme
  if (savedTheme && themes.includes(savedTheme)) {
    document.documentElement.setAttribute('data-theme', savedTheme);
    // 更新store中的主题
    customStore.changeTheme(savedTheme);
  } else if (lightTheme && themes.includes(lightTheme)) {
    // 其次使用保存的亮色主题
    document.documentElement.setAttribute('data-theme', lightTheme);
    customStore.changeTheme(lightTheme);
  } else if (darkTheme && themes.includes(darkTheme)) {
    // 最后使用保存的暗色主题
    document.documentElement.setAttribute('data-theme', darkTheme);
    customStore.changeTheme(darkTheme);
  } else {
    // 如果都没有保存的主题，则使用store中的默认主题
    document.documentElement.setAttribute('data-theme', customStore.currentTheme);
  }
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
    <Announcement />
  </div>
</template>