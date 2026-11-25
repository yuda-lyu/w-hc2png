import { acquireChrome, ensureChromeBins, recordOf } from './chromeExe.mjs'


//childAcquire: 以獨立行程經共用工具(test/tools/chromeExe.mjs, 即公開入口WHtml2png.ensureBins)取得自帶chrome, 並收集onTrace/onProgress事件, 供unit-chromeAcquire驗證並行時只下載一次(帳本R19)
//用法: node test/tools/childAcquire.mjs   (多個行程同時啟動); 輸出一行 RESULT {"pid":<本行程>,"events":[...],"nFiles":<組內檔數>,"err":<null或首行錯誤訊息>}
//環境變數W_HC2PNG_CHROME_TRACE給了時, acquireChrome照常將事件附加於該檔(使整體驗收之事件檔含本行程之取得)
//取得函數與時限皆為共用工具之, 本檔不另寫取得或鎖; ctx以只有timeout函數之物件代替mocha上下文


let events = []
let r = { pid: process.pid, events, nFiles: 0, err: null }


//tee: 事件先記入本行程之events(格式同事件檔之列), 再交原回調(未啟用事件檔時為undefined)
function tee(src, f) {
    return (ev) => {
        events.push(recordOf(src, ev))
        if (typeof f === 'function') {
            f(ev)
        }
    }
}


async function main() {
    let ctx = {
        timeout() {
            return this
        }
    }
    let bins = await acquireChrome(ctx, (o) => ensureChromeBins({ ...o, onTrace: tee('trace', o.onTrace), onProgress: tee('progress', o.onProgress) }))
    r.nFiles = Object.keys(bins.bundles.chrome.files).length
}


main()
    .catch((err) => {
        r.err = String(err && err.message ? err.message : err).split('\n')[0]
    })
    .finally(() => {
        console.log('RESULT ' + JSON.stringify(r))
    })
