// 模拟数据文件
export const mockServers = [
  {
    uuid: 'server-001',
    name: '主服务器',
    ip: '192.168.1.100:25565',
    token: 'abc123def456ghi789'
  },
  {
    uuid: 'server-002',
    name: '测试服务器',
    ip: '192.168.1.101:25565',
    token: 'jkl321mno654pqr987'
  },
  {
    uuid: 'server-003',
    name: '生存服务器',
    ip: '192.168.1.102:25565',
    token: 'stu789vwx321yz000'
  }
];

export const mockPlayers = [
  { id: 1, qq: '123456789', name: 'Steve', server: 'server-001', groupId: '987654321', status: 'online' },
  { id: 2, qq: '987654321', name: 'Alex', server: 'server-001', groupId: '987654321', status: 'offline' },
  { id: 3, qq: '456789123', name: 'Herobrine', server: 'server-002', groupId: '123789456', status: 'online' }
];

export const mockGroups = {
  'server-001': ['987654321', '111222333'],
  'server-002': ['123789456'],
  'server-003': ['444555666']
};

export const mockGroupMembers = {
  '987654321': [
    { qq: '123456789', name: 'Steve', role: 'member' },
    { qq: '987654321', name: 'Alex', role: 'admin' }
  ],
  '123789456': [
    { qq: '456789123', name: 'Herobrine', role: 'member' }
  ]
};

// 模拟已绑定用户数据
export const mockBoundUsers = {
  'server-001': {
    '123456789': ['Steve']
  },
  'server-002': {
    '456789123': ['Herobrine']
  },
  'server-003': {}
};

export const mockConfig = {
  version: 22,
  storage: {
    type: 'file',
    sqlite: {
      file: 'aqqbot.db'
    },
    mysql: {
      host: '127.0.0.1',
      port: 3306,
      user: 'root',
      password: '123456',
      database: 'aqqbot'
    }
  },
  whitelist: {
    enable: true,
    need_bind_to_login: true,
    verify_method: 'GROUP_NAME',
    verify_code_expire_time: 300,
    max_bind_count: 1,
    name_rule: '[\S]*',
    unbind_on_leave: true,
    cooldown: {
      bind: 60,
      unbind: 86400
    },
    change_nickname_on_bind: {
      enable: false,
      format: '[${nickName}] ${playerName}'
    },
    prefix: {
      bind: ['/绑定', '/bind'],
      unbind: ['/解绑', '/unbind'],
      admin: {
        bind: ['/管理绑定', '/abind'],
        unbind: ['/管理解绑', '/aunbind']
      }
    },
    bypass_permission: 'aqqbot.whitelist.bypass'
  },
  information: {
    list: {
      enable: true,
      filter: ['']
    },
    at: {
      enable: true,
      message: ['@${player}', '${player}'],
      action: ['playsound block.bell.use master ${player}', 'title @a subtitle {"text":"[AQQBot] ${userId} @了你!","color":"gold"}']
    }
  },
  chat: {
    max_forward_length: 200,
    group_to_server: {
      enable: true,
      vc_broadcast: false,
      prefix: [''],
      filter: ['']
    },
    server_to_group: {
      enable: true,
      filter: [''],
      default_format: true,
      prefix: ['']
    }
  },
  notify: {
    server_status: {
      enable: true,
      start: '[AQQBot] XXX服务器已启动!',
      stop: '[AQQBot] XXX服务器已关闭!'
    },
    player_status: {
      enable: true,
      join: '[AQQBot] ${playerName}(${userId}) 进入了服务器!',
      leave: '[AQQBot] ${playerName}(${userId}) 离开了服务器!'
    },
    player_death: {
      enable: false,
      message: '[AQQBot] ${playerName}(${userId}) 因 ${deathMessage} 死亡了!'
    }
  },
  command_execution: {
    enable: true,
    format: true,
    delay: 2,
    prefix: ['/sudo', '/执行'],
    sort: ['NATIVE', 'DECIDATED_SERVER', 'MINECRAFT_SERVER', 'SIMULATE_CONSOLE'],
    allow: ['$ADMIN'],
    filter: ['']
  },
  webhook: {
    enable: false,
    host: '0.0.0.0',
    port: 8080,
    token: 'type_your_token_here',
    name: 'A Minecraft Server',
    filter: ['']
  },
  debug: {
    enable: false,
    logger: {
      enable: true,
      file: 'debug.log',
      save_interval: 0
    }
  }
};

export const mockCommands = [
  {
    id: 1,
    server: 'server-001',
    command: '/say Hello World',
    description: '发送消息',
    enabled: true
  },
  {
    id: 2,
    server: 'server-001',
    command: '/time set day',
    description: '设置时间为白天',
    enabled: true
  }
];

export const mockSystemInfo = {
  nodeVersion: 'v18.17.0',
  panelVersion: 'a1.0.4',
  nodeVersionInfo: 'v1.0.0',
  username: 'admin',
  panelTime: new Date().toLocaleString(),
  browserTime: new Date().toLocaleString(),
  totalMemory: 8192,
  freeMemory: 2048,
  loadAverage: [0.25, 0.30, 0.35],
  panelMemoryUsage: 128.5,
  hostname: 'localhost',
  platform: 'win32',
  type: 'Windows_NT',
  release: '10.0.19045',
  cpuUsage: [
    { user: 1000, nice: 0, sys: 500, idle: 8500, irq: 0 },
    { user: 900, nice: 0, sys: 600, idle: 8500, irq: 0 }
  ],
  ramUsage: 45
};

export const mockServerStatus = {
  'server-001': { success: true },
  'server-002': { success: false },
  'server-003': { success: true }
};

// 模拟认证令牌
export const mockAuthToken = 'mock-auth-token-12345';

// 模拟首次使用状态
export const mockIsFirst = false;

// 模拟请求计数
export const mockRequestCount = 125;

// 模拟管理员信息
export const mockAdminInfo = {
  id: 1,
  username: 'admin',
  last_login: '2025-10-01 10:30:00',
  created_at: '2025-03-01 12:00:00',
  updated_at: '2025-10-01 10:30:00'
};

// 模拟OneBot配置
export const mockOneBotConfig = {
  host: '127.0.0.1',
  port: 3001,
  access_token: 'your_access_token_here'
};

// 模拟命令执行结果
export const mockCommandResult = {
  result: 'Command executed successfully'
};

// 模拟连接状态
export const mockConnectionStatus = {
  connected: true
};

// 模拟玩家列表数据
export const mockPlayerList = [
  {
    id: 'Steve',
    qq: '123456789',
    server: '生存服务器',
    qq_group: '987654321',
    online: true,
    uuid: 'player-uuid-1'
  },
  {
    id: 'Alex',
    qq: '987654321',
    server: '生存服务器',
    qq_group: '987654321',
    online: false,
    uuid: 'player-uuid-2'
  },
  {
    id: 'Herobrine',
    qq: '456789123',
    server: '创造服务器',
    qq_group: '123789456',
    online: true,
    uuid: 'player-uuid-3'
  },
  {
    id: 'Notch',
    qq: '111222333',
    server: '冒险服务器',
    qq_group: '444555666',
    online: true,
    uuid: 'player-uuid-4'
  },
  {
    id: 'Jeb',
    qq: '444555666',
    server: '生存服务器',
    qq_group: '987654321, 111222333',
    online: false,
    uuid: 'player-uuid-5'
  }
];