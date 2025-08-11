chcp 65001
@echo off
cls
title AQQBot-Web

echo ========================================
echo 正在启动AQQBot-Web a1.0.1
echo ========================================
echo Node.js 版本: %NODE_VERSION%
echo 当前目录: %CD%
echo 打开地址: http://localhost:3000/
echo ---------------
echo 报错请尝试安装环境

"./node-v22.18.0-win-x64/node.exe" .output/server/index.mjs
pause