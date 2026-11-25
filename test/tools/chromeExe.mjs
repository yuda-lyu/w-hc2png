import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { createRequire } from 'module'
import WHtml2png from 'w-html2png'
import fsEnsureBins from 'wsemi/src/fsEnsureBins.mjs'
import { isWindows } from './child.mjs'


//chromeExe: 測試取得w-html2png自帶chrome(檔案組約402MB)之唯一入口(帳本R17、R19)
//  - 凡使用chrome之測試檔(含未給executablePath而由w-html2png於出圖時自行取得者), 一律於`before`以`await getChromeExe(this)`取得, 且須在使用chrome之前(R19)
//  - 取得處之時限對齊下載預算: getChromeExe以ctx.timeout(CHROME_BUDGET_MS)覆寫該hook之時限(不沿用`--timeout 180000`); 其餘案只用已備妥之路徑
//  - 平行(mocha --parallel)時多個行程同時取得, 須跨程序只下載一次: 由wsemi(>=1.9.75)之fsEnsureBins之跨程序鎖保證(同一快取資料夾同一取得單位只下載一次, 他方等候後讀快取), 本檔不另寫鎖
//    注意: w-html2png(1.0.94)之dist已將fsEnsureBins(1.9.74, 無跨程序鎖)內嵌打包, 升級本套件之wsemi不會使其內部取得帶鎖;
//    故本檔先以本套件之wsemi依w-html2png之清單(資料檔bin/manifest.json, 快取位置同其預設)取得一次(帶鎖), 再經公開入口WHtml2png.ensureBins取得路徑(此時為快取命中, 只校驗)
//    w-html2png之dist改以wsemi>=1.9.75建置發布後, 第一步成為冗餘(無害), 屆時可移除(見sgud/feedback)
//  - 路徑仍只經w-html2png之公開入口WHtml2png.ensureBins取得, 不深層匯入w-html2png之src或dist(R17)
//選取規則同w-html2png內部: 組chrome內恰有一個portable/App/Chrome-bin/<版本>/chrome.exe(版本由其清單決定, 不寫死); 組根層之同名檔為啟動器, 不取
//自帶chrome只有Windows版, 其他平台回傳''(不取得)


//每次下載(及每批解壓)之整體上限毫秒, 明給fsEnsureBins之opt.totalMs(其預設亦為600000; 明給使預算之推算不隨其預設值漂移)
const CHROME_TOTAL_MS = 300000

//檔案組chrome取得時, fsEnsureBins之下載次數與解壓批數(無鏡像時): 8個分割壓縮檔各下載1次; 107個成員路徑共約6.2K字元, 其每批至多6000字元(wsemi內部值)故為2批, 再加1批餘裕
//此二值由test/unit-chromeAcquire.test.mjs對照w-html2png之bin/manifest.json驗證不低於實際需要(清單變動時該測試轉紅, 提醒重估)
const CHROME_DOWNLOADS = 8
const CHROME_EXTRACT_BATCHES = 3

//wsemi fsEnsureBins解壓程式被終止後等其結束之毫秒(其內部KILL_WAIT_MS)
const KILL_WAIT_MS = 5000

//w-html2png之清單(相對其套件根)
const MANIFEST_REL = 'bin/manifest.json'


//chromeBudgetMs: 同wsemi fsEnsureBins跨程序鎖之持有/等候上限(lockBudget)之推算: 下載次數×totalMs + 解壓批數×(totalMs+終止等候) + 非下載時間之寬裕(totalMs與60秒之小者)
//(totalMs已含maxAttempts之各次嘗試與重試間隔, 故重試不再相乘); 等候他方下載者與自行下載者最長皆在此預算內
function chromeBudgetMs(totalMs, downloads, batches) {
    return downloads * totalMs + batches * (totalMs + KILL_WAIT_MS) + Math.min(totalMs, 60000)
}

//取得chrome之hook時限(毫秒)
const CHROME_BUDGET_MS = chromeBudgetMs(CHROME_TOTAL_MS, CHROME_DOWNLOADS, CHROME_EXTRACT_BATCHES)


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


//applyChromeBudget: 以ctx(mocha之before hook之this)設定該hook之時限為CHROME_BUDGET_MS; ctx不是可設時限之mocha上下文即拋錯(使漏傳this者立即現形, 不靜默沿用180秒)
function applyChromeBudget(ctx) {
    assert.ok(ctx !== null && typeof ctx === 'object' && typeof ctx.timeout === 'function', 'getChromeExe(ctx): ctx must be the mocha context (this) of a before hook, written as `await getChromeExe(this)`')
    ctx.timeout(CHROME_BUDGET_MS)
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
        //pid為本行程; 事件自帶之pid(如onProgress之wait事件之持有者PID)改記為evPid, 不蓋掉本行程之pid
        let { pid: evPid, ...rest } = ev
        let o = { ...rest, src, pid: process.pid, t: Date.now() }
        if (evPid !== undefined) {
            o.evPid = evPid
        }
        fs.appendFileSync(fp, JSON.stringify(o) + '\n')
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


//ensureChromeBins: 兩步取得(deps供測試以替身驗證順序與參數, 預設為真實函數)
//  步驟1(seed): 以本套件之wsemi之fsEnsureBins依w-html2png之清單取得檔案組(跨程序鎖: 同一快取只下載一次); pkgRoot為w-html2png之套件根, 快取位置與其預設相同(<pkgRoot>/bin-cache, 或環境變數W_BIN_CACHE等, 由fsEnsureBins統一處理)
//  步驟2: 經公開入口WHtml2png.ensureBins取得路徑(快取命中, 只校驗); 步驟1失敗即拋出, 不進入步驟2
async function ensureChromeBins(o, deps = {}) {
    let { seed = fsEnsureBins, pub = (x) => WHtml2png.ensureBins(x), root = () => findPkgRoot('w-html2png') } = deps
    await seed(MANIFEST_REL, { ...o, pkgRoot: root() })
    return pub(o)
}


//acquireChrome: 設定hook時限後取得檔案組chrome(回傳ensureBins之結果); ensure為取得函數(預設ensureChromeBins; 測試以替身驗證時限先於取得、totalMs與事件回調有傳入)
async function acquireChrome(ctx, ensure = ensureChromeBins) {
    applyChromeBudget(ctx)
    let { onTrace, onProgress } = makeSink()
    return ensure({ totalMs: CHROME_TOTAL_MS, onTrace, onProgress })
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
    CHROME_TOTAL_MS,
    CHROME_DOWNLOADS,
    CHROME_EXTRACT_BATCHES,
    CHROME_BUDGET_MS,
    MANIFEST_REL,
    chromeBudgetMs,
    findPkgRoot,
    applyChromeBudget,
    ensureChromeBins,
    acquireChrome,
    pickChromeExe,
    getChromeInfo,
    getChromeExe
}
