<template>
    <div class="w-full h-full">
        <div class="flex flex-col lg:flex-row justify-between w-full">
            <div class="mt-6 ml-6">
                <div class="text-2xl font-bold">QQ群管理</div>
                <div class="text-xl">管理QQ群状态</div>
            </div>
            <div class="mx-6 mt-8 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
                <button class="btn btn-outline" @click="refreshData">刷新状态</button>
                <button class="btn btn-outline" @click="showDeleteGroupModal">删除QQ群</button>
                <button class="btn btn-outline" @click="showAddGroupModal">添加QQ群</button>
            </div>
        </div>
        <div class="mt-6 mx-6">
            <!-- 筛选器 -->
            <div class="flex flex-col lg:flex-row flex-wrap gap-4 mb-4">
                <select class="select select-bordered w-full lg:w-64" v-model="selectedServer">
                    <option value="">全部服务器</option>
                    <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}</option>
                </select>
                <select class="select select-bordered w-full lg:w-64" v-model="selectedGroup">
                    <option value="">全部QQ群</option>
                    <option v-for="group in allGroups" :key="group" :value="group">{{ group }}</option>
                </select>
                <div class="join w-full lg:w-96">
                    <input class="input input-bordered join-item w-full" placeholder="搜索" v-model="searchInput"
                        @keyup.enter="performSearch" />
                    <button class="btn join-item" @click="performSearch">搜索</button>
                </div>
            </div>
        </div>
        <div class="w-full h-[78%] mt-6">
            <div class="flex h-full mx-6 rounded-xl p-4 flex-col">
                <!-- 未绑定成员列表 -->
                <div class="text-2xl font-bold" v-if="filteredUnboundMembers.length > 0">未绑定的成员</div>
                <div class="w-full mt-4 flex-1 overflow-y-auto">
                    <div class="overflow-x-auto" v-if="filteredUnboundMembers.length > 0">
                        <table class="table table-zebra">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th class="w-32">QQ群号</th>
                                    <th class="w-32">服务器</th>
                                    <th class="w-32">名称</th>
                                    <th class="w-32">QQ号</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(member, index) in filteredUnboundMembers" :key="member.qq">
                                    <th>{{ index + 1 }}</th>
                                    <td>{{ member.groupId }}</td>
                                    <td>{{ member.server }}</td>
                                    <td>{{ member.name }}</td>
                                    <td>{{ member.qq }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <div class="my-4 flex justify-center items-center" v-if="filteredUnboundMembers.length === 0">
                        没有找到未绑定的成员</div>
                </div>
            </div>
        </div>
        <!-- 添加QQ群模态框 -->
        <dialog id="addgroupmodal" class="modal">
            <div class="modal-box w-11/12 max-w-md">
                <h3 class="text-lg font-bold">添加QQ群</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">服务器</span>
                    </label>
                    <select class="select mt-2 w-full" v-model="selectedServer">
                        <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}
                        </option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">QQ群号</span>
                    </label>
                    <input v-model="newGroupId" type="text" placeholder="请输入QQ群号" class="input input-bordered w-full" />
                </div>
                <div class="modal-action flex-col sm:flex-row mt-4">
                    <button class="btn btn-success mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto" @click="confirmAddGroup">确认添加</button>
                    <form method="dialog">
                        <button class="btn w-full sm:w-auto">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <!-- 删除QQ群模态框 -->
        <dialog id="deletegroupmodal" class="modal">
            <div class="modal-box w-11/12 max-w-md">
                <h3 class="text-lg font-bold">删除QQ群</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">服务器</span>
                    </label>
                    <select class="select mt-2 w-full" v-model="deleteSelectedServer" @change="deleteSelectedGroup = ''">
                        <option value="">请选择服务器</option>
                        <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}
                        </option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text">QQ群号</span>
                    </label>
                    <select class="select mt-2 w-full" v-model="deleteSelectedGroup" :disabled="!deleteSelectedServer">
                        <option value="">请选择QQ群</option>
                        <option v-for="group in getGroupsForServer(deleteSelectedServer)" :key="group" :value="group">{{
                            group }}</option>
                    </select>
                </div>
                <div class="modal-action flex-col sm:flex-row">
                    <button class="btn btn-error mb-2 sm:mb-0 sm:mr-2 w-full sm:w-auto" @click="confirmDeleteGroup"
                        :disabled="!deleteSelectedGroup">确认删除</button>
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
import { mockServers, mockGroups, mockGroupMembers, mockBoundUsers } from '~/utils/mockData';

