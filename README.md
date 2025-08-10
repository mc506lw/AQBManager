# AQQBot 管理平台

AQQBot 管理平台是一个基于 Nuxt 3 的 Web 应用程序，用于管理和监控 AQQBot 插件在多个服务器上的运行状态和配置。

## 项目架构

### 前端架构

- **框架**: Nuxt 3 (Vue 3)
- **状态管理**: Pinia
- **UI 框架**: Tailwind CSS + DaisyUI
- **图表库**: Chart.js
- **构建工具**: Vite
- **CSS 预处理器**: Tailwind CSS

项目采用标准的 Nuxt 3 目录结构：

- `app/`: 主应用目录
  - `components/`: 可复用的 Vue 组件
  - `pages/`: 页面组件，使用文件路由
  - `middleware/`: 中间件
  - `utils/`: 工具函数和 Pinia store
- `public/`: 静态资源
- `server/`: 服务端 API 路由和工具函数

### 后端架构

- **运行环境**: Node.js
- **WebSocket 库**: ws
- **加密库**: bcryptjs
- **API 框架**: Nuxt 3 内置服务器路由

后端采用 Nuxt 3 的服务端路由机制：

- `server/api/`: API 路由
- `server/utils/`: 服务端工具函数
- `server/data/`: 数据存储 (JSON 文件)

后端通过 WebSocket 与 AQQBot 服务器进行实时通信，管理多个服务器的连接。

## 技术栈

### 前端技术

- Vue 3 (Composition API)
- Nuxt 3
- Pinia (状态管理)
- Tailwind CSS (样式)
- DaisyUI (UI 组件)
- Chart.js (数据可视化)

### 后端技术

- Node.js
- WebSocket (ws 库)
- bcryptjs (密码加密)

### 开发工具

- Yarn (包管理)
- Vite (构建工具)
- Nuxt DevTools (开发调试)

## 要求标准

### 开发环境

- Node.js >= 16.x
- Yarn >= 1.22.x

### 代码规范

- Vue 3 Composition API
- Tailwind CSS 实用类
- DaisyUI 组件类
- Pinia 状态管理

### 设计规范

- **设计哲学**: 极简高效，专业科技。融合现代简约与深色科技，聚焦功能操作，消除视觉噪音。
- **主题色体系**: 使用 daisyui 提供的 base-100/base-200/base-300 等颜色，强化主题。
- **功能优先**: 仅保留必要元素（图标/数据/操作按钮），留白≥30%。

## 项目运行

### 安装依赖

```bash
yarn install
```

### 开发模式

```bash
yarn dev
```

### 构建生产版本

```bash
yarn build
```

### 预览生产版本

```bash
yarn preview
```

## 目录结构

```
├── app/                  # 前端应用目录
│   ├── components/       # Vue 组件
│   ├── pages/            # 页面组件
│   ├── middleware/       # 中间件
│   └── utils/            # 工具函数和状态管理
├── server/               # 后端服务
│   ├── api/              # API 路由
│   ├── utils/            # 工具函数
│   └── data/             # 数据存储
├── public/               # 静态资源
├── nuxt.config.ts        # Nuxt 配置文件
└── package.json          # 项目依赖和脚本
```

## 功能模块

1. **仪表盘**: 显示系统信息和服务器统计
2. **玩家管理**: 管理服务器上的玩家列表
3. **系统配置**: 配置机器人、QQ群和服务器
4. **指令控制**: 发送远程命令和自定义指令
5. **配置中心**: 管理插件配置

## 贡献

欢迎提交 Issue 和 Pull Request 来改进这个项目。

## 许可证

该项目采用 MIT 许可证。