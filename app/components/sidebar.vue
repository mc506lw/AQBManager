<template>
    <!-- Desktop sidebar -->
    <div class="flex-col h-screen hidden lg:flex">
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
                <NuxtLink to="/customcommand" active-class="menu-active" class="icon icon-line-commandzhiling">自定义命令
                </NuxtLink>
            </li>
            <li class="menu-title">配置中心</li>
            <li>
                <NuxtLink to="/config" active-class="menu-active" class="icon icon-peizhi">插件配置</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/script" active-class="menu-active" class="icon icon-script">脚本管理</NuxtLink>
            </li>
            <li>
                <NuxtLink to="/theme" active-class="menu-active" class="icon icon-yanse">主题</NuxtLink>
            </li>
            <li class="menu-title">实用工具</li>
            <li>
                <NuxtLink to="/widgets" active-class="menu-active" class="icon icon-gongnengdingyi">小工具</NuxtLink>
            </li>
        </ul>
        <ul class="menu bg-base-200 rounded-box" v-show=!isCollapsed>
            <li>
                <NuxtLink to="/" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5" data-tip="仪表盘">
                    <i class="icon icon-yibiaopan"></i>
                </NuxtLink>
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
                    data-tip="自定义命令"><i class="icon icon-line-commandzhiling"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/config" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="插件配置"><i class="icon icon-peizhi"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/script" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="脚本管理"><i class="icon icon-script"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/theme" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="主题"><i class="icon icon-yanse"></i></NuxtLink>
            </li>
            <li>
                <NuxtLink to="/widgets" active-class="menu-active" class="tooltip tooltip-right text-sm ml-0.5"
                    data-tip="小工具"><i class="icon icon-gongnengdingyi"></i></NuxtLink>
            </li>
        </ul>
        <div @click="switchAuth"
            class="flex items-center transition-all duration-300 ease-in-out mt-auto text-3xl bg-base-100 mx-2 mb-2 rounded-md shadow-2xl cursor-pointer"
            :class="{ 'h-10 w-56': isCollapsed, 'h-10 w-12': !isCollapsed }">
            <i class="transition-all duration-300 ease-in-out icon icon-renyuandengji"
                :class="{ 'ml-4': isCollapsed, 'ml-2.5': !isCollapsed }"></i>
            <h1 class="text-2xl mb-1 ml-2 font-bold max-h-8 overflow-hidden"
                :class="{ 'w-auto': isCollapsed, 'w-1': !isCollapsed }" v-show=isCollapsed>{{ adminname }}</h1>
        </div>
    </div>

    <!-- Mobile sidebar -->
    <div class="drawer lg:hidden max-w-0">
        <input id="sidebar-drawer" type="checkbox" class="drawer-toggle" v-model="mobileDrawerOpen" />
        <div class="drawer-content">
            <!-- Mobile sidebar content will be empty as the toggle is in navbar -->
        </div>
        <div class="drawer-side">
            <label for="sidebar-drawer" class="drawer-overlay"></label>
            <ul class="menu bg-base-200 text-base-content min-h-full w-64 p-4">
                <li>
                    <div class="h-16 flex items-center">
                        <img src="assets/logo.png" class="ml-2 mt-1 h-12 w-12">
                        <h1 class="text-xl ml-2 font-bold">管理后台</h1>
                    </div>
                </li>
                <li class="menu-title">操作菜单</li>
                <li>
                    <NuxtLink to="/" active-class="menu-active" class="icon icon-yibiaopan" @click="closeMobileDrawer">
                        仪表盘</NuxtLink>
                </li>
                <li class="menu-title">玩家管理</li>
                <li>
                    <NuxtLink to="/playerlist" active-class="menu-active" class="icon icon-renyuanguanli"
                        @click="closeMobileDrawer">玩家列表</NuxtLink>
                </li>
                <li class="menu-title">系统配置</li>
                <li>
                    <NuxtLink to="/botconfig" active-class="menu-active" class="icon icon-jiqiren"
                        @click="closeMobileDrawer">机器人配置</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/groupmanage" active-class="menu-active" class="icon icon-wangluoxitong"
                        @click="closeMobileDrawer">QQ群管理</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/servers" active-class="menu-active" class="icon icon-fuwuqi"
                        @click="closeMobileDrawer">服务器管理</NuxtLink>
                </li>
                <li class="menu-title">指令控制</li>
                <li>
                    <NuxtLink to="/command" active-class="menu-active" class="icon icon-hutong"
                        @click="closeMobileDrawer">远程命令</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/customcommand" active-class="menu-active" class="icon icon-line-commandzhiling"
                        @click="closeMobileDrawer">自定义命令</NuxtLink>
                </li>
                <li class="menu-title">配置中心</li>
                <li>
                    <NuxtLink to="/config" active-class="menu-active" class="icon icon-peizhi"
                        @click="closeMobileDrawer">插件配置</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/script" active-class="menu-active" class="icon icon-script" @click="closeMobileDrawer">
                        脚本管理</NuxtLink>
                </li>
                <li>
                    <NuxtLink to="/theme" active-class="menu-active" class="icon icon-yanse" @click="closeMobileDrawer">
                        主题自定义</NuxtLink>
                </li>
                <li class="menu-title">实用工具</li>
                <li>
                    <NuxtLink to="/widgets" active-class="menu-active" class="icon icon-gongnengdingyi"
                        @click="closeMobileDrawer">小工具</NuxtLink>
                </li>
                <li class="mt-auto">
                    <div @click="switchAuth"
                        class="flex items-center text-3xl bg-base-100 rounded-md shadow-md cursor-pointer p-2">
                        <i class="icon icon-renyuandengji"></i>
                        <h1 class="text-2xl ml-2 font-bold">{{ adminname }}</h1>
                    </div>
                </li>
            </ul>
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
const mobileDrawerOpen = ref(false)

function switchAuth() {
    customStore.switchAuth()
}

function closeMobileDrawer() {
    mobileDrawerOpen.value = false
}

const admininfom = async () => {
    try {
        loading.value = true;
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据
        adminname.value = '管理员'
        console.log('使用模拟管理员信息')
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