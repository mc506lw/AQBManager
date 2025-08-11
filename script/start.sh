#!/bin/bash

clear
echo -e "\033]0;AQQBot-Web\007"

echo "========================================"
echo "正在启动AQQBot-Web a1.0.1"
echo "========================================"

if ! command -v node &> /dev/null; then
    echo "错误: 未找到 Node.js"
    echo "请先安装 Node.js: https://nodejs.org/"
    echo "请安装 Node.js 22.x 或更高版本"
    echo "按回车键退出..."
    read
    exit 1
fi

NODE_VERSION=$(node --version)
echo "Node.js 版本: $NODE_VERSION"
echo "当前目录: $(pwd)"
echo "打开地址: http://localhost:3000/"
echo "---------------"
echo "报错请尝试安装环境"

node .output/server/index.mjs

echo "按回车键继续..."
read