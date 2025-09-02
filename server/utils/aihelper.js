import fs from 'fs'
import path from 'path'
import { authentication } from './authmanager.js'

// AI配置文件路径
const aiConfigPath = path.join(process.cwd(), 'server/data/ai.json')

// 确保AI配置文件存在
export function aiEnsureConfigFile() {
    // 检查文件夹是否存在，不存在就创建
    const dir = path.dirname(aiConfigPath)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true })
    }

    // 检查文件是否存在，不存在就创建
    if (!fs.existsSync(aiConfigPath)) {
        const defaultConfig = {
            api_url: "https://api.openai.com/v1/chat/completions",
            api_key: "sk-",
            model: "gpt-3.5-turbo",
            temperature: 0.7,
            max_tokens: 8000
        }
        fs.writeFileSync(aiConfigPath, JSON.stringify(defaultConfig, null, 2))
    }
}

// 获取AI配置
export async function getAIConfig() {
    aiEnsureConfigFile()
    try {
        const config = JSON.parse(fs.readFileSync(aiConfigPath, 'utf-8'))
        return config
    } catch (error) {
        console.error('读取AI配置失败:', error)
        return null
    }
}

// 保存AI配置
async function saveAIConfig(config) {
    aiEnsureConfigFile()
    try {
        const jsonData = JSON.stringify(config, null, 2)
        fs.writeFileSync(aiConfigPath, jsonData)
        return true
    } catch (error) {
        console.error('保存AI配置失败:', error)
        return false
    }
}

// 验证API配置
export async function verifyAPIConfig(token, api_url, api_key, model, max_tokens) {
    const user = await authentication(token)
    if (!user) {
        return { success: false, msg: '认证失败' }
    }
    try {
        // 构造一个简单的测试请求
        const testRequest = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: model,
                messages: [{ role: 'user', content: '直接告诉我1+1等于多少，不要说别的' }],
                max_tokens: max_tokens
            })
        };

        const response = await fetch(api_url, testRequest);
        
        if (response.status === 401) {
            return { success: false, msg: 'API密钥无效' }
        } else if (response.status === 404) {
            return { success: false, msg: 'API地址无效' }
        } else if (response.ok) {
            // 尝试解析响应以确保能获得有效回答
            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                return { success: true, msg: 'API配置有效' }
            } else {
                return { success: false, msg: 'API配置无效：无法获得有效回答' }
            }
        } else {
            return { success: false, msg: `验证失败，状态码: ${response.status}` }
        }
    } catch (error) {
        return { success: false, msg: `验证失败: ${error.message}` }
    }
}

// 设置API配置
export async function setAPIConfig(token, api_url, api_key, model, max_tokens) {
    const user = await authentication(token)
    if (!user) {
        return { success: false, msg: '认证失败' }
    }
    try {
        const config = await getAIConfig()
        if (!config) {
            return { success: false, msg: '无法读取配置文件' }
        }
        
        config.api_url = api_url
        config.api_key = api_key
        config.model = model
        config.max_tokens = max_tokens
        
        const success = await saveAIConfig(config)
        if (success) {
            return { success: true, msg: '配置保存成功' }
        } else {
            return { success: false, msg: '配置保存失败' }
        }
    } catch (error) {
        return { success: false, msg: `设置失败: ${error.message}` }
    }
}

// AI聊天函数，支持流式返回
// messages参数应包含完整的对话历史，以提供上下文
export async function chat(token, messages, question) {
    const user = await authentication(token)
    if (!user) {
        return { success: false, msg: '认证失败' }
    }
    try {
        const config = await getAIConfig()
        if (!config) {
            console.log('AI配置未找到');
            return { success: false, msg: 'AI配置未找到' }
        }
        
        // 限制消息历史长度，防止超出API限制
        const maxContextLength = 10; // 最大上下文消息数
        const recentMessages = messages.slice(-maxContextLength);
        const prompt = createPrompt(question)
        recentMessages.unshift({ role: 'system', content: prompt })
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${config.api_key}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: config.model,
                messages: recentMessages, // 使用处理后的消息历史
                temperature: config.temperature,
                max_tokens: config.max_tokens,
                stream: true  // 启用流式返回
            })
        }
        
        const response = await fetch(config.api_url, options)
        
        
        if (!response.ok) {
            // 尝试解析错误响应，但要处理可能的解析错误
            let errorMsg = response.statusText;
            try {
                const errorData = await response.json();
                errorMsg = errorData.error?.message || response.statusText;
            } catch (parseError) {
                // 如果无法解析JSON，使用状态文本
                console.error('无法解析错误响应:', parseError);
            }
            console.log('AI请求失败:', errorMsg);
            return { success: false, msg: `AI请求失败: ${errorMsg}` }
        }
        
        // 检查是否为流式响应
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('text/event-stream')) {
            // 对于流式响应，返回响应体
            return { success: true, stream: response.body }
        } else {
            // 对于非流式响应，尝试解析JSON
            try {
                const data = await response.json();
                return { success: true, data: data }
            } catch (parseError) {
                console.error('无法解析响应:', parseError);
                return { success: false, msg: '无法解析AI响应' }
            }
        }
    } catch (error) {
        console.error('聊天请求异常:', error);
        return { success: false, msg: `聊天请求失败: ${error.message}` }
    }
}

// 获取API配置信息
export async function getAPIInfo(token) {
    const user = await authentication(token)
    if (!user) {
        return { success: false, msg: '认证失败' }
    }
    try {
        const config = await getAIConfig()
        if (!config) {
            return { success: false, msg: 'AI配置未找到' }
        }
        
        // 返回信息
        return { 
            success: true, 
            data: {
                api_key: config.api_key,
                api_url: config.api_url,
                model: config.model,
                temperature: config.temperature,
                max_tokens: config.max_tokens
            }
        }
    } catch (error) {
        return { success: false, msg: `获取配置信息失败: ${error.message}` }
    }
}