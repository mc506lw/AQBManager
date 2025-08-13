<template>
    <div class="w-full h-full">
        <div class="flex justify-between w-full">
            <div class="mt-6 ml-6">
                <div class="text-2xl font-bold">QQ群管理</div>
                <div class="text-xl">管理QQ群状态</div>
            </div>
            <div class="mr-6 mt-8">
                <button class="btn btn-outline" @click="refreshData">刷新状态</button>
                <button class="btn btn-outline ml-4" @click="showDeleteGroupModal">删除QQ群</button>
                <button class="btn btn-outline ml-4" @click="showAddGroupModal">添加QQ群</button>
            </div>
        </div>
        <div class="w-full mt-6 mx-6 max-h-6">
            <!-- 筛选器 -->
            <div class="flex flex-wrap gap-4 mb-4">
                <select class="select select-bordered w-64" v-model="selectedServer">
                    <option value="">全部服务器</option>
                    <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}</option>
                </select>
                <select class="select select-bordered w-64" v-model="selectedGroup">
                    <option value="">全部QQ群</option>
                    <option v-for="group in allGroups" :key="group" :value="group">{{ group }}</option>
                </select>
                <div class="join w-96">
                    <input class="input input-bordered join-item" placeholder="搜索" v-model="searchInput"
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
                        <table class="table">
                            <thead>
                                <tr>
                                    <th></th>
                                    <th>QQ群号</th>
                                    <th>服务器</th>
                                    <th>名称</th>
                                    <th>QQ号</th>
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
            <div class="modal-box">
                <h3 class="text-lg font-bold">添加QQ群</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-10">服务器</span>
                    </label>
                    <select class="select mt-2 w-64" v-model="selectedServer">
                        <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}
                        </option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-7.5">QQ群号</span>
                    </label>
                    <input v-model="newGroupId" type="text" placeholder="请输入QQ群号" class="input input-bordered w-64" />
                </div>
                <div class="modal-action">
                    <button class="btn btn-success" @click="confirmAddGroup">确认添加</button>
                    <form method="dialog">
                        <button class="btn">取消</button>
                    </form>
                </div>
            </div>
        </dialog>
        <!-- 删除QQ群模态框 -->
        <dialog id="deletegroupmodal" class="modal">
            <div class="modal-box">
                <h3 class="text-lg font-bold">删除QQ群</h3>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-10">服务器</span>
                    </label>
                    <select class="select mt-2 w-64" v-model="deleteSelectedServer" @change="deleteSelectedGroup = ''">
                        <option value="">请选择服务器</option>
                        <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}
                        </option>
                    </select>
                </div>
                <div class="form-control mt-2">
                    <label class="label">
                        <span class="label-text mr-7.5">QQ群号</span>
                    </label>
                    <select class="select mt-2 w-64" v-model="deleteSelectedGroup" :disabled="!deleteSelectedServer">
                        <option value="">请选择QQ群</option>
                        <option v-for="group in getGroupsForServer(deleteSelectedServer)" :key="group" :value="group">{{
                            group }}</option>
                    </select>
                </div>
                <div class="modal-action">
                    <button class="btn btn-error" @click="confirmDeleteGroup"
                        :disabled="!deleteSelectedGroup">确认删除</button>
                    <form method="dialog">
                        <button class="btn">取消</button>
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
    const result = await $fetch('/api/servers', {
        method: 'POST',
        body: {
            action: 'get_servers',
            token: token.value
        },
    });
    if (result.success) {
        servers.value = result.servers;
        console.log('服务器列表获取成功');
        showToastMessage('success', '服务器列表获取成功');
    } else {
        console.error(`服务器列表获取失败: ${result.msg}`);
        showToastMessage('error', `服务器列表获取失败: ${result.msg}`);
    }
};

// 获取服务器的群组列表
const getServerGroups = async (serverUuid) => {
    const result = await $fetch('/api/servers', {
        method: 'POST',
        body: {
            action: 'do_action',
            token: token.value,
            uuid: serverUuid,
            action_name: '/api/v1/enable_groups'
        },
    });
    if (result.success && result.response && Array.isArray(result.response.groups)) {
        // 初始化该服务器的群组信息
        if (!groups.value[serverUuid]) {
            groups.value[serverUuid] = [];
        }
        groups.value[serverUuid] = result.response.groups;
        console.log(`获取到服务器 ${serverUuid} 的群组列表`);
        showToastMessage('success', `获取到服务器 ${serverUuid} 的群组列表`);

        // 获取每个群组的成员列表
        for (const group of result.response.groups) {
            await getGroupMembers(serverUuid, group);
        }
    } else {
        console.error(`获取服务器 ${serverUuid} 群组失败: ${result.msg}`);
        showToastMessage('error', `获取服务器 ${serverUuid} 群组失败: ${result.msg}`);
    }
};

// 获取群组成员列表
const getGroupMembers = async (serverUuid, groupId) => {
    const result = await $fetch('/api/servers', {
        method: 'POST',
        body: {
            action: 'do_action',
            token: token.value,
            uuid: serverUuid,
            action_name: '/api/v1/enable_groups/users',
            params: { group_id: groupId }
        },
    });
    if (result.success && result.response) {
        // 初始化该群组的成员信息
        if (!groupMembers.value[groupId]) {
            groupMembers.value[groupId] = {};
        }
        groupMembers.value[groupId] = result.response;
        console.log(`获取到群组 ${groupId} 的成员列表`);
        showToastMessage('success', `获取到群组 ${groupId} 的成员列表`);
    } else {
        console.error(`获取群组 ${groupId} 成员列表失败: ${result.msg}`);
        showToastMessage('error', `获取群组 ${groupId} 成员列表失败: ${result.msg}`);
    }
};

