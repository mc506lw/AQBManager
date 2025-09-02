import { incrementRequestCount } from '../utils/requestCounter'
import { getAPIInfo, verifyAPIConfig, setAPIConfig, chat } from '../utils/aihelper.js'
import { sendStream } from 'h3'

export default defineEventHandler(async (event) => {
    incrementRequestCount();
    const body = await readBody(event)
    
    switch (body.action) {
        case 'get_api':
            return await getAPIInfo(body.token)
        case 'verify_api':
            return await verifyAPIConfig(body.token, body.api_url, body.api_key, body.model, body.max_tokens)
        case 'set_api':
            return await setAPIConfig(body.token, body.api_url, body.api_key, body.model, body.max_tokens)
        case 'chat':
            const result = await chat(body.token, body.messages, body.question);
            
            // 如果是流式响应，直接返回ReadableStream
            if (result.success && result.stream) {
                // 设置响应头以支持流式传输
                event.node.res.setHeader('Content-Type', 'text/event-stream');
                event.node.res.setHeader('Cache-Control', 'no-cache');
                event.node.res.setHeader('Connection', 'keep-alive');
                
                // 将ReadableStream管道到响应
                return sendStream(event, result.stream);
            }
            return result;
        default:
            console.log('未知操作:', body.action);
            return { success: false, msg: '未知操作' }
    }
})
