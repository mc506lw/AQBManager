import { authentication } from '../utils/authmanager'
import { incrementRequestCount, getRequestCount, resetRequestCount } from '../utils/requestCounter'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import fs from 'fs'

export default defineEventHandler(async (event) => {
    incrementRequestCount();
    const body = await readBody(event)
    const authResult = await authentication(body.token);
    if (!authResult) return { success: false, msg: '认证失败' };
    return await send_inform();
})

async function send_inform() {
    // 读取 package.json 文件获取版本信息
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);
    const packagePath = join(__dirname, '../../package.json');
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    const panelVersion = packageJson.version;
    
    const os = await import('os');
    const process = await import('process');
    
    // 获取系统信息
    const nodeVersion = process.version;
    const nodeVersionInfo = '2.0-alpha.13';
    const username = os.userInfo().username;
    const panelTime = new Date().toLocaleString();
    const browserTime = new Date().toLocaleString(); // 假设浏览器时间与面板时间相同
    const totalMemory = Math.round(os.totalmem() / (1024 * 1024)); // MB
    const freeMemory = Math.round(os.freemem() / (1024 * 1024)); // MB
    const loadAverage = os.loadavg();
    const panelMemoryUsage = process.memoryUsage().rss / (1024 * 1024); // MB
    const hostname = os.hostname();
    const platform = os.platform();
    const release = os.release();
    const type = os.type();
    const cpuUsage = os.cpus().map(cpu => cpu.times);
    const ramUsage = ((os.totalmem() - os.freemem()) / os.totalmem()) * 100; // 百分比
    
    return {
        nodeVersion,
        panelVersion,
        nodeVersionInfo,
        username,
        panelTime,
        browserTime,
        totalMemory,
        freeMemory,
        loadAverage,
        panelMemoryUsage,
        hostname,
        platform,
        release,
        type,
        cpuUsage,
        ramUsage,
        requestCount: getRequestCount()
    };
}