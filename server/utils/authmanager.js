import fs from 'fs'
import path from 'path'
import bcrypt from 'bcryptjs'

const dataPath = path.join(process.cwd(), 'server/data/auth.json')

// 确保文件存在
export function authensureDataFile() {
    // 检查文件夹是否存在，不存在就创建
    const dir = path.dirname(dataPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // 检查文件是否存在，不存在就创建
    if (!fs.existsSync(dataPath)) {
        const time = new Date().getTime()
        const hashedPassword = bcrypt.hashSync('123456', 10)
        const defaultData = {
            name: "admin",
            password: hashedPassword,
            lastlogin: "never",
            createtime: time,
            updatetime: time
        }
        fs.writeFileSync(dataPath, JSON.stringify(defaultData, null, 2))
        console.log('已自动创建默认用户名和密码')
        console.log('用户名为admin')
        console.log('密码为123456')
    }
}

export async function get_data() {
    authensureDataFile()
    try {
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'))
        return data
    } catch (error) {
        console.error('读取数据失败:', error)
        return null
    }
}

async function write_data(data) {
    authensureDataFile()
    try {
        const jsonData = JSON.stringify(data, null, 2)
        fs.writeFileSync(dataPath, jsonData)
        return true
    } catch (error) {
        console.error('写入数据失败:', error)
        return false
    }
}

export async function authentication(token) {
    const data = await get_data()
    if (!data) return false
    return data.password === token
}

export async function get_inform(token) {
    const auth = await authentication(token)
    if (auth) {
        const data = await get_data()
        return { success: true, data: data }
    }
    return { success: false, msg: '认证失败' }
}

export async function login(name, password) {
    const data = await get_data()
    if (!data) return { success: false, msg: '系统错误' }
    
    if (data.name === name && bcrypt.compareSync(password, data.password)) {
        // 更新最后登录时间
        data.lastlogin = new Date().toISOString()
        await write_data(data)
        
        return { 
            success: true, 
            msg: '登录成功', 
            token: data.password
        }
    }
    return { success: false, msg: '用户名或密码错误' }
}

export async function change(token, name, password) {
    const auth = await authentication(token)
    if (auth) {
        // 验证用户名格式
        const nameRegex = /^[A-Za-z][A-Za-z0-9\-]{2,29}$/
        if (!nameRegex.test(name)) {
            return { success: false, msg: '用户名必须为3到30个字符，仅允许字母、数字、英文符号，且不能以数字开头' }
        }

        // 验证密码格式
        const passwordRegex = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{4,}$/
        if (!passwordRegex.test(password)) {
            return { success: false, msg: '密码必须为4个字符以上，包含至少一个数字、至少一个小写字母、至少一个大写字母' }
        }

        const data = await get_data()
        data.name = name
        data.password = bcrypt.hashSync(password, 10)
        data.updatetime = new Date().getTime()
        const success = await write_data(data)
        
        if (success) {
            return { success: true, msg: '修改成功' }
        } else {
            return { success: false, msg: '保存失败' }
        }
    }
    return { success: false, msg: '认证失败' }
}