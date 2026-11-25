import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { createRequire } from 'module'
import WHtml2png from 'w-html2png'
import fsEnsureBinsBudget from 'wsemi/src/fsEnsureBinsBudget.mjs'
import { isWindows } from './child.mjs'


//chromeExe: 測試取得w-html2png自帶chrome(檔案組約402MB)之唯一入口(帳本R17、R19)
//  - 凡使用chrome之測試檔(含未給executablePath而由w-html2png於出圖時自行取得者), 一律於`before`以`await getChromeExe(this)`取得, 且須在使用chrome之前(R19)
//  - 取得只經公開入口WHtml2png.ensureBins(R17), 不深層匯入w-html2png之src或dist, 亦不另以wsemi之fsEnsureBins先行取得(無seed步驟)
//  - 跨程序只下載一次: 平行(mocha --parallel)時多個行程同時取得, 由公開入口所執行之取得函式(w-html2png建置時內嵌之wsemi fsEnsureBins, 須為帶跨程序鎖之建置)保證:
//    同一快取資料夾同一取得單位只下載一次, 他方等候後讀快取; 本檔不另寫鎖. 前提(w-html2png之dist含鎖之程式)由test/unit-chromeAcquire.test.mjs守門,
//    驗收以onTrace事件為準(W_HC2PNG_CHROME_TRACE與test/tools/chromeTrace.mjs), 全綠不證明只下載一次
//  - 取得處之時限對齊下載預算: getChromeExe以ctx.timeout(CHROME_BUDGET_MS)覆寫該hook之時限(不沿用`--timeout 180000`); 其餘案只用已備妥之路徑
//    CHROME_BUDGET_MS不自寫算式, 呼叫wsemi之fsEnsureBinsBudget(與fsEnsureBins跨程序鎖之持有/等候上限同一算式, 依w-html2png之清單bin/manifest.json求得),
//    並行時最壞要先等他方(上限即該預算)、他方失敗才自行取得, 故取兩倍(CHROME_PARALLEL_FACTOR)
//選取規則同w-html2png內部: 組chrome內恰有一個portable/App/Chrome-bin/<版本>/chrome.exe(版本由其清單決定, 不寫死); 組根層之同名檔為啟動器, 不取
//自帶chrome只有Windows版, 其他平台回傳''(不取得)


//w-html2png之清單(相對其套件根)
const MANIFEST_REL = 'bin/manifest.json'

//並行取得時hook時限相對於單一取得預算之倍數(並行時等候者最壞先等他方一個預算、他方失敗才自行取得一個預算)
const CHROME_PARALLEL_FACTOR = 2

//取得與預算共用之選項(不含事件回調): 預算須以與實際取得同一份選項求得(取得時另加onTrace/onProgress, 不影響預算)
//不給totalMs、stallMs等, 以wsemi之預設為準: 傳給下載之每檔上限不短於其預設, 預算亦隨其預設同步
const CHROME_ACQUIRE_OPT = Object.freeze({})


//chromeBudgetMs: 並行取得之hook時限毫秒 = 單一取得預算(fsEnsureBinsBudget)×CHROME_PARALLEL_FACTOR; manifest為清單物件或其JSON檔路徑(相對路徑以opt.pkgRoot為基準), opt同fsEnsureBins(pkgRoot必填)
function chromeBudgetMs(manifest, opt) {
    return fsEnsureBinsBudget(manifest, opt) * CHROME_PARALLEL_FACTOR
}


//findPkgRoot: 自模組解析位置向上找name為指定套件之package.json所在資料夾(與cwd無關); 找不到拋錯
function findPkgRoot(name) {
    let fp = createRequire(import.meta.url).resolve(name)
    let d = path.dirname(fp)
    for (let i = 0; i < 6; i++) {
        let fpPkg = path.join(d, 'package.json')
        if (fs.existsSync(fpPkg) && JSON.parse(fs.readFileSync(fpPkg, 'utf8')).name === name) {
            return d
        }
        d = path.dirname(d)
    }
    throw new Error(`package root of ${name} not found`)
}


//chromeBudgetNow: 依w-html2png之清單與CHROME_ACQUIRE_OPT於呼叫當下求得hook時限(毫秒); 環境變數W_BIN_MIRROR、W_BIN_OFFLINE於呼叫當下由fsEnsureBinsBudget讀取
function chromeBudgetNow() {
    return chromeBudgetMs(MANIFEST_REL, { ...CHROME_ACQUIRE_OPT, pkgRoot: findPkgRoot('w-html2png') })
}


//取得chrome之hook時限(毫秒): 於載入時求得
const CHROME_BUDGET_MS = chromeBudgetNow()


