#!/bin/bash

clear
echo -e "\033]0;AQQBot-Web\007"

echo "========================================"
echo "正在启动AQQBot-Web a1.0.4"
echo "========================================"

# 设置默认端口
PORT=3000

# 检查是否有传入端口参数
if [ ! -z "$1" ]; then
    PORT=$1
fi

NODE_VERSION=$(node --version)
echo "当前目录: $(pwd)"
echo "打开地址: http://localhost:$PORT/"
echo "---------------"
echo "适用于本机自带Node.js环境"
echo "报错请加入QQ群: 669737143"

PORT=$PORT node .output/server/index.mjs

echo "按回车键继续..."
read