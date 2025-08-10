<template>
    <transition name="slide-fade" class="z-50">
        <div v-if="isOpen" ref="authCard"
            class="card w-96 bg-base-100 card-sm shadow-sm absolute transition-all duration-300 ease-in-out bottom-14 left-2">
            <div class="card-body">
                <h2 class="card-title">ID: {{ admininfom.name }}</h2>
                <h2 class="card-title">上次登录: {{ formatTime(admininfom.lastlogin) }}</h2>
                <h2 class="card-title">上次更新: {{ formatTime(admininfom.updatetime) }}</h2>
                <h2 class="card-title">创建时间: {{ formatTime(admininfom.createtime) }}</h2>
                <div class="justify-end card-actions">
                    <button class="btn" onclick="my_modal_1.showModal()">更改用户名/密码</button>
                    <dialog id="my_modal_1" class="modal">
                        <div class="modal-box w-96">
                            <h3 class="text-lg font-bold">更改用户名/密码</h3>
                            <input v-model="newName" type="text" class="input validator mt-4" required placeholder="用户名"
                                pattern="[A-Za-z][A-Za-z0-9\-]*" minlength="3" maxlength="30" title="仅允许字母，数字，英文符号" />
                            <input v-model="newPassword" type="password" class="input validator mt-2" required
                                placeholder="密码" minlength="4" pattern="(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}"
                                title="密码必须为4个字符以上，包含数字、小写字母、大写字母" />
                            <p class="validator-hint">
                                密码必须为4个字符以上
                                <br />包含至少一个数字、至少一个小写字母、至少一个大写字母
                                <br />用户名必须为3到30个字符
                                <br />仅允许字母，数字，英文符号
                                <br />不能以数字开头
                            </p>
                            <div v-if="errorMsg" role="alert" class="alert alert-error">
                                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 shrink-0 stroke-current"
                                    fill="none" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>{{ errorMsg }}</span>
                            </div>
                            <div class="modal-action">
                                <button @click="changeadmin" class="btn btn-accent">确认</button>
                                <form method="dialog">
                                    <button class="btn">关闭</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                    <button class="btn btn-primary" onclick="my_modal_2.showModal()">退出登录</button>
                    <dialog id="my_modal_2" class="modal">
                        <div class="modal-box w-96">
                            <h3 class="text-lg font-bold">真的退出登录吗？</h3>
                            <div class="modal-action">
                                <form method="dialog">
                                    <button @click="logout" class="btn btn-warning">确认</button>
                                </form>
                                <form method="dialog">
                                    <button class="btn">取消</button>
                                </form>
                            </div>
                        </div>
                    </dialog>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
import { ref } from 'vue'
import { useCustomStore } from '~/utils/custom'

const customStore = useCustomStore()
const admininfom = ref({})
const loading = ref(false)
const authCard = ref(null);
const errorMsg = ref('')

const newName = ref('')
const newPassword = ref('')

const isOpen = computed(() => customStore.authOpened)

// 添加时间格式化函数
const formatTime = (time) => {
    if (!time) return ''

    // 创建Date对象
    const date = new Date(time);

    // 检查日期是否有效
    if (isNaN(date.getTime())) return '';

    // 转换为UTC+8时区
    const utc8Date = new Date(date.getTime() + 8 * 60 * 60 * 1000);

    // 格式化为 YYYY-MM-DD HH:mm:ss
    const year = utc8Date.getUTCFullYear();
    const month = String(utc8Date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(utc8Date.getUTCDate()).padStart(2, '0');
    const hours = String(utc8Date.getUTCHours()).padStart(2, '0');
    const minutes = String(utc8Date.getUTCMinutes()).padStart(2, '0');
    const seconds = String(utc8Date.getUTCSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

const fetchadmininfom = async () => {
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
            admininfom.value = result.data
            newName.value = result.data.name
        } else {
            console.log('获取管理员信息失败', result)
        }
    } catch (err) {
        console.log('获取管理员信息出错', err)
    } finally {
        loading.value = false;
    }
}

const changeadmin = async () => {
    try {
        loading.value = true;
        const result = await $fetch('/api/auth', {
            method: 'POST',
            body: {
                action: 'change',
                token: useCookie('auth_token').value,
                name: newName.value,
                password: newPassword.value,
            },
        });
        if (result.success === true) {
            admininfom.value = result.data
            newPassword.value = ''
            newName.value = result.data.name
            errorMsg.value = ''
        } else {
            errorMsg.value = result.msg
            console.log('更改管理员信息失败', result)
        }
    } catch (err) {
        errorMsg.value = '更改失败'
        console.log('更改管理员信息出错', err)
    } finally {
        loading.value = false;
    }
}

const logout = () => {
    useCookie('auth_token').value = null
    closeModal()
    navigateTo('/login')
}

const closeModal = () => {
    customStore.switchAuth()
}

// 添加外部点击监听器
const handleClickOutside = (event) => {
    if (authCard.value && !authCard.value.contains(event.target)) {
        closeModal();
    }
};

// 监听isOpen状态变化，动态添加/移除事件监听器
watch(isOpen, (newVal) => {
    if (newVal) {
        fetchadmininfom();
        // 组件打开时0.1s后添加事件监听器
        setTimeout(() => {
            document.addEventListener('click', handleClickOutside);
        }, 100);
    } else {
        // 组件关闭时移除事件监听器
        document.removeEventListener('click', handleClickOutside);
    }
});

// 组件挂载时获取管理员信息
onMounted(() => {
    fetchadmininfom();
});
</script>

<style scoped>
.slide-fade-enter-active {
    transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.1s ease-in;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translate(-400px, 400px);
    opacity: 0;
    scale: 0;
}
</style>