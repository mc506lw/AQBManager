<template>
    <div class="max-w-full bg-base-100 p-6">
        <!-- 标题区域 -->
        <div class="mb-8">
            <h1 class="text-4xl font-bold"><span class="font-[ZSFT-530]">AQQBot</span> 管理平台</h1>
            <p class="text-sm text-base-content/70 mt-2">实时管理服务器上AQQBot插件的功能与行为</p>
        </div>

        <!-- 系统信息卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <!-- CPU使用率图表 -->
            <div class="card card-lg bg-base-100 shadow-sm">
                <div class="card-body p-4">
                    <h2 class="card-title text-lg">CPU 使用率</h2>
                    <div class="h-48">
                        <canvas ref="cpuChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- 内存使用率图表 -->
            <div class="card bg-base-100 card-lg shadow-sm">
                <div class="card-body p-4">
                    <h2 class="card-title text-lg">内存使用率</h2>
                    <div class="h-48">
                        <canvas ref="memoryChart"></canvas>
                    </div>
                </div>
            </div>

            <!-- 接口请求量图表 -->
            <div class="card bg-base-100 card-lg shadow-sm">
                <div class="card-body p-4">
                    <h2 class="card-title text-lg">接口请求量</h2>
                    <div class="h-48">
                        <canvas ref="requestChart"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- 系统信息和服务器统计 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <!-- 系统信息 -->
            <div class="card bg-base-100 card-lg shadow-sm">
                <div class="card-body">
                    <h2 class="card-title">系统信息</h2>
                    <div class="grid grid-cols-2 gap-2 text-sm">
                        <div><span class="font-semibold">Node版本:</span> {{ systemInfo.nodeVersion }}</div>
                        <div><span class="font-semibold">面板版本:</span> {{ systemInfo.panelVersion }}</div>
                        <div><span class="font-semibold">节点版本:</span> {{ systemInfo.nodeVersionInfo }}</div>
                        <div><span class="font-semibold">用户名:</span> {{ systemInfo.username }}</div>
                        <div><span class="font-semibold">面板时间:</span> {{ systemInfo.panelTime }}</div>
                        <div><span class="font-semibold">浏览器时间:</span> {{ systemInfo.browserTime }}</div>
                        <div><span class="font-semibold">总内存:</span> {{ systemInfo.totalMemory }} MB</div>
                        <div><span class="font-semibold">空闲内存:</span> {{ systemInfo.freeMemory }} MB</div>
                        <div><span class="font-semibold">负载平均值:</span> {{ systemInfo.loadAverage ?
                            (systemInfo.loadAverage.every(val => val === 0) ? 'N/A' : systemInfo.loadAverage.map(val => val.toFixed(2)).join(', ')) : 'N/A' }}</div>
                        <div><span class="font-semibold">面板内存使用:</span> {{ systemInfo.panelMemoryUsage ?
                            systemInfo.panelMemoryUsage.toFixed(2) : 'N/A' }} MB
                        </div>
                        <div><span class="font-semibold">主机名:</span> {{ systemInfo.hostname }}</div>
                        <div><span class="font-semibold">平台:</span> {{ systemInfo.platform }}</div>
                        <div><span class="font-semibold">系统类型:</span> {{ systemInfo.type }}</div>
                        <div><span class="font-semibold">系统版本:</span> {{ systemInfo.release }}</div>
                    </div>
                </div>
            </div>

            <!-- 服务器统计 -->
            <div class="card bg-base-100 card-lg shadow-sm">
                <div class="card-body">
                    <h2 class="card-title">服务器统计</h2>
                    <div class="grid grid-cols-2 gap-4">
                        <div class="text-center p-4 bg-base-200 rounded-lg">
                            <div class="text-3xl font-bold">{{ serverStats.total }}</div>
                            <div class="text-sm">服务器总计</div>
                        </div>
                        <div class="text-center p-4 bg-base-200 rounded-lg">
                            <div class="text-3xl font-bold">{{ serverStats.connected }}</div>
                            <div class="text-sm">已连接</div>
                        </div>
                    </div>
                    <div class="mt-4">
                        <h3 class="font-semibold mb-2">服务器列表</h3>
                        <div class="max-h-40 overflow-y-auto">
                            <div v-for="(server, uuid) in serverList" :key="uuid"
                                class="flex justify-between items-center p-2 border-b border-base-300">
                                <span>{{ server.name || server.ip }}</span>
                                <span :class="server.connected ? 'text-success' : 'text-error'">
                                    {{ server.connected ? '在线' : '离线' }}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 作者信息 -->
        <div class="stats shadow w-full">
            <a href="https://qm.qq.com/q/RWfSmi4xmC" target="_blank" class="stat">
                <div class="stat-figure text-blue-400 icon icon-QQ text-4xl">
                </div>
                <div class="stat-title">QQ群</div>
                <div class="stat-value text-blue-400">669737143</div>
                <div class="stat-desc">交流群</div>
            </a>

            <a href="https://github.com/Alazeprt" target="_blank" class="stat">
                <div class="stat-figure text-black icon icon-GitHub text-4xl">
                </div>
                <div class="stat-title">插件作者</div>
                <div class="stat-value text-black">Alazeprt</div>
            </a>

            <a href="https://github.com/mc506lw" target="_blank" class="stat">
                <div class="stat-figure text-black icon icon-GitHub text-4xl">
                </div>
                <div class="stat-title">面板作者</div>
                <div class="stat-value text-black">mc506lw</div>
            </a>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useCustomStore } from '~/utils/custom'
