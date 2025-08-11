#!/bin/bash
clear
echo "正在安装环境..."

# 检查并安装 Node.js
if ! command -v node &> /dev/null; then
    echo "下载 Node.js..."
    curl -o node.tar.xz https://cdn.npmmirror.com/binaries/node/v18.17.0/node-v18.17.0-linux-x64.tar.xz
    
    if [ $? -eq 0 ]; then
        echo "解压 Node.js..."
        tar -xf node.tar.xz
        
        echo "安装 Node.js..."
        sudo cp -r node-v18.17.0-linux-x64/* /usr/local/
        
        echo "清理安装包..."
        rm -rf node-v18.17.0-linux-x64 node.tar.xz
        
        # 验证安装
        if command -v node &> /dev/null; then
            echo "Node.js 安装成功"
        else
            echo "Node.js 安装失败"
            exit 1
        fi
    else
        echo "Node.js 下载失败，请手动安装"
        exit 1
    fi
else
    echo "Node.js 已安装"
fi

# 配置淘宝镜像源
echo "配置淘宝镜像源..."
npm config set registry https://registry.npmmirror.com

# 安装 Yarn
echo "安装 Yarn..."
npm install -g yarn

# 安装项目依赖
echo "安装项目依赖..."
yarn install

echo ""
echo "环境安装完成！"
read -p "按回车键继续..."