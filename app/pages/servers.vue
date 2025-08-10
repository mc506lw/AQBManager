<template>
  <div class="w-full h-screen bg-base-100">
    <div class="flex justify-between w-full">
      <div class="mt-6 ml-6">
        <div class="text-2xl font-bold">服务器管理</div>
        <div class="text-xl">管理所有服务器</div>
      </div>
      <div class="mr-6 mt-8">
        <button @click="getservers" class="btn btn-outline">刷新状态</button>
        <button onclick="addserver1.showModal()" class="btn btn-outline ml-4">添加服务器</button>

      </div>
    </div>
    <div class="grid grid-cols-4 m-8">
      <div v-for="server in servers" :key="server.uuid" class="card w-96 bg-base-100 card-lg shadow-sm mr-4">
        <div class="card-body">
          <div class="justify-between flex">
            <h2 class="card-title">{{ server.name }}</h2>
          </div>
          <div class="justify-between flex">
            <p class="w-full">UUID：</p>
            <p class="truncate">{{ server.uuid }}</p>
          </div>
          <div class="justify-between flex">
            <p class="w-full">IP：</p>
            <p>{{ server.ip }}</p>
          </div>
          <div class="justify-between flex">
            <p class="w-full">Token：</p>
            <p>{{ server.token }}</p>
          </div>
          <div class="justify-end card-actions">
            <button onclick="editserver1.showModal()" @click="editserver(server)" class="btn btn-primary">编辑</button>
            <button onclick="deleteserver1.showModal()" @click="deleteserver(server)" class="btn btn-primary">删除</button>


            <dialog id="editserver1" class="modal">
              <div class="modal-box">
                <h3 class="text-lg font-bold">编辑服务器</h3>
                <div class="form-control mt-4">
                  <label class="label">
                    <span class="label-text mr-2.5">服务器IP</span>
                  </label>
                  <input v-model="editedserverip" type="text" placeholder="请输入服务器IP"
                    class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="form-control mt-2">
                  <label class="label">
                    <span class="label-text mr-7">Token</span>
                  </label>
                  <input v-model="editedservertoken" type="text" placeholder="请输入token"
                    class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="form-control mt-2">
                  <label class="label">
                    <span class="label-text mr-10">名称</span>
                  </label>
                  <input v-model="editedservername" type="text" placeholder="请输入服务器名称"
                    class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
                </div>
                <div class="modal-action">
                  <p v-if="warningmsg2" class="text-red-500 text-xl mt-2">错误：{{ warningmsg2 }}</p>
                  <button @click="doedit" class="btn">确定</button>
                  <form method="dialog">
                    <button class="btn">取消</button>
                  </form>
                </div>
              </div>
            </dialog>
            <dialog id="deleteserver1" class="modal">

              <div class="modal-box">
                <h3 class="text-lg font-bold">删除服务器</h3>
                <p>确定删除服务器{{ deletedserver.name }}吗？</p>
                <div class="modal-action">
                  <p v-if="warningmsg3" class="text-red-500 text-xl mt-2">错误：{{ warningmsg3 }}</p>
                  <button @click="dodelete" class="btn">确定</button>
                  <form method="dialog">
                    <button class="btn">取消</button>
                  </form>
                </div>
              </div>
            </dialog>
          </div>
        </div>
      </div>
      <div onclick="addserver1.showModal()"
        class="card w-96 bg-base-100 hover:bg-base-200 card-lg shadow-sm transition duration-300 h-64">
        <div class="card-body flex justify-center items-center">
          <div class="text-center text-4xl">+
          </div>
        </div>
      </div>
      <dialog id="addserver1" class="modal">
        <div class="modal-box">
          <h3 class="text-lg font-bold">添加服务器</h3>

          <div class="form-control mt-4">
            <label class="label">
              <span class="label-text mr-2.5">服务器IP</span>
            </label>
            <input v-model="newserverip" type="text" placeholder="请输入服务器IP"
              class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>

          <div class="form-control mt-2">
            <label class="label">
              <span class="label-text mr-7">Token</span>
            </label>
            <input v-model="newservertoken" type="text" placeholder="请输入token"
              class="input input-bordered transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div class="modal-action">
            <p v-if="warningmsg1" class="text-red-500 text-xl mt-2">错误：{{ warningmsg1 }}</p>
            <button @click="addserver" class="btn">确定</button>
            <form method="dialog">
              <button class="btn">取消</button>
            </form>
          </div>
        </div>
      </dialog>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const servers = ref([]);
const token = useCookie('auth_token');
const newserverip = ref('');
const newservertoken = ref('');
const warningmsg1 = ref('');
const warningmsg2 = ref('');
const editedserver = ref('')
const editedserverip = ref('')
const editedservertoken = ref('')
const editedservername = ref('')
const deletedserver = ref('')

const deleteserver = async (server) => {
  deletedserver.value = server
}

const getservers = async () => {
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'get_servers',
        token: token.value
      },
    })
    servers.value = result.servers
    console.log(servers.value)
  }
  catch (err) {
    console.error(err)
  }
}

onMounted(() => {
  getservers()
})

const editserver = (server) => {
  editedserver.value = server.uuid
  editedserverip.value = server.ip
  editedservertoken.value = server.token
  editedservername.value = server.name
}

const doedit = async () => {
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'edit',
        token: token.value,
        uuid: editedserver.value,
        serverip: editedserverip.value,
        servertoken: editedservertoken.value,
        servername: editedservername.value,

      }
    })
    if (result.success) {
      editedserver.value = ''
      editedserverip.value = ''
      editedservertoken.value = ''
      editedservername.value = ''
      warningmsg1.value = ''
      getservers()
      editserver1.close()
    }
    else {
      warningmsg2.value = result.msg
    }

  }
  catch (err) {
    console.error(err)
    warningmsg2.value = '服务器错误'
  }
}

const dodelete = async () => {
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'delete',
        token: token.value,
        uuid: deletedserver.value.uuid
      },
    })
    console.log(result)
    if (result.success) {
      console.log(result)

      getservers()
      deleteserver1.close()
      warningmsg3.value = ''
      deletedserver.value = ''
    }
    else {
      warningmsg3.value = result.msg
    }
  }
  catch (err) {
    console.error(err)
  }
}


const addserver = async () => {
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'add',
        token: token.value,
        serverip: newserverip.value,
        servertoken: newservertoken.value
      },
    })
    console.log(result)
    if (result.success) {
      console.log(result)

      getservers()
      addserver1.close()
      warningmsg1.value = ''
      newserverip.value = ''
      newservertoken.value = ''
    }
    else {
      warningmsg1.value = result.msg
    }
  }
  catch (err) {
    console.error(err)
  }
}



</script>

<style>
/* 添加动画样式 */
.fade-enter-active {
  transition: opacity 0.5s;
}

.fade-enter

/* .fade-leave-active in <2.1.8 */
  {
  opacity: 0;
}
</style>