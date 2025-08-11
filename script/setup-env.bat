@echo off
cls
echo 正在安装环境...

:: 检查并安装 Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo 下载 Node.js...
    powershell -Command "Invoke-WebRequest -Uri 'https://cdn.npmmirror.com/binaries/node/v18.17.0/node-v18.17.0-x64.msi' -OutFile 'node.msi' -TimeoutSec 300"
    echo 安装 Node.js...
    msiexec /i node.msi /quiet /norestart
    echo 清理安装包...
    del node.msi
)

:: 配置淘宝镜像源
echo 配置淘宝镜像源...
npm config set registry https://registry.npmmirror.com

:: 安装 Yarn
echo 安装 Yarn...
npm install -g yarn

:: 安装项目依赖
echo 安装项目依赖...
yarn install

echo.
echo 环境安装完成！
pause