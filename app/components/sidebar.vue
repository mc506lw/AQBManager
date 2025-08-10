<template>
    <div class="flex flex-col h-screen">
        <div class="h-16 flex items-center transition-all duration-300 ease-in-out"
            :class="{ 'w-56': isCollapsed, 'w-12': !isCollapsed }">
            <img src="assets/logo.png" class="transition-all duration-300 ease-in-out"
                :class="{ 'ml-2 mt-1 h-16 w-16': isCollapsed, 'mt-1 ml-1.5 w-12 h-12': !isCollapsed }">
            <h1 class="text-xl ml-2 font-bold max-h-6 overflow-hidden"
                :class="{ 'w-auto': isCollapsed, 'w-1': !isCollapsed }" v-show=isCollapsed>管理后台</h1>
        </div>
        <ul class="menu bg-base-200 rounded-box w-56" v-show=isCollapsed>
            <li class="menu-title">操作菜单</li>
            <li>
                <NuxtLink to="/" active-class="menu-active" class="icon icon-yibiaopan">仪表盘</NuxtLink>
            </li>
            <li class="menu-title">玩家管理</li>
            <li>
                <NuxtLink to="/playerlist" active-class="menu-active" class="icon icon-renyuanguanli">玩家列表</NuxtLink>
            </li>
            <li class="menu-title">系统配置</li>
            <li>
                <NuxtLink to="/botconfig" active-class="menu-active" class="icon icon-jiqiren">机器人配置</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/groupmanage" active-class="menu-active" class="icon icon-wangluoxitong">QQ群管理</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/servers" active-class="menu-active" class="icon icon-fuwuqi">服务器管理</NuxtLink>
            </li>
            <li class="menu-title">指令控制</li>
            <li>
                <NuxtLink to="/command" active-class="menu-active" class="icon icon-hutong">远程命令</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/customcommand" active-class="menu-active" class="icon icon-line-commandzhiling">自定义指令
                </NuxtLink>
            </li>
            <li class="menu-title">配置中心</li>
            <li>
                <NuxtLink to="/config" active-class="menu-active" class="icon icon-peizhi">插件配置</NuxtLink>
            </li>
        </ul>
        <ul class="menu bg-base-200 rounded-box" v-show=!isCollapsed>
            <li>
                <NuxtLink to="/" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5" data-tip="仪表盘">
                    <i class="icon icon-yibiaopan"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/playerlist" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="玩家列表"><i class="icon icon-renyuanguanli"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/botconfig" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="机器人配置"><i class="icon icon-jiqiren"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/groupmanage" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="QQ群管理"><i class="icon icon-wangluoxitong"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/servers" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="服务器管理"><i class="icon icon-fuwuqi"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/command" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="远程命令"><i class="icon icon-hutong"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/customcommand" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="自定义指令"><i class="icon icon-line-commandzhiling"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/config" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="插件配置"><i class="icon icon-peizhi"></i></NuxtLink>
            </li>
        </ul>
        <div @click="switchAuth" class="flex items-center transition-all duration-300 ease-in-out mt-auto text-3xl bg-base-100 ml-2 mb-2 rounded-md shadow-2xl cursor-pointer"
            :class="{ 'h-10 w-56': isCollapsed, 'h-10 w-12': !isCollapsed }">
            <i class="transition-all duration-300 ease-in-out icon icon-renyuandengji"
                :class="{ 'ml-4': isCollapsed, 'ml-2.5': !isCollapsed }"></i>
            <h1 class="text-2xl mb-1 ml-2 font-bold max-h-8 overflow-hidden"
                :class="{ 'w-auto': isCollapsed, 'w-1': !isCollapsed }" v-show=isCollapsed>{{ adminname }}</h1>
        </div>
    </div>
    <Auth />
</template>

<script setup>
import { ref, computed } from 'vue'
import { useCustomStore } from "~/utils/custom"
import auth from './auth.vue'

const customStore = useCustomStore()
const isCollapsed = computed(() => customStore.isCollapsed)
const adminname = ref('')
const loading = ref(false)

function switchAuth() {
  customStore.switchAuth()
}

const admininfom = async() => {
    try {
    loading.value = true;
    const result = await $fetch('/api/auth', {
      method: 'POST',
      body: {
        action: 'get_inform',
        token: useCookie('auth_token').value,
      },
    });
    if (result.success === true) {
      adminname.value = result.data.name
    } else {
      console.log('获取管理员信息失败', result)
    }
  } catch (err) {
    console.log('获取管理员信息出错', err)
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  admininfom()
})
</script>