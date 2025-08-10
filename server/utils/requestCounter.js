let requestCount = 0;
let resetTimer = null;

function incrementRequestCount() {
    requestCount++;
    // 清除之前的定时器
    if (resetTimer) {
        clearTimeout(resetTimer);
    }
    // 设置新的定时器，在5秒后清零计数器
    resetTimer = setTimeout(() => {
        requestCount = 0;
        resetTimer = null;
    }, 5000);
}

function getRequestCount() {
    return requestCount;
}

function resetRequestCount() {
    requestCount = 0;
    if (resetTimer) {
        clearTimeout(resetTimer);
        resetTimer = null;
    }
}

module.exports = {
    incrementRequestCount,
    getRequestCount,
    resetRequestCount
};