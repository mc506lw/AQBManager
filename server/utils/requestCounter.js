let requestCount = 0;

function incrementRequestCount() {
    requestCount = 1; // 每次请求时重置为1
}

// 每5秒清零计数器
setInterval(() => {
    requestCount = 0;
}, 5000);

function getRequestCount() {
    return requestCount;
}

function resetRequestCount() {
    requestCount = 0;
}

module.exports = {
    incrementRequestCount,
    getRequestCount,
    resetRequestCount
};