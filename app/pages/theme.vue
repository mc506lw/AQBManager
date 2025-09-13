<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col md:flex-row justify-between w-full border-b border-base-300">
      <div class="mt-2 p-4 ml-6">
        <div class="text-2xl font-bold">主题选择</div>
        <div class="text-xl">选择您喜欢的预设主题</div>
      </div>
    </div>
    <!-- 添加主题类型切换按钮 -->
    <div class="flex justify-center my-4">
      <div class="btn-group join">
        <button class="btn join-item" :class="{ 'btn-primary': themeType === 'light' }" @click="switchToLightThemes">
          亮色主题
        </button>
        <button class="btn join-item" :class="{ 'btn-primary': themeType === 'dark' }" @click="switchToDarkThemes">
          暗色主题
        </button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto mx-6 p-4 max-h-[65%]">
      <div class="mb-6 p-4 bg-base-100 rounded-lg">
        <h3 class="font-bold text-lg mb-4">预设主题</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4">
          <div v-for="theme in filteredThemes" :key="theme"
            class="cursor-pointer border-2 rounded-lg p-4 transition-all duration-200 hover:scale-105" :class="{
              'border-primary': currentTheme === theme,
              'border-base-300': currentTheme !== theme
            }" @click="selectTheme(theme)">
            <div class="font-bold mb-2 text-center">{{ themeChineseNames[theme] || theme }}</div>
            <div class="flex flex-row p-1 rounded-lg border-2 border-base-300 gap-2 justify-center" :data-theme="theme"
              :class="{
                'border-primary': currentTheme === theme,
                'border-base-300': currentTheme !== theme
              }">
              <div class="h-6 w-12 rounded-lg bg-primary"></div>
              <div class="h-6 w-12 rounded-lg bg-secondary"></div>
              <div class="h-6 w-12 rounded-lg bg-accent"></div>
              <div class="h-6 w-12 rounded-lg bg-neutral"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="ml-12 mt-6 flex flex-col sm:flex-row justify-between gap-2">
      <div class="flex flex-col sm:flex-row gap-2">
        <button class="btn btn-primary" @click="saveTheme">保存主题</button>
        <button class="btn btn-secondary" @click="resetTheme">重置为默认</button>
      </div>
    </div>
    <div class="toast toast-end" v-if="showToast">
      <div
        :class="`alert alert-${toastType} transition-all duration-300 ease-in-out transform ${showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

// 亮色主题列表
const lightThemes = [
  'light', 'cupcake', 'bumblebee', 'emerald', 'corporate', 'retro',
  'cyberpunk', 'valentine', 'garden', 'lofi', 'pastel',
  'fantasy', 'wireframe', 'cmyk', 'autumn', 'acid', 'lemonade', 'winter', 'mixue', 'luckin'
];

// 暗色主题列表
const darkThemes = [
  'dark', 'synthwave', 'halloween', 'forest', 'black', 'luxury', 'dracula', 'business',
  'night', 'coffee', 'dim', 'sunset', 'abyss', 'aqua'
];

// 主题中文名映射
const themeChineseNames = {
  'light': '明亮',
  'dark': '暗黑',
  'cupcake': '纸杯蛋糕',
  'bumblebee': '大黄蜂',
  'emerald': '绿宝石',
  'corporate': '企业',
  'synthwave': '合成波',
  'retro': '复古',
  'cyberpunk': '赛博朋克',
  'valentine': '情人节',
  'halloween': '万圣节',
  'garden': '花园',
  'forest': '森林',
  'aqua': '水蓝',
  'lofi': '低保真',
  'pastel': '粉彩',
  'fantasy': '幻想',
  'wireframe': '线框',
  'black': '纯黑',
  'luxury': '奢华',
  'dracula': '德古拉',
  'cmyk': 'CMYK',
  'autumn': '秋日',
  'business': '商务',
  'acid': '酸性',
  'lemonade': '柠檬水',
  'night': '夜晚',
  'coffee': '咖啡',
  'winter': '冬日',
  'dim': '昏暗',
  'sunset': '日落',
  'abyss': '深渊',
  'mixue': '蜜雪',
  'luckin': '瑞幸'
};

// 当前显示的主题类型
const themeType = ref('all'); // 'all', 'light', 'dark'

// 根据主题类型过滤后的主题列表
const filteredThemes = computed(() => {
  if (themeType.value === 'light') {
    return lightThemes;
  } else if (themeType.value === 'dark') {
    return darkThemes;
  } else {
    // 合并亮色和暗色主题列表
    return [...lightThemes, ...darkThemes];
  }
});

// 切换到亮色主题
const switchToLightThemes = () => {
  themeType.value = 'light';
};

// 切换到暗色主题
const switchToDarkThemes = () => {
  themeType.value = 'dark';
};

// 默认主题
const defaultTheme = 'light';

// 当前主题
const currentTheme = ref(defaultTheme);

// Toast相关变量
const showToast = ref(false);
const toastMessage = ref('');
const toastType = ref('info'); // success, error, warning, info

// 显示toast的方法
const showToastMessage = (message, type = 'info') => {
  toastMessage.value = message;
  toastType.value = type;
  showToast.value = true;
  
  // 3秒后自动隐藏
  setTimeout(() => {
    showToast.value = false;
  }, 3000);
};

// 选择主题
const selectTheme = (theme) => {
  currentTheme.value = theme;
  document.documentElement.setAttribute('data-theme', theme);
};

// 更新主题
const updateTheme = (theme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

// 保存主题
const saveTheme = () => {
  // 根据当前选择的主题类型保存到对应的类别
  if (themeType.value === 'light') {
    localStorage.setItem('light-theme', currentTheme.value);
    showToastMessage('已保存为亮色主题', 'success');
  } else if (themeType.value === 'dark') {
    localStorage.setItem('dark-theme', currentTheme.value);
    showToastMessage('已保存为暗色主题', 'success');
  } else {
    // 如果是全部主题类型，保存到selected-theme
    localStorage.setItem('selected-theme', currentTheme.value);
    showToastMessage('主题已保存', 'success');
  }
};

// 重置主题
const resetTheme = () => {
  currentTheme.value = defaultTheme;
  updateTheme(defaultTheme);

  // 重置时同时清除保存的亮色和暗色主题
  localStorage.removeItem('selected-theme');
  localStorage.removeItem('light-theme');
  localStorage.removeItem('dark-theme');

  showToastMessage('主题已重置', 'success');
};

// 页面加载时恢复保存的主题
onMounted(() => {
  // 根据当前系统主题偏好设置默认主题类型
  const isDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
  themeType.value = isDarkMode ? 'dark' : 'light';

  // 首先尝试从对应的主题类型加载
  let savedTheme = null;
  if (themeType.value === 'light') {
    savedTheme = localStorage.getItem('light-theme');
  } else if (themeType.value === 'dark') {
    savedTheme = localStorage.getItem('dark-theme');
  }

  // 如果没有对应类型的主题，尝试从selected-theme加载
  if (!savedTheme) {
    savedTheme = localStorage.getItem('selected-theme');
  }

  // 如果仍然没有保存的主题，使用默认主题
  const allThemes = [...lightThemes, ...darkThemes];
  if (!savedTheme || !allThemes.includes(savedTheme)) {
    savedTheme = defaultTheme;
  }

  currentTheme.value = savedTheme;
  updateTheme(savedTheme);
});
</script>

<style scoped>
/* 在这里添加任何需要的样式 */
</style>