const token = useCookie('auth_token');
const servers = ref([]);
const groups = ref({}); // 存储每个服务器的群组信息
const groupMembers = ref({}); // 存储每个群组的成员信息
const boundUsers = ref({}); // 存储每个群组的已绑定用户信息
const unboundMembers = ref([]); // 存储所有未绑定成员

const selectedServer = ref('');
const selectedGroup = ref('');
const searchInput = ref('');
const searchText = ref('');

const newGroupId = ref('');
const currentDeleteGroup = ref('');

// 删除QQ群相关变量
const deleteSelectedServer = ref('');
const deleteSelectedGroup = ref('');

// Toast相关变量
const showToast = ref(false);
const toastType = ref(''); // 'success' 或 'error'
const toastMessage = ref('');

// 显示Toast的函数
const showToastMessage = (type, message) => {
    toastType.value = type;
    toastMessage.value = message;
    showToast.value = true;

    // 3秒后自动隐藏Toast
    setTimeout(() => {
        showToast.value = false;
    }, 3000);
};

// 获取服务器列表
const getservers = async () => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        servers.value = mockServers;
        console.log('服务器列表获取成功（模拟数据）');
        showToastMessage('success', '服务器列表获取成功（模拟数据）');
    } catch (error) {
        console.error(`获取服务器列表时发生错误: ${error.message}`);
        showToastMessage('error', `获取服务器列表时发生错误: ${error.message}`);
    }
};

// 获取服务器的群组列表
const getServerGroups = async (serverUuid) => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        // 初始化groups对象中的服务器条目
        if (!groups.value[serverUuid]) {
            groups.value[serverUuid] = [];
        }
        // 更新群组信息
        groups.value[serverUuid] = mockGroups[serverUuid] || [];
        console.log(`服务器 ${serverUuid} 的群组列表获取成功（模拟数据）`);
        showToastMessage(`服务器 ${serverUuid} 的群组列表获取成功（模拟数据）`, 'success');
    } catch (error) {
        console.error(`获取服务器 ${serverUuid} 的群组列表时发生错误: ${error.message}`);
        showToastMessage(`获取服务器 ${serverUuid} 的群组列表时发生错误: ${error.message}`, 'error');
    }
};

// 获取群组成员列表
const getGroupMembers = async (serverUuid, groupId) => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        // 初始化groupMembers对象中的条目
        if (!groupMembers.value[groupId]) {
            groupMembers.value[groupId] = {};
        }
        // 更新成员信息
        groupMembers.value[groupId] = mockGroupMembers[groupId] || {};
        console.log(`群组 ${groupId} 的成员列表获取成功（模拟数据）`);
        showToastMessage(`群组 ${groupId} 的成员列表获取成功（模拟数据）`, 'success');
    } catch (error) {
        console.error(`获取群组 ${groupId} 的成员列表时发生错误: ${error.message}`);
        showToastMessage(`获取群组 ${groupId} 的成员列表时发生错误: ${error.message}`, 'error');
    }
};

// 获取服务器的已绑定用户
const getBoundUsers = async (serverUuid) => {
    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // 使用模拟数据
        // 初始化该服务器的已绑定用户信息
        if (!boundUsers.value[serverUuid]) {
            boundUsers.value[serverUuid] = {};
        }
        // 更新已绑定用户信息
        boundUsers.value[serverUuid] = mockBoundUsers[serverUuid] || {};
        console.log(`服务器 ${serverUuid} 的已绑定用户获取成功（模拟数据）`);
        showToastMessage(`服务器 ${serverUuid} 的已绑定用户获取成功（模拟数据）`, 'success');
    } catch (error) {
        console.error(`获取服务器 ${serverUuid} 的已绑定用户时发生错误: ${error.message}`);
        showToastMessage(`获取服务器 ${serverUuid} 的已绑定用户时发生错误: ${error.message}`, 'error');
    }
};

