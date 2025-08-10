import { authensureDataFile, get_data } from '../utils/authmanager.js'
import bcrypt from 'bcryptjs'

export default defineEventHandler(async (event) => {
  // 确保数据文件存在
  authensureDataFile()
  
  // 获取认证数据
  const data = await get_data()
  
  if (!data) {
    return { is_first: false }
  }
  
  // 检查用户名是否为admin，密码是否为123456
  const isDefaultUsername = data.name === 'admin'
  const isDefaultPassword = bcrypt.compareSync('123456', data.password)
  
  // 如果用户名是admin且密码是123456，则返回true，否则返回false
  return { is_first: isDefaultUsername && isDefaultPassword }
})