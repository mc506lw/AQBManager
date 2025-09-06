import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCustomStore = defineStore('custom', () => {
  const isCollapsed = ref(false)
  const currentTheme = ref("light")
  const authOpened = ref(false)

  function collapse() {
    isCollapsed.value = !isCollapsed.value
  }

  function changeTheme(theme) {
    if (theme) {
      currentTheme.value = theme
    } else {
      // 新的亮色/暗色切换逻辑
      // 获取已保存的亮色和暗色主题
      const lightTheme = localStorage.getItem('light-theme') || 'light';
      const darkTheme = localStorage.getItem('dark-theme') || 'dark';

      // 确定要切换到的主题
      if (currentTheme.value === 'light' || currentTheme.value === lightTheme) {
        // 当前是亮色主题，切换到暗色主题
        currentTheme.value = darkTheme;
      } else {
        // 当前是暗色主题，切换到亮色主题
        currentTheme.value = lightTheme;
      }
    }
  }

  function switchAuth() {
    authOpened.value = !authOpened.value
  }

  // 设置自定义主题
  function setCustomTheme() {
    currentTheme.value = "custom"
  }

  // 返回所有可以访问的东西
  return { isCollapsed, currentTheme, authOpened, collapse, changeTheme, switchAuth, setCustomTheme }
})