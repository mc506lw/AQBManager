import { get_inform, login, change, authentication } from '../utils/authmanager.js'
import { incrementRequestCount } from '../utils/requestCounter'


export default defineEventHandler(async (event) => {
    incrementRequestCount();
    const body = await readBody(event)
    switch (body.action) {
        case 'get_inform':
            return await get_inform(body.token)
        case 'login':
            return await login(body.name, body.password)
        case 'change':
            return await change(body.token, body.name, body.password)
        case 'authentication':
            return await authentication(body.token)
        default:
            return { success: false, msg: '未知操作' }
    }
})
