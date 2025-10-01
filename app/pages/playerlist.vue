<template>
    <div class="w-full bg-base-100">
        <div class="flex flex-col lg:flex-row justify-between w-full outline-1 outline-base-300">
            <div class="flex flex-col lg:flex-row w-full my-6">
                <div class="ml-6 mb-4 lg:mb-0">
                    <div class="text-2xl font-bold">玩家管理</div>
                    <div class="text-xl">管理所有玩家</div>
                </div>
                <div class="ml-6 mb-4 lg:mb-0 flex items-center">
                    <input type="checkbox" checked="checked" class="toggle toggle-md" v-model="onlineStatus"
                        @change="performSearch" />
                    <span class="ml-2">仅在线玩家</span>
                </div>
                <select class="select ml-6 mb-4 lg:mb-0 mt-2 w-64" v-model="selectedServer">
                    <option value="">全部</option>
                    <option v-for="server in uniqueServers" :key="server" :value="server">{{ server }}</option>
                </select>
                <select class="select ml-6 mb-4 lg:mb-0 mt-2 w-64" v-model="selectedQQGroup">
                    <option value="">全部</option>
                    <option v-for="group in uniqueQQGroups" :key="group" :value="group">{{ group }}</option>
                </select>
                <div class="join ml-6 mt-2 w-full lg:w-96">
                    <div>
                        <div>
                            <input class="input join-item w-full" placeholder="搜索内容" v-model="searchInput"
                                @keyup.enter="performSearch" />
                        </div>
                    </div>
                    <div class="indicator">
                        <button class="btn join-item" @click="performSearch">搜索</button>
                    </div>
                </div>
            </div>
            <div class="mx-6 mt-4 lg:mt-8 lg:w-96 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
                <button class="btn btn-outline" @click="refreshData">刷新状态</button>
                <button class="btn btn-outline" onclick="addplayermodal.showModal()">添加玩家</button>
            </div>
        </div>
        <div class="overflow-auto h-96 md:h-[85vh]">
            <table class="table table-zebra">
                <thead>
                    <tr>
                        <th class="w-16">在线</th>
                        <th class="w-48">ID</th>
                        <th class="w-32">QQ</th>
                        <th class="w-32">服务器</th>
                        <th class="w-48">QQ群</th>
                        <th class="w-32">操作</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in displayedItems" :key="index">
                        <td>
                            <span v-if="item.online" class="inline-block w-4 h-4 rounded-full bg-green-500"></span>
                        </td>
                        <td>
                            <div class="font-bold">{{ item.id }}</div>
                        </td>
                        <td>
                            {{ item.qq }}
                        </td>
                        <td>{{ item.server }}</td>
                        <td>{{ item.qq_group }}</td>
                        <td>
                            <div class="join join-vertical lg:join-horizontal">
                                <button class="btn btn-soft btn-info btn-xs join-item"
                                    @click="showPlayerDetails(item)">详细</button>
                                <button @click="showDeleteConfirm(item)"
                                    class="btn btn-soft btn-error btn-xs join-item">删除</button>
                            </div>
                        </td>
                    </tr>
                </tbody>
            </table>
            <!-- 分页组件 -->
            <div class="join w-full mt-4 mb-4 justify-center flex-wrap" v-if="totalPages > 1">
                <button class="join-item btn btn-sm" @click="goToPage(1)" :disabled="currentPage === 1">«</button>

                <!-- 显示当前页前后几页的按钮 -->
                <template v-for="page in displayedPages" :key="page">
                    <button class="join-item btn btn-sm" :class="{ 'btn-active': page === currentPage }"
                        @click="goToPage(page)">
                        {{ page }}
                    </button>
                </template>

                <button class="join-item btn btn-sm" @click="goToPage(totalPages)"
                    :disabled="currentPage === totalPages">»</button>
            </div>
        </div>
        <dialog id="playerinfomodal" class="modal">
            <div class="modal-box w-11/12 max-w-2xl">
                <h3 class="text-lg font-bold">玩家详细信息</h3>
                <div v-if="currentPlayerDetails">
                    <div class="flex flex-col sm:flex-row justify-between py-2">
                        <p>UUID:</p>
                        <p class="sm:text-right">{{ currentPlayerDetails.uuid }}</p>
                    </div>
                    <div class="flex flex-col sm:flex-row justify-between py-2">
                        <p>在线状态:</p>
                        <p class="sm:text-right">{{ currentPlayerDetails.online ? '在线' : '离线' }}</p>
                    </div>
                    <div v-if="currentPlayerDetails.online" class="flex flex-col sm:flex-row justify-between py-2">
                        <p>IP地址:</p>
                        <p class="sm:text-right">{{ currentPlayerDetails.ip }}</p>
                    </div>
                </div>
                <div v-else>
                    <p>加载中...</p>
                </div>
            </div>
            <form method="dialog" class="modal-backdrop">
                <button>关闭</button>
            </form>
        </dialog>
        <dialog id="deleteconfirm" class="modal">
            <div class="modal-box w-11/12 max-w-md">
                <h3 class="text-lg font-bold">确认删除玩家</h3>
                <p class="py-4">确认删除玩家 {{ currentDeletePlayer?.id }} 吗？</p>
                <div class="modal-action flex-col sm:flex-row">
                    <button class="btn btn-error mb-2 sm:mb-0 sm:mr-2" @click="confirmDelete">确认删除</button>
                    <form method="dialog">
                        <button class="btn w-full sm:w-auto">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <dialog id="addplayermodal" class="modal">
            <div class="modal-box w-11/12 max-w-md">
                <h3 class="text-lg font-bold">添加玩家</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">服务器</span>
                    </label>
                    <select class="select mt-2 w-full" v-model="selectedServer">
                        <option v-for="server in uniqueServers" :key="server" :value="server">{{ server }}</option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">QQ号</span>
                    </label>
                    <input v-model="newplayerqq" type="text" placeholder="请输入QQ号"
                        class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary w-full" />
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">玩家ID</span>
                    </label>
                    <input v-model="newplayerid" type="text" placeholder="请输入玩家ID"
                        class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary w-full" />
                </div>
                <div class="modal-action flex-col sm:flex-row mt-4">
                    <button class="btn btn-success mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto" @click="confirmAdd">确认添加</button>
                    <form method="dialog">
                        <button class="btn w-full sm:w-auto">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <div class="toast toast-end" v-if="showToast">
            <div
                :class="`alert alert-${toastType} transition-all duration-300 ease-in-out transform ${showToast ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`">
                <span>{{ toastMessage }}</span>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { mockPlayerList } from '~/utils/mockData';

