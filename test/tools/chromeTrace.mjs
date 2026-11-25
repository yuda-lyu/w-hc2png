import fs from 'fs'
import { fileURLToPath } from 'url'


//chromeTrace: 判讀test/tools/chromeExe.mjs於環境變數W_HC2PNG_CHROME_TRACE所記之事件(JSON列), 驗證「同一快取之chrome只下載一次」(帳本R19)
//判準以wsemi fsEnsureBins之onTrace事件為準, 不以耗時判斷:
//  - 'download'(開始自來源下載)只出現於單一行程(pid), 且同一檔(name+file)不重複
//  - 'publish'之result為placed/replaced(整組發布)至多1次
//  - 無'lock-wait'之timeout、無'lock-skip'(鎖未生效)、無'settle'之ok=false、無登記(job)多於整體結果(settle)之行程(取得中被終止或懸置)
//  - 事件為空(未啟用記錄)為mode none: 無法判定, ok為false(不當作通過)
//  - 無'download'而有其他事件為mode warm(快取命中, 未下載; 不能證明「只下載一次」, 驗收須為cold); 有'download'為mode cold
//用法(驗收): 事件檔只附加不清, 先刪除該檔; 設環境變數W_HC2PNG_CHROME_TRACE為該檔後執行測試, 再執行 node test/tools/chromeTrace.mjs <該檔>; 離開碼0=ok, 1=違反, 2=無事件


//parseTrace: JSON列文字轉事件陣列(空行略過; 無法解析之列拋錯, 不靜默略過)
function parseTrace(text) {
    let evs = []
    for (let line of String(text).split(/\r?\n/)) {
        if (line.trim() === '') {
            continue
        }
        evs.push(JSON.parse(line))
    }
    return evs
}


function uniq(arr) {
    return [...new Set(arr)]
}


//judgeTrace: 判讀事件, 回傳{ ok, mode, nEvents, downloaders[pid], nDownload, nPublish, waiters[pid], nWaitEnd, nWaitEndHit, progressWait, reasons[] }
function judgeTrace(evs) {
    let tr = evs.filter((e) => e.src === 'trace')
    let pr = evs.filter((e) => e.src === 'progress')
    let dl = tr.filter((e) => e.type === 'download')
    let downloaders = uniq(dl.map((e) => e.pid))
    let keys = dl.map((e) => `${e.name}|${e.file}`)
    let dup = uniq(keys.filter((k, i) => keys.indexOf(k) !== i))
    let publish = tr.filter((e) => e.type === 'publish' && (e.result === 'placed' || e.result === 'replaced'))
    let lockWait = tr.filter((e) => e.type === 'lock-wait')
    let waitStart = lockWait.filter((e) => e.phase === 'start')
    let waitEnd = lockWait.filter((e) => e.phase === 'end')
    let waitTimeout = lockWait.filter((e) => e.phase === 'timeout')
    let settleFail = tr.filter((e) => e.type === 'settle' && e.ok === false)
    let skips = tr.filter((e) => e.type === 'lock-skip')

    //登記(job)多於整體結果(settle)之行程: 取得中被終止或懸置(hook逾時、行程被殺), 其下載是否完成無從判定
    let unsettled = uniq(tr.map((e) => e.pid)).filter((pid) => {
        let n = (type) => tr.filter((e) => e.pid === pid && e.type === type).length
        return n('job') > n('settle')
    })

    let reasons = []
    if (tr.length === 0) {
        reasons.push('no trace events (W_HC2PNG_CHROME_TRACE not set or no acquisition happened): inconclusive')
    }
    if (downloaders.length > 1) {
        reasons.push(`downloaded by ${downloaders.length} processes (${downloaders.join(',')}), expect 1`)
    }
    if (dup.length > 0) {
        reasons.push(`same file downloaded more than once: ${dup.join(', ')}`)
    }
    if (publish.length > 1) {
        reasons.push(`bundle published ${publish.length} times, expect at most 1`)
    }
    if (waitTimeout.length > 0) {
        reasons.push(`${waitTimeout.length} lock-wait timeout`)
    }
    if (settleFail.length > 0) {
        reasons.push(`${settleFail.length} acquisition failed (settle ok=false, code=${uniq(settleFail.map((e) => e.code)).join(',')})`)
    }
    if (skips.length > 0) {
        reasons.push(`${skips.length} lock-skip (${uniq(skips.map((e) => e.why)).join(',')}): the cross-process lock did not protect that acquisition`)
    }
    if (unsettled.length > 0) {
        reasons.push(`acquisition did not settle in pid ${unsettled.join(',')} (hung or killed)`)
    }

    return {
        ok: reasons.length === 0,
        mode: tr.length === 0 ? 'none' : (dl.length > 0 ? 'cold' : 'warm'),
        nEvents: tr.length,
        downloaders,
        nDownload: dl.length,
        nPublish: publish.length,
        nLockSkip: skips.length,
        unsettled,
        waiters: uniq(waitStart.map((e) => e.pid)),
        nWaitEnd: waitEnd.length,
        nWaitEndHit: waitEnd.filter((e) => e.hit === true).length,
        progressWait: pr.filter((e) => e.step === 'wait').length,
        reasons,
    }
}


function readTrace(fp) {
    return parseTrace(fs.readFileSync(fp, 'utf8'))
}


//isMain: 本檔是否為直接執行之主模組; Node以realpath載入主模組(import.meta.url為其realpath), 故argv[1]亦取realpath比對(經目錄連結或磁碟代號大小寫不同時, 單用path.resolve會誤判為非主模組而無輸出以離開碼0結束, 等於通過)
function isMain() {
    try {
        return Boolean(process.argv[1]) && fs.realpathSync(process.argv[1]) === fs.realpathSync(fileURLToPath(import.meta.url))
    }
    catch (err) {
        return false
    }
}


//CLI
if (isMain()) {
    let fp = process.argv[2]
    if (!fp) {
        console.log('usage: node test/tools/chromeTrace.mjs <trace.jsonl>')
        process.exit(2)
    }
    let r = judgeTrace(readTrace(fp))
    console.log(JSON.stringify(r, null, 2))
    process.exit(r.mode === 'none' ? 2 : (r.ok ? 0 : 1))
}


export {
    parseTrace,
    readTrace,
    judgeTrace
}