// 获取所有数据
const getAllData = async () => {
    try {
        await getservers();

        // 遍历所有服务器，获取群组和已绑定用户信息
        for (const server of servers.value) {
            await getServerGroups(server.uuid);
            await getBoundUsers(server.uuid);
            
            // 获取每个群组的成员信息
            const serverGroups = groups.value[server.uuid] || [];
            for (const groupId of serverGroups) {
                await getGroupMembers(server.uuid, groupId);
            }
        }

        // 计算所有未绑定成员
        await calculateAllUnboundMembers();
    } catch (error) {
        console.error("获取所有数据时出错:", error);
        showToastMessage(`获取所有数据时出错: ${error.message}`, 'error');
    }
};

// 刷新数据
const refreshData = async () => {
    try {
        await getAllData();
        console.log('数据刷新成功');
        showToastMessage('数据刷新成功', 'success');
    } catch (error) {
        console.error(`数据刷新失败: ${error.message}`);
        showToastMessage(`数据刷新失败: ${error.message}`, 'error');
    }
};

// 计算所有未绑定成员
const calculateAllUnboundMembers = async () => {
    unboundMembers.value = [];

    // 创建一个映射来跟踪每个QQ号出现在哪些群组中
    const qqGroupsMap = new Map();

    // 遍历所有群组，收集每个QQ号的群组信息
    for (const [serverUuid, serverGroups] of Object.entries(groups.value)) {
        const bound = boundUsers.value[serverUuid] || {};
        // 获取服务器名称
        const server = servers.value.find(s => s.uuid === serverUuid);
        const serverName = server ? server.name : '未知服务器';

        for (const groupId of serverGroups) {
            const members = groupMembers.value[groupId] || {};

            // 筛选出未绑定的成员
            for (const [qq, name] of Object.entries(members)) {
                // 检查该QQ号是否已绑定
                let isBound = false;
                for (const [boundQQ, boundNames] of Object.entries(bound)) {
                    if (boundQQ === qq) {
                        isBound = true;
                        break;
                    }
                }

                if (!isBound) {
                    // 如果QQ号还没有记录，初始化一个空数组
                    if (!qqGroupsMap.has(qq)) {
                        qqGroupsMap.set(qq, {
                            name: name,
                            server: serverName,
                            serverUuid: serverUuid,
                            groupIds: []
                        });
                    }
                    // 将当前群组ID添加到该QQ号的群组列表中
                    qqGroupsMap.get(qq).groupIds.push(groupId);
                }
            }
        }
    }

    // 将映射转换为unboundMembers数组
    for (const [qq, memberInfo] of qqGroupsMap.entries()) {
        unboundMembers.value.push({
            qq: qq,
            name: memberInfo.name,
            server: memberInfo.server,
            serverUuid: memberInfo.serverUuid,
            groupIds: memberInfo.groupIds,
            groupId: memberInfo.groupIds.join(', ') // 以逗号分隔的群组ID字符串
        });
    }
};

// 显示添加QQ群模态框
const showAddGroupModal = () => {
    document.getElementById('addgroupmodal').showModal();
};

// 确认添加QQ群
const confirmAddGroup = async () => {
    if (!selectedServer.value) {
        console.error('请选择服务器');
        showToastMessage('请选择服务器', 'error');
        return;
    }
    if (!newGroupId.value) {
        console.error('请输入QQ群号');
        showToastMessage('请输入QQ群号', 'error');
        return;
    }

    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据
        // 在实际应用中，这里会更新服务器的群组列表
        // 为了简化，我们只显示成功消息
        showToastMessage(`QQ群 ${newGroupId.value} 添加成功（模拟数据）`, 'success');
        // 重新加载数据
        await refreshData();
        // 清空输入框
        newGroupId.value = '';
    } catch (error) {
        showToastMessage(`QQ群添加失败: ${error.message}`, 'error');
    }
};