const token = useCookie('auth_token');
const playerlists = ref([]);
const servers = ref([]);

// 根据服务器名称获取UUID
const getServersUuidByName = (serverName) => {
    const server = servers.value.find(s => s.name === serverName || s.uuid === serverName);
    return server ? server.uuid : null;
};

const items = ref([]);
const searchInput = ref('');
const searchText = ref('');
const selectedServer = ref('');
const selectedQQGroup = ref('');
const onlineStatus = ref(false); // 添加在线状态切换变量
const currentPlayerDetails = ref(null); // 添加存储玩家详细信息的变量
const currentDeletePlayer = ref(null); // 添加存储当前要删除的玩家信息的变量
const newplayerqq = ref(''); // 添加存储新玩家QQ号的变量
const newplayerid = ref(''); // 添加存储新玩家ID的变量

// Toast相关变量
const toastMessage = ref('');
const toastType = ref('info'); // 'info', 'success', 'warning', 'error'
const showToast = ref(false);

// 显示toast消息的函数
const showToastMessage = (message, type = 'info') => {
    toastMessage.value = message;
    toastType.value = type;
    showToast.value = true;

    // 3秒后自动隐藏
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

// 分页相关变量
const currentPage = ref(1);
const itemsPerPage = 10;

// 计算唯一服务器列表
const uniqueServers = computed(() => {
    const servers = items.value.map(item => item.server);
    return [...new Set(servers)];
});

// 计算唯一QQ群列表
const uniqueQQGroups = computed(() => {
    const groups = [];
    items.value.forEach(item => {
        if (item.qq_group) {
            // 将逗号分隔的群组字符串拆分成单独的群组ID
            const groupIds = item.qq_group.split(', ').filter(id => id.trim() !== '');
            groups.push(...groupIds);
        }
    });
    return [...new Set(groups)];
});

// 计算筛选后的项目
const filteredItems = computed(() => {
    return items.value.filter(item => {
        // 仅显示在线玩家
        if (onlineStatus.value && !item.online) {
            return false;
        }

        // 服务器筛选
        if (selectedServer.value && item.server !== selectedServer.value) {
            return false;
        }

        // QQ群筛选
        if (selectedQQGroup.value && !item.qq_group.split(', ').includes(selectedQQGroup.value)) {
            return false;
        }

        // 搜索功能
            if (searchText.value) {
                const searchLower = searchText.value.toLowerCase();
                // 检查QQ群是否包含搜索关键词
                const qqGroupMatch = item.qq_group.split(', ').some(group => group.toLowerCase().includes(searchLower));
                return (
                    item.id.toLowerCase().includes(searchLower) ||
                    item.qq.toLowerCase().includes(searchLower) ||
                    item.server.toLowerCase().includes(searchLower) ||
                    qqGroupMatch
                );
            }

        return true;
    });
});

// 计算总页数
const totalPages = computed(() => {
    return Math.ceil(filteredItems.value.length / itemsPerPage);
});

// 计算显示的页码（当前页前后几页）
const displayedPages = computed(() => {
    const pages = [];
    const delta = 2; // 当前页前后显示的页数

    const startPage = Math.max(1, currentPage.value - delta);
    const endPage = Math.min(totalPages.value, currentPage.value + delta);

    for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
    }

    return pages;
});