//applyChromeBudget: 以ctx(mocha之before hook之this)設定該hook之時限為CHROME_BUDGET_MS; ctx不是可設時限之mocha上下文即拋錯(使漏傳this者立即現形, 不靜默沿用180秒)
function applyChromeBudget(ctx) {
    assert.ok(ctx !== null && typeof ctx === 'object' && typeof ctx.timeout === 'function', 'getChromeExe(ctx): ctx must be the mocha context (this) of a before hook, written as `await getChromeExe(this)`')
    ctx.timeout(CHROME_BUDGET_MS)
}


//recordOf: 事件轉為記錄列物件(含來源src、本行程pid、時刻t); 事件自帶之pid(如onProgress之wait事件之持有者PID)改記為evPid, 不蓋掉本行程之pid
function recordOf(src, ev) {
    let { pid: evPid, ...rest } = ev
    let o = { ...rest, src, pid: process.pid, t: Date.now() }
    if (evPid !== undefined) {
        o.evPid = evPid
    }
    return o
}


//makeSink: 驗收用之事件紀錄; 環境變數W_HC2PNG_CHROME_TRACE給了檔案路徑時, 將ensureBins之onTrace/onProgress事件逐列以JSON附加於該檔(含pid、時刻), 供test/tools/chromeTrace.mjs判讀「只下載一次」; 未給則不記錄
function makeSink() {
    let fp = process.env.W_HC2PNG_CHROME_TRACE
    if (typeof fp !== 'string' || fp === '') {
        return { onTrace: undefined, onProgress: undefined }
    }
    fp = path.resolve(fp) //於取得當下解析為絕對路徑(相對路徑以行程之cwd為準)
    fs.mkdirSync(path.dirname(fp), { recursive: true })
    let write = (src, ev) => {
        fs.appendFileSync(fp, JSON.stringify(recordOf(src, ev)) + '\n')
    }
    return {
        onTrace: (ev) => {
            write('trace', ev)
        },
        onProgress: (ev) => {
            write('progress', ev)
        },
    }
}


//ensureChromeBins: 經公開入口WHtml2png.ensureBins取得(只此一步, 無先行取得; deps.pub供測試以替身驗證選項原樣傳入與結果、錯誤原樣回傳, 預設為真實公開入口)
async function ensureChromeBins(o, deps = {}) {
    let { pub = (x) => WHtml2png.ensureBins(x) } = deps
    return pub(o)
}


//acquireChrome: 設定hook時限後取得檔案組chrome(回傳ensureBins之結果); ensure為取得函數(預設ensureChromeBins; 測試以替身驗證時限先於取得、選項為CHROME_ACQUIRE_OPT加事件回調)
async function acquireChrome(ctx, ensure = ensureChromeBins) {
    applyChromeBudget(ctx)
    let { onTrace, onProgress } = makeSink()
    return ensure({ ...CHROME_ACQUIRE_OPT, onTrace, onProgress })
}


//pickChromeExe: 自ensureBins之結果選出組內帶版本之chrome.exe之絕對路徑
function pickChromeExe(bins) {
    let files = bins.bundles.chrome.files
    let ks = Object.keys(files).filter((k) => /^portable\/App\/Chrome-bin\/[^/]+\/chrome\.exe$/.test(k))
    assert.strict.equal(ks.length, 1, `the bundle chrome must have exactly one versioned chrome.exe, found ${ks.length}`)
    let fp = files[ks[0]]
    assert.ok(fs.existsSync(fp), `chrome.exe not found: ${fp}`)
    return fp
}


//getChromeInfo: 於before hook內取得自帶chrome, 回傳{ exe: chrome.exe絕對路徑, dir: 組資料夾絕對路徑 }; 非Windows回傳{ exe: '', dir: '' }
async function getChromeInfo(ctx) {
    if (!isWindows()) {
        applyChromeBudget(ctx) //非Windows不取得, 仍驗ctx, 使漏傳this者於所有平台皆現形
        return { exe: '', dir: '' }
    }
    let bins = await acquireChrome(ctx)
    return { exe: pickChromeExe(bins), dir: bins.chrome }
}


//getChromeExe: 同getChromeInfo, 只回傳chrome.exe絕對路徑('' 為非Windows); 隱式使用者(未給executablePath, 由w-html2png於出圖時自行取得)亦呼叫之以先備妥快取, 不使用回傳值
async function getChromeExe(ctx) {
    let info = await getChromeInfo(ctx)
    return info.exe
}


export {
    MANIFEST_REL,
    CHROME_PARALLEL_FACTOR,
    CHROME_ACQUIRE_OPT,
    CHROME_BUDGET_MS,
    chromeBudgetMs,
    chromeBudgetNow,
    findPkgRoot,
    applyChromeBudget,
    recordOf,
    ensureChromeBins,
    acquireChrome,
    pickChromeExe,
    getChromeInfo,
    getChromeExe
}
