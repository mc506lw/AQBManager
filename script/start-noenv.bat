chcp 65001
@echo off
cls
title AQQBot-Web

echo 读取环境变量 
set "PORT=3000"
if defined PORT (
    set "PORT=%PORT%"
) else (
    set "PORT=3000"
)

echo ======================================== 
echo 正在启动AQQBot-Web a1.0.4 
echo ======================================== 
echo 适用于本机自带Node.js环境 
echo 当前目录: %CD% 
echo 打开地址: http://localhost:%PORT%/ 
echo --------------- 
echo 报错请加入QQ群: 669737143 

node .output/server/index.mjs
pause