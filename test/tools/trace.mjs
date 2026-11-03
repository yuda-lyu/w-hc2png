//makeTrace: 收集w-html2png之觀察回調(whOpt.onTrace, 整包轉傳)所通知之事件, 供測試以「事件」而非「等待時間」同步與斷言
//事件為凍結之{ type, ... }物件, 於內部事件發生當下同步通知(w-html2png之opt.onTrace, 1.0.65起)
//wait(type, n)回傳Promise, 於第n個該type之事件到達時resolve(已到達則立即resolve); 永不到達時由mocha逾時判失敗, 不另設固定等待
function makeTrace() {
    let events = []
    let waiters = []

    let count = (type) => {
        return events.filter((e) => e.type === type).length
    }

    let onTrace = (e) => {
        events.push(e)
        waiters = waiters.filter((w) => {
            if (w.n <= count(w.type)) {
                w.resolve()
                return false
            }
            return true
        })
    }

    let ofType = (type) => {
        return events.filter((e) => e.type === type)
    }

    let wait = (type, n = 1) => {
        if (n <= count(type)) {
            return Promise.resolve()
        }
        return new Promise((resolve) => {
            waiters.push({ type, n, resolve })
        })
    }

    return { onTrace, events, ofType, wait }
}


export {
    makeTrace
}