import Chart from 'chart.js/auto'

// 获取token
const token = useCookie('auth_token').value

// 数据状态
const systemInfo = ref({})
const serverStats = ref({ total: 0, connected: 0 })
const serverList = ref({})

// 图表引用
const cpuChart = ref(null)
const memoryChart = ref(null)
const requestChart = ref(null)

// Chart.js 实例
let cpuChartInstance = null
let memoryChartInstance = null
let requestChartInstance = null

// 时间序列数据
const cpuData = ref([])
const memoryData = ref([])
const requestData = ref([])
const timeLabels = ref([])

// 初始化图表
const initCharts = () => {
    if (cpuChart.value) {
        cpuChartInstance = new Chart(cpuChart.value, {
            type: 'line',
            data: {
                labels: timeLabels.value,
                datasets: [{
                    label: 'CPU 使用率 (%)',
                    data: cpuData.value,
                    borderColor: '#60a5fa',
                    backgroundColor: 'rgba(96, 165, 250, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        })
    }

    if (memoryChart.value) {
        memoryChartInstance = new Chart(memoryChart.value, {
            type: 'line',
            data: {
                labels: timeLabels.value,
                datasets: [{
                    label: '内存使用率 (%)',
                    data: memoryData.value,
                    borderColor: '#34d399',
                    backgroundColor: 'rgba(52, 211, 153, 0.1)',
                    borderWidth: 2,
                    fill: true
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        })
    }

    if (requestChart.value) {
        requestChartInstance = new Chart(requestChart.value, {
            type: 'bar',
            data: {
                labels: timeLabels.value,
                datasets: [{
                    label: '请求数',
                    data: requestData.value,
                    backgroundColor: '#fbbf24',
                    borderColor: '#f59e0b',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        })
    }
}

// 更新图表数据
const updateChartData = () => {
    const now = new Date()
    const timeLabel = `${now.getHours()}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`

    // 限制数据点数量，只保留最近30个数据点
    // 使用非响应式方法避免无限递归
    let newTimeLabels = [...timeLabels.value]
    let newCpuData = [...cpuData.value]
    let newMemoryData = [...memoryData.value]
    let newRequestData = [...requestData.value]

    if (newTimeLabels.length >= 30) {
        newTimeLabels.shift()
        newCpuData.shift()
        newMemoryData.shift()
        newRequestData.shift()
    }

    newTimeLabels.push(timeLabel)
    timeLabels.value = newTimeLabels

    // 添加新的数据点
    // 根据新的方法计算CPU使用率
    let cpuUsageValue = null; // 初始化为null，表示没有有效值
    if (systemInfo.value.cpuUsage && Array.isArray(systemInfo.value.cpuUsage) && systemInfo.value.cpuUsage.length > 0) {
        try {
            // 获取当前CPU信息
            let user = 0, nice = 0, sys = 0, idle = 0, irq = 0, total = 0;
            systemInfo.value.cpuUsage.forEach((cpu) => {
                user += cpu.user || 0;
                nice += cpu.nice || 0;
                sys += cpu.sys || 0;
                idle += cpu.idle || 0;
                irq += cpu.irq || 0;
            });
            total = user + nice + sys + idle + irq;

            // 保存当前CPU信息用于下次计算
            if (!window.previousCPUInfo) {
                window.previousCPUInfo = { user, sys, idle, total };
                cpuUsageValue = null; // 第一次无法计算使用率
            } else {
                // 计算使用率
                const idleDiff = idle - window.previousCPUInfo.idle;
                const totalDiff = total - window.previousCPUInfo.total;

                // 增加边界条件检查，防止除零错误
                if (totalDiff > 0) {
                    const calculatedValue = Math.max(0, Math.min(100, (1 - idleDiff / totalDiff) * 100));
                    // 如果计算结果为0，使用上一个数据点的值
                    if (calculatedValue === 0 && window.lastValidCPUUsage !== undefined) {
                        cpuUsageValue = window.lastValidCPUUsage;
                    } else if (calculatedValue > 0) {
                        // 只有当计算结果大于0时才更新lastValidCPUUsage
                        cpuUsageValue = calculatedValue;
                        window.lastValidCPUUsage = calculatedValue;
                    } else {
                        // 如果计算结果为0且没有上一个有效值，则保持null
                        cpuUsageValue = null;
                    }
                } else {
                    // 如果totalDiff为0，尝试使用上一个数据点的值
                    if (window.lastValidCPUUsage !== undefined) {
                        cpuUsageValue = window.lastValidCPUUsage;
                    } else {
                        cpuUsageValue = null;
                    }
                }

                // 更新previousCPUInfo
                window.previousCPUInfo = { user, sys, idle, total };
            }
        } catch (e) {
            console.warn('计算CPU使用率时出错:', e);
            // 出错时尝试使用上一个数据点的值
            if (window.lastValidCPUUsage !== undefined) {
                cpuUsageValue = window.lastValidCPUUsage;
            } else {
                cpuUsageValue = null;
            }
        }
    } else {
        // 如果没有CPU数据，尝试使用上一个数据点的值
        if (window.lastValidCPUUsage !== undefined) {
            cpuUsageValue = window.lastValidCPUUsage;
        } else {
            cpuUsageValue = null;
        }
    }

    newCpuData.push(cpuUsageValue)
    newMemoryData.push(systemInfo.value.ramUsage || 0)
    newRequestData.push(systemInfo.value.requestCount || 0)

    cpuData.value = newCpuData
    memoryData.value = newMemoryData
    requestData.value = newRequestData

    // 更新图表
    if (cpuChartInstance) {
        cpuChartInstance.data.labels = timeLabels.value
        cpuChartInstance.data.datasets[0].data = cpuData.value
        cpuChartInstance.update('none')
    }
    if (memoryChartInstance) {
        memoryChartInstance.data.labels = timeLabels.value
        memoryChartInstance.data.datasets[0].data = memoryData.value
        memoryChartInstance.update('none')
    }
    if (requestChartInstance) {
        requestChartInstance.data.labels = timeLabels.value
        requestChartInstance.data.datasets[0].data = requestData.value
        requestChartInstance.update('none')
    }
}

// 获取系统信息
const fetchSystemInfo = async () => {
    try {
        const result = await $fetch('/api/node', {
            method: 'POST',
            body: {
                action: 'get_inform',
                token: token
            }
        })

        if (result) {
            systemInfo.value = result
            console.log('系统信息:', result)
            // 更新面板时间
            systemInfo.value.panelTime = new Date().toLocaleString()
        }
    } catch (error) {
        console.error('获取系统信息失败:', error)
    }
}

// 获取服务器信息
const fetchServerInfo = async () => {
    try {
        // 获取服务器总数
        const serversResult = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'get_servers',
                token: token
            }
        })

        if (serversResult.success) {
            serverStats.value.total = serversResult.servers.length
            serverList.value = {}
            serversResult.servers.forEach(server => {
                serverList.value[server.uuid] = {
                    name: server.name,
                    ip: server.ip,
                    connected: false
                }
            })
        }

        // 获取已连接服务器数
        const statusResult = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'get_all_status',
                token: token
            }
        })

        if (statusResult.success) {
            const connectedServers = Object.values(statusResult.allStatus).filter(status => status.success).length
            serverStats.value.connected = connectedServers

            // 更新服务器列表状态
            Object.keys(statusResult.allStatus).forEach(uuid => {
                if (serverList.value[uuid]) {
                    serverList.value[uuid].connected = statusResult.allStatus[uuid].success
                }
            })
        }
    } catch (error) {
        console.error('获取服务器信息失败:', error)
    }
}

// 定时更新数据
let updateInterval = null

const startDataUpdate = () => {
    // 立即获取一次数据
    fetchSystemInfo()
    fetchServerInfo()

    // 每5秒更新一次数据
    updateInterval = setInterval(() => {
        fetchSystemInfo()
        fetchServerInfo()
    }, 5000)
}

const stopDataUpdate = () => {
    if (updateInterval) {
        clearInterval(updateInterval)
        updateInterval = null
    }
}

// 组件挂载时初始化
onMounted(() => {
    initCharts()
    startDataUpdate()

    // 每3秒更新图表数据
    setInterval(() => {
        updateChartData()
    }, 3000)
})

// 组件卸载时清理
onUnmounted(() => {
    stopDataUpdate()
    if (cpuChartInstance) cpuChartInstance.destroy()
    if (memoryChartInstance) memoryChartInstance.destroy()
    if (requestChartInstance) requestChartInstance.destroy()
})
</script>