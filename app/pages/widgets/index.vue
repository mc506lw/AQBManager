<template>
    <div class="max-w-full bg-base-100 p-6">
        <!-- 标题区域 -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold">小工具中心</h1>
            <p class="text-sm text-base-content/70 mt-2">访问和管理各种实用小工具</p>
        </div>

        <!-- 小工具卡片网格 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- 动态渲染的小工具卡片 -->
            <a :href="widget.isExternal ? widget.url : widget.path" :target="widget.isExternal ? '_blank' : ''" v-for="(widget, index) in widgets"
                :key="index"
                class="card bg-base-200 shadow-md hover:shadow-xl transition-shadow duration-300 cursor-pointer card-compact h-36"
                @click="widget.isExternal ? openExternalLink(widget.url) : openWidget(widget.path)">
                <div class="card-body p-4">
                    <div class="flex items-center mb-3">
                        <i :class="`icon ${widget.icon} text-2xl text-base-content mr-2`"></i>
                        <h2 class="card-title text-md">{{ widget.title }}</h2>
                    </div>
                    <p class="text-base-content/70 text-xs mb-3">{{ widget.description }}</p>
                    <div class="text-xs text-base-content/50 mb-3" v-show="widget.source">
                        {{ widget.source }}
                    </div>
                </div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

// 小工具数据
const widgets = ref([
    {
        title: 'MCID',
        description: '我的世界方块名称和ID查询',
        icon: 'icon-weibiaoti--',
        url: 'https://mcid.lingningyu.cn/',
        isExternal: true,
        source: '来源: mcid.lingningyu.cn'
    },
    {
        title: 'NitWikit',
        description: '我的世界笨蛋开服文档',
        icon: 'icon-pingtaijiaocheng',
        url: 'https://nitwikit.8aka.cn/',
        isExternal: true,
        source: '来源: nitwikit.8aka.cn'
    },
    {
        title: 'MCID',
        description: '我的世界方块名称和ID查询',
        icon: 'icon-weibiaoti--',
        url: 'https://mcid.lingningyu.cn/',
        isExternal: true,
        source: '来源: mcid.lingningyu.cn'
    },
    {
        title: 'MCUUID',
        description: '我的世界UUID查询',
        icon: 'icon-uuid',
        url: 'https://mcuuid.net/',
        isExternal: true,
        source: '来源: mcuuid.net'
    },
    {
        title: '3DMC标题生成',
        description: '3DMC标题生成',
        icon: 'icon-dabiaoti',
        url: 'http://3dt.easecation.net/',
        isExternal: true,
        source: '来源: easecation.net'
    },
    {
        title: 'RGBirdflop',
        description: '创建十六进制颜色渐变',
        icon: 'icon-yanse',
        url: 'https://www.birdflop.com/resources/rgb/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: '动画TAB',
        description: 'TAB插件渐变动画创建器',
        icon: 'icon-yingshidonghuazhizuo font-bold',
        url: 'https://www.birdflop.com/resources/animtab/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: 'TAB动画预览',
        description: '在无需放入游戏中的情况下预览TAB动画',
        icon: 'icon-jiaohuyanshidonghua font-bold',
        url: 'https://www.birdflop.com/resources/animpreview/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: 'RGBirdflop 预设',
        description: '找到渐变颜色预设搭配',
        icon: 'icon-sketchpad-theme-full',
        url: 'https://www.birdflop.com/resources/rgb/presets/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: 'RGBirdflop',
        description: '创建十六进制颜色渐变',
        icon: 'icon-RGB1',
        url: 'https://www.birdflop.com/resources/rgb/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: '启动脚本生成器',
        description: '一个简单的脚本生成器，用于以最佳参数启动Minecraft服务器',
        icon: 'icon-qidong',
        url: 'https://www.birdflop.com/resources/flags/',
        isExternal: true,
        source: '来源: www.birdflop.com'
    },
    {
        title: 'Minebbs',
        description: '在Minebbs上寻找插件',
        icon: 'icon-chajian',
        url: 'https://www.minebbs.com/forums/mcjeplugin/',
        isExternal: true,
        source: '来源: www.minebbs.com'
    },
    {
        title: 'SpigotMC',
        description: 'SpigotMC插件库',
        icon: 'icon-chajian',
        url: 'https://www.spigotmc.org/resources/categories/spigot.4/',
        isExternal: true,
        source: '来源: www.spigotmc.org'
    },
    {
        title: 'Klpbbs',
        description: '在Klpbbs上寻找插件',
        icon: 'icon-chajian',
        url: 'https://klpbbs.com/forum-57-1.html',
        isExternal: true,
        source: '来源: klpbbs.com'
    },
    {
        title: 'Modrinth',
        description: 'Modrinth插件库',
        icon: 'icon-chajian',
        url: 'https://modrinth.com/plugins',
        isExternal: true,
        source: '来源: modrinth.com'
    },
    {
        title: 'Ping工具',
        description: '获取服务器Ping信息',
        icon: 'icon-yanchi-01',
        path: '/widgets/ping',
        isExternal: false,
        source: '接口: api.mcsrvstat.us'
    }
]);

const openWidget = (path) => {
    navigateTo(path);
};

const openExternalLink = (url) => {
    // 打开外部链接
    window.open(url, '_blank');
};

// 添加新小工具的方法
const addWidget = (widget) => {
    widgets.value.push(widget);
};
</script>

<style scoped>
/* 可以添加一些自定义样式 */
</style>