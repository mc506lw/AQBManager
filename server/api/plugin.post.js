import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs'
import { join } from 'path'
import { authentication } from '../utils/authmanager.js'

const DATA_DIR = join(process.cwd(), 'server/data')
const PLUGIN_DATA_FILE = join(DATA_DIR, 'plugins.json')
const REPO_URLS = [
  'https://raw.githubusercontent.com/alazeprt/AQQBot-Plugins/refs/heads/main/repository.json', // 官方源
  'https://gh-proxy.com/https://raw.githubusercontent.com/alazeprt/AQQBot-Plugins/refs/heads/main/repository.json',
  'https://edgeone.gh-proxy.com/https://raw.githubusercontent.com/alazeprt/AQQBot-Plugins/refs/heads/main/repository.json',
  'https://gh.jasonzeng.dev/https://raw.githubusercontent.com/alazeprt/AQQBot-Plugins/refs/heads/main/repository.json'
]

// 确保data目录存在
if (!existsSync(DATA_DIR)) {
  mkdirSync(DATA_DIR, { recursive: true })
}

// 定时任务：每小时获取插件仓库数据
let lastUpdate = 0
const UPDATE_INTERVAL = 60 * 60 * 1000 // 1小时

async function fetchPluginRepository() {
  // 按顺序尝试不同的URL源
  for (let i = 0; i < REPO_URLS.length; i++) {
    const url = REPO_URLS[i]
    try {
      console.log(`正在尝试从 ${url} 获取插件仓库数据...`)
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      
      // 保存到本地文件
      writeFileSync(PLUGIN_DATA_FILE, JSON.stringify(data, null, 2))
      lastUpdate = Date.now()
      
      console.log(`插件仓库数据更新成功，使用源: ${url}`)
      return data
    } catch (error) {
      console.error(`从 ${url} 获取插件仓库数据失败:`, error.message)
      // 如果是最后一个源，抛出错误
      if (i === REPO_URLS.length - 1) {
        console.error('所有源都获取失败')
        // 如果获取失败但本地有缓存，返回缓存数据
        if (existsSync(PLUGIN_DATA_FILE)) {
          const cachedData = readFileSync(PLUGIN_DATA_FILE, 'utf-8')
          console.log('返回本地缓存数据')
          return JSON.parse(cachedData)
        }
        throw error
      }
      // 继续尝试下一个源
      console.log(`正在尝试下一个源...`)
    }
  }
}

// 初始化时获取一次数据
fetchPluginRepository()

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const { action, token } = body || {}
  
  // 验证token
  const authResult = await authentication(token)
  if (!authResult) {
    return {
      success: false,
      message: '认证失败'
    }
  }
  
  if (action === 'get') {
    // 返回当前存储的数据
    if (existsSync(PLUGIN_DATA_FILE)) {
      const data = readFileSync(PLUGIN_DATA_FILE, 'utf-8')
      return {
        success: true,
        data: JSON.parse(data),
        lastUpdate
      }
    } else {
      return {
        success: false,
        message: '暂无插件数据'
      }
    }
  } else if (action === 'update') {
    // 立即刷新数据
    try {
      const data = await fetchPluginRepository()
      return {
        success: true,
        data,
        message: '插件数据已更新'
      }
    } catch (error) {
      return {
        success: false,
        message: '更新失败: ' + error.message
      }
    }
  } else {
    return {
      success: false,
      message: '无效的action参数'
    }
  }
})

// 设置定时任务
setInterval(() => {
  fetchPluginRepository()
}, UPDATE_INTERVAL)