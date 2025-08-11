#!/bin/bash
clear
echo "AQQBot-Web 启动器"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "未安装 Node.js，正在准备环境..."
    ./setup-env.sh
    exit 1
fi

# 获取 Node.js 版本
NODE_VERSION=$(node --version)

echo "========================================"
echo "正在启动AQQBot-Web a1.0.1"
echo "========================================"
echo "Node.js 版本: $NODE_VERSION"
echo "当前目录: $(pwd)"
echo "---------------"
echo "报错请尝试安装环境"

yarn dev