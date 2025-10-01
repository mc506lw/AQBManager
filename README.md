# AQBManager - 纯前端版本

AQBManager 是一个现代化的 AQQBot 管理平台，提供直观的 Web 界面来管理多个 AQQBot 服务器实例。

## 特性

- 纯前端应用，无需后端服务器
- 响应式设计，支持桌面和移动设备
- 实时数据展示（使用模拟数据）
- 多主题支持
- 完整的管理功能

## 构建和部署

### 开发模式

```bash
# 安装依赖
yarn install

# 启动开发服务器
yarn dev
```

### 构建静态站点

```bash
# 构建静态站点
yarn generate

# 或者使用 export 命令（别名）
yarn export
```

构建完成后，所有文件将生成在 `dist` 目录中，可以直接部署到任何静态文件服务器上。

### 部署到 GitHub Pages

1. 构建静态站点：
   ```bash
   yarn generate
   ```

2. 将 `dist` 目录中的内容推送到 `gh-pages` 分支

### 部署到其他静态文件服务器

1. 构建静态站点：
   ```bash
   yarn generate
   ```

2. 将 `dist` 目录中的所有文件上传到您的静态文件服务器

## 使用说明

由于这是纯前端版本，所有数据都是模拟的：

- 登录用户名：`admin`
- 登录密码：`admin`

## 技术栈

- [Nuxt 3](https://nuxt.com/)
- [Vue 3](https://vuejs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DaisyUI](https://daisyui.com/)
- [Pinia](https://pinia.vuejs.org/)

## 许可证

MIT