// 获取服务器的已绑定用户
const getBoundUsers = async (serverUuid) => {
    const result = await $fetch('/api/servers', {
        method: 'POST',
        body: {
            action: 'do_action',
            token: token.value,
            uuid: serverUuid,
            action_name: '/api/v1/users'
        },
    });
    if (result.success && result.response) {
        // 初始化该服务器的已绑定用户信息
        if (!boundUsers.value[serverUuid]) {
            boundUsers.value[serverUuid] = {};
        }
        boundUsers.value[serverUuid] = result.response;
        console.log(`获取到服务器 ${serverUuid} 的已绑定用户`);
        showToastMessage('success', `获取到服务器 ${serverUuid} 的已绑定用户`);
    } else {
        console.error(`获取服务器 ${serverUuid} 已绑定用户失败: ${result.msg}`);
        showToastMessage('error', `获取服务器 ${serverUuid} 已绑定用户失败: ${result.msg}`);
    }
};

// 获取所有数据
const getAllData = async () => {
    await getservers();

    // 遍历所有服务器，获取群组和已绑定用户信息
    for (const server of servers.value) {
        await getServerGroups(server.uuid);
        await getBoundUsers(server.uuid);
    }

    // 计算所有未绑定成员
    await calculateAllUnboundMembers();
};

// 刷新数据
const refreshData = async () => {
    try {
        await getAllData();
        console.log('数据刷新成功');
        showToastMessage('success', '数据刷新成功');
    } catch (error) {
        console.error(`数据刷新失败: ${error.message}`);
        showToastMessage('error', `数据刷新失败: ${error.message}`);
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
        showToastMessage('error', '请选择服务器');
        return;
    }
    if (!newGroupId.value) {
        console.error('请输入QQ群号');
        showToastMessage('error', '请输入QQ群号');
        return;
    }

    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: selectedServer.value,
                action_name: '/api/v1/enable_groups/add',
                params: {
                    group_id: newGroupId.value
                }
            },
        });

        if (result.success) {
            // 检查操作状态
            if (result.response && result.response.status === 'success') {
                // 添加成功，刷新数据
                await refreshData();
                // 关闭模态框
                document.getElementById('addgroupmodal').close();
                // 清空输入框
                newGroupId.value = '';
                console.log('QQ群添加成功');
                showToastMessage('success', 'QQ群添加成功');
            } else {
                console.error(`添加QQ群失败: ${result.response?.message || result.msg}`);
                showToastMessage('error', `添加QQ群失败: ${result.response?.message || result.msg}`);
            }
        } else {
            console.error(`添加QQ群失败: ${result.msg}`);
            showToastMessage('error', `添加QQ群失败: ${result.msg}`);
        }
    } catch (error) {
        console.error(`添加QQ群时发生错误: ${error.message}`);
        showToastMessage('error', `添加QQ群时发生错误: ${error.message}`);
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
            showToastMessage('error', '无法找到群组所属的服务器');
            return;
        }

        try {
            const result = await $fetch('/api/servers', {
                method: 'POST',
                body: {
                    action: 'do_action',
                    token: token.value,
                    uuid: serverUuid,
                    action_name: '/api/v1/enable_groups/remove',
                    params: {
                        group_id: currentDeleteGroup.value
                    }
                },
            });

            if (result.success) {
                // 检查操作状态
                if (result.response && result.response.status === 'success') {
                    // 删除成功，刷新数据
                    await refreshData();
                    // 关闭模态框
                    document.getElementById('deletegroupconfirm').close();
                    console.log('QQ群删除成功');
                    showToastMessage('success', 'QQ群删除成功');
                } else {
                    console.error(`删除QQ群失败: ${result.response?.message || result.msg}`);
                    showToastMessage('error', `删除QQ群失败: ${result.response?.message || result.msg}`);
                }
            } else {
                console.error(`删除QQ群失败: ${result.msg}`);
                showToastMessage('error', `删除QQ群失败: ${result.msg}`);
            }
        } catch (error) {
            console.error(`删除QQ群时发生错误: ${error.message}`);
            showToastMessage('error', `删除QQ群时发生错误: ${error.message}`);
        }
        return;
    }

    // 使用新的删除方式
    if (!deleteSelectedServer.value || !deleteSelectedGroup.value) {
        console.error('请选择服务器和QQ群');
        showToastMessage('error', '请选择服务器和QQ群');
        return;
    }

    try {
        const result = await $fetch('/api/servers', {
            method: 'POST',
            body: {
                action: 'do_action',
                token: token.value,
                uuid: deleteSelectedServer.value,
                action_name: '/api/v1/enable_groups/remove',
                params: {
                    group_id: deleteSelectedGroup.value
                }
            },
        });

        if (result.success) {
            // 检查操作状态
            if (result.response && result.response.status === 'success') {
                // 删除成功，刷新数据
                await refreshData();
                // 关闭模态框
                document.getElementById('deletegroupmodal').close();
                console.log('QQ群删除成功');
                showToastMessage('success', 'QQ群删除成功');
            } else {
                console.error(`删除QQ群失败: ${result.response?.message || result.msg}`);
                showToastMessage('error', `删除QQ群失败: ${result.response?.message || result.msg}`);
            }
        } else {
            console.error(`删除QQ群失败: ${result.msg}`);
            showToastMessage('error', `删除QQ群失败: ${result.msg}`);
        }
    } catch (error) {
        console.error(`删除QQ群时发生错误: ${error.message}`);
        showToastMessage('error', `删除QQ群时发生错误: ${error.message}`);
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