// 计算当前页显示的项目
const displayedItems = computed(() => {
    const start = (currentPage.value - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredItems.value.slice(start, end);
});

// 翻页函数
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
    }
};

const performSearch = () => {
    // 将输入框的值赋给搜索文本，触发筛选
    searchText.value = searchInput.value;
    // 搜索时重置到第一页
    currentPage.value = 1;
};

// 刷新数据
const refreshData = async () => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据
        items.value = mockPlayerList;
        console.log('玩家列表数据刷新成功（模拟数据）');
        showToastMessage('玩家列表数据刷新成功（模拟数据）', 'success');
    } catch (error) {
        console.error('刷新玩家列表数据时发生错误:', error);
        showToastMessage(`刷新玩家列表数据时发生错误: ${error.message}`, 'error');
    }
};

onMounted(async () => {
    await getservers()
    await getplayerlists()
});

const getservers = async () => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        servers.value = [
            { uuid: 'server-uuid-1', name: '生存服务器' },
            { uuid: 'server-uuid-2', name: '创造服务器' },
            { uuid: 'server-uuid-3', name: '冒险服务器' }
        ];
        console.log('服务器列表获取成功（模拟数据）');
    } catch (error) {
        showToastMessage(`服务器列表获取失败: ${error.message}`, 'error');
    }
};

const getplayerlists = async () => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        items.value = mockPlayerList;
        console.log('玩家列表获取成功（模拟数据）');
    } catch (error) {
        console.error('获取玩家列表时发生错误:', error);
        showToastMessage(`获取玩家列表时发生错误: ${error.message}`, 'error');
    }
};

// 获取玩家详细信息
const getPlayerDetails = async (playerId, serverUuid) => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        const mockDetails = {
            name: playerId,
            health: 20,
            food: 20,
            gamemode: 'survival',
            location: { x: 0, y: 64, z: 0 },
            inventory: []
        };
        console.log('玩家详细信息获取成功（模拟数据）');
        return mockDetails;
    } catch (error) {
        showToastMessage(`获取玩家详细信息时发生错误: ${error.message}`, 'error');
        return null;
    }
};

const showPlayerDetails = async (player) => {
    // 获取玩家详细信息
    const details = await getPlayerDetails(player.id, getServersUuidByName(player.server));
    if (details) {
        currentPlayerDetails.value = details;
        // 显示模态框
        document.getElementById('playerinfomodal').showModal();
    }
};

// 显示删除确认模态框
const showDeleteConfirm = (player) => {
    currentDeletePlayer.value = player;
    document.getElementById('deleteconfirm').showModal();
};

// 确认删除玩家
const confirmDelete = async () => {
    if (!currentDeletePlayer.value) return;

    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据 - 实际项目中这里会调用API删除玩家
        console.log(`删除玩家: QQ=${currentDeletePlayer.value.qq}, ID=${currentDeletePlayer.value.id}`);
        
        // 删除成功，从列表中移除该玩家
        const index = items.value.findIndex(item =>
            item.id === currentDeletePlayer.value.id &&
            item.qq === currentDeletePlayer.value.qq
        );
        if (index !== -1) {
            items.value.splice(index, 1);
        }
        // 关闭模态框
        document.getElementById('deleteconfirm').close();
        showToastMessage('玩家删除成功（模拟数据）', 'success');
    } catch (error) {
        showToastMessage(`删除玩家时发生错误: ${error.message}`, 'error');
    }
};

// 确认添加玩家
const confirmAdd = async () => {
    // 检查必填字段
    if (!selectedServer.value) {
        showToastMessage('请选择服务器', 'warning');
        return;
    }
    if (!newplayerqq.value) {
        showToastMessage('请输入QQ号', 'warning');
        return;
    }
    if (!newplayerid.value) {
        showToastMessage('请输入玩家ID', 'warning');
        return;
    }

    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据 - 实际项目中这里会调用API添加玩家
        console.log(`添加玩家: QQ=${newplayerqq.value}, ID=${newplayerid.value}`);
        showToastMessage('玩家添加成功（模拟数据）', 'success');
        
        // 添加成功，刷新数据
        await refreshData();
        // 关闭模态框
        document.getElementById('addplayermodal').close();
        // 清空输入框
        newplayerqq.value = '';
        newplayerid.value = '';
    } catch (error) {
        showToastMessage(`添加玩家时发生错误: ${error.message}`, 'error');
    }
};
</script>