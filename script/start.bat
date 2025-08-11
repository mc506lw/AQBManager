@echo off
cls
title AQQBot-Web

node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 未安装 Node.js，正在准备环境...
    call setup-env.bat
    exit
)

echo ========================================
echo 正在启动AQQBot-Web a1.0.1
echo ========================================
echo Node.js 版本: %NODE_VERSION%
echo 当前目录: %CD%
echo ---------------
echo 报错请尝试安装环境

yarn dev