// 显示删除确认模态框
const showDeleteConfirm = (groupId) => {
    currentDeleteGroup.value = groupId;
    document.getElementById('deletegroupconfirm').showModal();
};

// 显示删除QQ群模态框
const showDeleteGroupModal = () => {
    // 重置选择
    deleteSelectedServer.value = '';
    deleteSelectedGroup.value = '';
    document.getElementById('deletegroupmodal').showModal();
};

// 确认删除QQ群
const confirmDeleteGroup = async () => {
    // 如果是通过旧方式调用，使用currentDeleteGroup.value
    if (currentDeleteGroup.value && !deleteSelectedGroup.value) {
        // 获取群组所属的服务器UUID
        const serverUuid = getServerUuidByGroup(currentDeleteGroup.value);
        if (!serverUuid) {
            console.error('无法找到群组所属的服务器');
            showToastMessage('无法找到群组所属的服务器', 'error');
            return;
        }

        try {
            // 模拟API延迟
            await new Promise(resolve => setTimeout(resolve, 500));
            
            // 使用模拟数据
            // 在实际应用中，这里会从服务器的群组列表中移除该群组
            // 为了简化，我们只显示成功消息
            showToastMessage(`QQ群 ${currentDeleteGroup.value} 删除成功（模拟数据）`, 'success');
            // 重新加载数据
            await refreshData();
            // 关闭模态框
            document.getElementById('deletegroupconfirm').close();
        } catch (error) {
            console.error(`删除QQ群时发生错误: ${error.message}`);
            showToastMessage(`删除QQ群时发生错误: ${error.message}`, 'error');
        }
        return;
    }

    // 使用新的删除方式
    if (!deleteSelectedServer.value || !deleteSelectedGroup.value) {
        console.error('请选择服务器和QQ群');
        showToastMessage('请选择服务器和QQ群', 'error');
        return;
    }

    try {
        // 模拟API延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 使用模拟数据
        // 在实际应用中，这里会从服务器的群组列表中移除该群组
        // 为了简化，我们只显示成功消息
        showToastMessage(`QQ群 ${deleteSelectedGroup.value} 删除成功（模拟数据）`, 'success');
        // 重新加载数据
        await refreshData();
        // 关闭模态框
        document.getElementById('deletegroupmodal').close();
    } catch (error) {
        console.error(`删除QQ群时发生错误: ${error.message}`);
        showToastMessage(`删除QQ群时发生错误: ${error.message}`, 'error');
    }
};

// 根据群组ID获取服务器UUID
const getServerUuidByGroup = (groupId) => {
    for (const [serverUuid, groupList] of Object.entries(groups.value)) {
        if (groupList.includes(groupId)) {
            return serverUuid;
        }
    }
    return null;
};

// 获取服务器的群组列表
const getGroupsForServer = (serverUuid) => {
    if (!serverUuid) return [];
    return groups.value[serverUuid] || [];
};

// 计算所有群组
const allGroups = computed(() => {
    const groupsArray = [];
    for (const serverGroups of Object.values(groups.value)) {
        groupsArray.push(...serverGroups);
    }
    return [...new Set(groupsArray)];
});

// 计算筛选后的未绑定成员
const filteredUnboundMembers = computed(() => {
    let filtered = unboundMembers.value;

    // 应用服务器筛选
    if (selectedServer.value) {
        // 需要找到该服务器的所有群组
        const serverGroups = groups.value[selectedServer.value] || [];
        filtered = filtered.filter(member => serverGroups.includes(member.groupId));
    }

    // 应用QQ群筛选
    if (selectedGroup.value) {
        filtered = filtered.filter(member => member.groupId === selectedGroup.value);
    }

    // 应用搜索筛选
    if (searchText.value) {
        const searchLower = searchText.value.toLowerCase();
        filtered = filtered.filter(member =>
            member.name.toLowerCase().includes(searchLower) ||
            member.qq.includes(searchText.value)
        );
    }

    return filtered;
});

// 执行搜索
const performSearch = () => {
    searchText.value = searchInput.value;
};

onMounted(async () => {
    await getAllData();
});
</script>