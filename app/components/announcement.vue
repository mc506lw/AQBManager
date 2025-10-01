<template>
  <dialog id="announcementModal" class="modal">
    <div class="modal-box">
      <h3 class="font-bold text-lg">📢 网站公告</h3>
      <div class="py-4">
        <p class="pb-2">欢迎访问AQBManager！</p>
        <p class="pb-2">此网站仅为a1.0.4版本的前端演示网站，所有功能均为模拟实现。</p>
        <p class="pb-2">如您在使用过程中遇到任何问题，请不要感到奇怪，这很可能是由于：</p>
        <ul class="list-disc pl-5 pb-2">
          <li>演示网站的功能限制</li>
          <li>模拟数据的固定性</li>
          <li>缺少后端服务支持</li>
        </ul>
        <p class="pb-2">请理解这是一个展示前端界面的演示站点，不包含真实的后端功能。</p>
        <div class="alert alert-warning shadow-lg mt-4">
          <div>
            <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current flex-shrink-0 h-6 w-6" fill="none"
              viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span>请勿反馈任何此网站的问题或建议！</span>
          </div>
        </div>
      </div>
      <div class="modal-action">
        <button class="btn" @click="closeAnnouncement">我知道了</button>
      </div>
    </div>
  </dialog>
</template>

<script setup>
import { onMounted } from 'vue'

const closeAnnouncement = () => {
  // 关闭模态框
  document.getElementById('announcementModal').close()
}

onMounted(() => {
  // 延迟一点显示，让用户先看到页面
  setTimeout(() => {
    document.getElementById('announcementModal').showModal()
  }, 1000)
})
</script>

<style scoped>
.modal-box {
  max-width: 90vw;
  width: 500px;
}
</style>