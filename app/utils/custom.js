import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useCustomStore = defineStore('custom', () => {
  const isCollapsed = ref(false)
  const currentTheme = ref("light")
  const authOpened = ref(false)
  
  function collapse() {
    isCollapsed.value = !isCollapsed.value
  }
  
  function changeTheme() {
    currentTheme.value = currentTheme.value === "light" ? "dark" : "light"
  }

  function switchAuth() {
    authOpened.value = !authOpened.value
  }

  // 返回所有可以访问的东西
  return { isCollapsed, currentTheme, authOpened, collapse, changeTheme, switchAuth }
})