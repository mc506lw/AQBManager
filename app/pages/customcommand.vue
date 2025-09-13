<template>
  <div class="flex flex-col h-full">
    <div class="flex flex-col lg:flex-row justify-between w-full border-b border-base-300">
      <div class="my-6 ml-6">
        <div class="text-2xl font-bold">自定义命令配置</div>
        <div class="text-xl">配置自定义命令</div>
      </div>
      <div class="mx-6 mt-4 lg:mt-8 mb-4 lg:mb-0 flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-2">
        <button class="btn btn-outline" @click="refreshData">刷新</button>
        <select class="select select-bordered w-full lg:w-64" v-model="selectedServer">
          <option value="">请选择服务器</option>
          <option v-for="server in servers" :key="server.uuid" :value="server.uuid">{{ server.name }}</option>
        </select>
        <button class="btn btn-primary" @click="addNewCommand" :disabled="!selectedServer">添加命令</button>
      </div>
    </div>
    <div class="flex-1 overflow-y-auto mx-6 p-4">
      <div v-if="!selectedServer">
        <p class="text-center text-gray-500 py-10">请选择服务器以查看和编辑自定义命令配置</p>
      </div>
      <div v-else>
        <div v-if="Object.keys(customCommands).length === 0" class="text-center text-gray-500 py-10">
          暂无自定义命令配置
        </div>
        <div v-else>
          <div v-for="(command, key) in customCommands" :key="key" class="mb-6 p-4 bg-base-100 rounded-lg">
            <div class="flex justify-between items-center mb-4">
              <h3 class="font-bold text-lg">{{ key }}</h3>
              <div class="flex space-x-2">
                <button class="btn btn-sm btn-primary" @click="saveCommand(key)">保存</button>
                <button class="btn btn-sm btn-error" @click="deleteCommand(key)">删除</button>
              </div>
            </div>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div class="justify-between w-full flex form-control mb-4 flex-col sm:flex-row sm:items-center">
                  <label class="label">
                    <span class="label-text">是否启用</span>
                  </label>
                  <input type="checkbox" class="toggle toggle-primary mt-2 sm:mt-0" v-model="command.enable" />
                </div>
                
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">调用命令列表</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered h-24 w-full" 
                    v-model="command.command" 
                    placeholder="每行一个命令"
                  ></textarea>
                </div>
                
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">绑定账户执行命令</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered h-24 w-full" 
                    v-model="command.execute" 
                    placeholder="每行一个命令"
                  ></textarea>
                </div>
                
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">未绑定账户执行命令</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered h-24 w-full" 
                    v-model="command.unbind_execute" 
                    placeholder="每行一个命令"
                  ></textarea>
                </div>
              </div>
              
              <div>
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">使用账户索引</span>
                  </label>
                  <input 
                    type="number" 
                    class="input input-bordered w-full" 
                    v-model="command.choose_account" 
                    min="0"
                  />
                </div>
                
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">绑定账户返回信息</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered h-24 w-full" 
                    v-model="command.output" 
                    placeholder="每行一条信息"
                  ></textarea>
                </div>
                
                <div class="form-control mb-4">
                  <label class="label">
                    <span class="label-text">未绑定账户返回信息</span>
                  </label>
                  <textarea 
                    class="textarea textarea-bordered h-24 w-full" 
                    v-model="command.unbind_output" 
                    placeholder="每行一条信息"
                  ></textarea>
                </div>
                
                <div class="justify-between w-full flex form-control mb-4 flex-col sm:flex-row sm:items-center">
                  <label class="label">
                    <span class="label-text">是否格式化返回信息</span>
                  </label>
                  <input type="checkbox" class="toggle toggle-primary mt-2 sm:mt-0" v-model="command.format" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 添加命令对话框 -->
    <dialog id="addCommandModal" class="modal">
      <div class="modal-box">
        <h3 class="font-bold text-lg">添加新命令</h3>
        <div class="form-control mt-4">
          <label class="label">
            <span class="label-text">命令键名</span>
          </label>
          <input 
            type="text" 
            class="input input-bordered w-full" 
            v-model="newCommandKey" 
            placeholder="请输入命令键名"
          />
        </div>
        <div class="modal-action">
          <button class="btn" @click="confirmAddCommand">添加</button>
          <button class="btn" onclick="addCommandModal.close()">取消</button>
        </div>
      </div>
    </dialog>
    
    <!-- Toast 组件 -->
    <div class="toast toast-end">
      <div v-if="toastMessage" :class="['alert', toastClass]">
        <span>{{ toastMessage }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const token = useCookie('auth_token');
const servers = ref([]);
const selectedServer = ref('');

// 监听服务器选择变化，自动加载配置
watch(selectedServer, (newVal) => {
  if (newVal) {
    loadCustomCommands();
  } else {
    // 如果没有选择服务器，清空配置
    customCommands.value = {};
  }
});

// 自定义命令配置
const customCommands = ref({});

// 新命令键名
const newCommandKey = ref('');

// Toast 相关
const toastMessage = ref('');
const toastType = ref('');

const toastClass = computed(() => {
  switch (toastType.value) {
    case 'success':
      return 'alert-success';
    case 'error':
      return 'alert-error';
    case 'warning':
      return 'alert-warning';
    default:
      return 'alert-info';
  }
});

const showToastMessage = (message, type) => {
  toastMessage.value = message;
  toastType.value = type;
  setTimeout(() => {
    toastMessage.value = '';
    toastType.value = '';
  }, 3000);
};

// 获取服务器列表
const getservers = async () => {
  try {
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
    } else {
      showToastMessage(`服务器列表获取失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`获取服务器列表时发生错误: ${error.message}`, 'error');
  }
};

// 刷新数据
const refreshData = async () => {
  await getservers();
  if (selectedServer.value) {
    await loadCustomCommands();
  }
};

// 加载自定义命令配置
const loadCustomCommands = async () => {
  if (!selectedServer.value) return;
  
  try {
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/custom/get',
        params: {}
      },
    });
    
    if (result.success) {
      // 处理命令列表数据，将数组转换为多行文本
      const processedCommands = {};
      for (const [key, command] of Object.entries(result.response.custom_commands || {})) {
        processedCommands[key] = {
          ...command,
          command: command.command.filter(cmd => cmd !== '').join('\n'),
          execute: command.execute.filter(cmd => cmd !== '').join('\n'),
          unbind_execute: command.unbind_execute.filter(cmd => cmd !== '').join('\n'),
          output: command.output.filter(output => output !== '').join('\n'),
          unbind_output: command.unbind_output.filter(output => output !== '').join('\n')
        };
      }
      customCommands.value = processedCommands;
      showToastMessage('配置加载成功', 'success');
    } else {
      showToastMessage(`配置加载失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`加载配置时发生错误: ${error.message}`, 'error');
  }
};

// 保存自定义命令配置
const saveCommand = async (key) => {
  if (!selectedServer.value || !customCommands.value[key]) return;
  
  try {
    // 处理数据，将多行文本转换为数组
    const commandData = {
      ...customCommands.value[key],
      command: customCommands.value[key].command.split('\n').filter(cmd => cmd.trim() !== ''),
      execute: customCommands.value[key].execute.split('\n').filter(cmd => cmd.trim() !== ''),
      unbind_execute: customCommands.value[key].unbind_execute.split('\n').filter(cmd => cmd.trim() !== ''),
      output: customCommands.value[key].output.split('\n').filter(output => output.trim() !== ''),
      unbind_output: customCommands.value[key].unbind_output.split('\n').filter(output => output.trim() !== '')
    };
    
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/custom/set',
        params: {
          key: key,
          ...commandData
        }
      },
    });
    
    if (result.success) {
      showToastMessage('命令配置保存成功', 'success');
    } else {
      showToastMessage(`命令配置保存失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`保存命令配置时发生错误: ${error.message}`, 'error');
  }
};

// 删除自定义命令
const deleteCommand = async (key) => {
  if (!selectedServer.value) return;
  
  try {
    // 发送空配置来删除命令
    const result = await $fetch('/api/servers', {
      method: 'POST',
      body: {
        action: 'do_action',
        token: token.value,
        uuid: selectedServer.value,
        action_name: '/api/v1/custom/set',
        params: {
          key: key,
          enable: false,
          command: [],
          execute: [],
          unbind_execute: [],
          choose_account: 0,
          output: [],
          unbind_output: [],
          format: false
        }
      },
    });
    
    if (result.success) {
      // 从本地状态中删除
      delete customCommands.value[key];
      showToastMessage('命令删除成功', 'success');
    } else {
      showToastMessage(`命令删除失败: ${result.msg}`, 'error');
    }
  } catch (error) {
    showToastMessage(`删除命令时发生错误: ${error.message}`, 'error');
  }
};

// 添加新命令
const addNewCommand = () => {
  newCommandKey.value = '';
  const modal = document.getElementById('addCommandModal');
  if (modal) {
    modal.showModal();
  }
};

// 确认添加新命令
const confirmAddCommand = () => {
  if (!newCommandKey.value.trim()) {
    showToastMessage('命令键名不能为空', 'error');
    return;
  }
  
  // 初始化新命令配置
  customCommands.value[newCommandKey.value] = {
    enable: true,
    command: '',
    execute: '',
    unbind_execute: '',
    choose_account: 0,
    output: '',
    unbind_output: '',
    format: true
  };
  
  // 关闭对话框
  const modal = document.getElementById('addCommandModal');
  if (modal) {
    modal.close();
  }
  
  showToastMessage('新命令已添加，请配置后保存', 'success');
};

// 组件挂载时获取服务器列表
onMounted(() => {
  getservers();
});
</script>

<style scoped>
/* 可以在这里添加自定义样式 */
</style>