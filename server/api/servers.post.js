import { get_servers, add_server, edit_server, delete_server, do_action, get_server_status, get_all_servers_status } from '../utils/serversmanager.js'
import { incrementRequestCount } from '../utils/requestCounter'

export default defineEventHandler(async (event) => {
    incrementRequestCount();
    const body = await readBody(event)
    switch (body.action) {
        case 'get_servers':
            return await get_servers(body.token)
        case 'add':
            return await add_server(body.token, body.serverip, body.servertoken)
        case 'edit':
            return await edit_server(body.token, body.uuid, body.serverip, body.servertoken, body.servername)
        case 'delete':
            return await delete_server(body.token, body.uuid)
        case 'do_action':
            return await do_action(body.token, body.uuid, body.action_name, body.params)
        case 'get_status':
            return await get_server_status(body.token, body.uuid);
        case 'get_all_status':
            return await get_all_servers_status(body.token);
        default:
            return { success: false, msg: '未知操作' }
    }
})

