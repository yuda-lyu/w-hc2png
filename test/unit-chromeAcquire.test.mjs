import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { createRequire } from 'module'
import { spawnSync } from 'child_process'
import WHtml2png from 'w-html2png'
import fsEnsureBinsBudget from 'wsemi/src/fsEnsureBinsBudget.mjs'
import {
    MANIFEST_REL,
    CHROME_PARALLEL_FACTOR,
    CHROME_ACQUIRE_OPT,
    CHROME_BUDGET_MS,
    chromeBudgetMs,
    chromeBudgetNow,
    findPkgRoot,
    applyChromeBudget,
    ensureChromeBins,
    acquireChrome,
    getChromeInfo,
    getChromeExe
} from './tools/chromeExe.mjs'
import { parseTrace, readTrace, judgeTrace } from './tools/chromeTrace.mjs'
import { isWindows, runNode } from './tools/child.mjs'


//帳本R19: 測試取得w-html2png自帶chrome(約402MB)須集中、取得處時限對齊下載預算、跨程序只下載一次(平行時各檔不各自下載)
//  (a) 唯一取得點為test/tools/chromeExe.mjs, 其他測試檔與工具不得呼叫WHtml2png.ensureBins或fsEnsureBins; chromeExe.mjs自身只經公開入口WHtml2png.ensureBins取得, 不另以fsEnsureBins先行取得(無seed)
//  (b) 凡使用chrome之測試檔(含未給executablePath、出圖時隱式取得者)於before呼叫getChromeExe(this)或getChromeInfo(this), 先於任何使用
//  (c) 取得處之hook時限為CHROME_BUDGET_MS = fsEnsureBinsBudget(依w-html2png之清單, 與取得同一份選項CHROME_ACQUIRE_OPT)×CHROME_PARALLEL_FACTOR(並行取兩倍), 不自寫算式, 不沿用--timeout 180000; 傳給下載之每檔上限不短於wsemi之預設
//  (d) 跨程序只下載一次經公開入口即成立(w-html2png之dist內嵌帶鎖之wsemi fsEnsureBins): 本檔守門其dist含鎖之程式, 並以真實子行程並行經共用工具取得, 以onTrace事件(judgeTrace)判讀; 全套之驗收以W_HC2PNG_CHROME_TRACE與test/tools/chromeTrace.mjs為準, 不以耗時判斷
//  (e) 不靠--require之全域前置, 不改scripts.test
//本檔之案不下載chrome, 唯一例外為下方「concurrent acquisition」: 子行程經共用工具取得(快取命中只校驗; 快取為空時由其中一方下載一次, 為只下載一次之實證); 其餘取得以替身驗證接線, 真實取得亦由其他測試檔之before實跑(接縫不用替身)


let fdCase = path.resolve('./test/_tmp/unit-chromeAcquire')
let fdTest = path.resolve('./test')
let requireFrom = createRequire(import.meta.url)
let envKey = 'W_HC2PNG_CHROME_TRACE'
let envOld = process.env[envKey] //外部驗收可能已設此變數(記錄全套之事件), 本檔之案暫改後須還原, 不得清掉

//setEnv, 設定(undefined為刪除)事件檔環境變數
function setEnv(v) {
    if (v === undefined) {
        delete process.env[envKey]
    }
    else {
        process.env[envKey] = v
    }
}

//合成清單(格式同wsemi fsEnsureBinsBudget之JSDoc範例): 1個直接檔(1次下載) + 1個壓縮檔(1次下載、1批解壓), T=1000、無鏡像、非離線時單一預算為2000+8000=10000, 設鏡像為3000+10000=13000
const SYNTH_MANIFEST = {
    schema: 1,
    pkg: 'w-example',
    mode: 'pinned',
    repo: 'yuda-lyu/w-example',
    commit: '0123456789abcdef0123456789abcdef01234567',
    files: [
        { name: 'tool.exe', path: 'bin/tool.exe', sha256: '40f576db36632cf550d7d99bd6599c88a131ba725f46b29a95ae2d5359bb9913', size: 7 },
        { name: 'k6.exe', url: 'https://github.com/grafana/k6/releases/download/v1.0.0/k6-v1.zip', sha256: '0000000000000000000000000000000000000000000000000000000000000000', size: 100, extract: { type: 'zip', member: 'k6-v1/k6.exe', sha256: '1111111111111111111111111111111111111111111111111111111111111111', size: 50 } },
    ],
}


//fakeCtx, 記錄timeout呼叫之mocha上下文替身
function fakeCtx(log = []) {
    return {
        timeout(ms) {
            log.push({ call: 'timeout', ms })
            return this
        }
    }
}


//verOf, 'x.y.z'轉[x, y, z]數字陣列
function verOf(s) {
    return String(s).replace(/^[^\d]*/, '').split('.').slice(0, 3).map((v) => Number(v))
}


//geVer, a >= b(皆為'x.y.z')
function geVer(a, b) {
    let x = verOf(a)
    let y = verOf(b)
    for (let i = 0; i < 3; i++) {
        if (x[i] !== y[i]) {
            return x[i] > y[i]
        }
    }
    return true
}


//readManifest, 讀w-html2png之清單(資料檔, 非程式; R17)
function readManifest() {
    return JSON.parse(fs.readFileSync(path.join(findPkgRoot('w-html2png'), MANIFEST_REL), 'utf8'))
}


//manifestChrome, 清單中檔案組chrome之組內成員數與下載次數(自有檔或廠商網址之直接來源各1次, 壓縮檔為分割數或1次; 無鏡像)
function manifestChrome(manifest) {
    let b = manifest.bundles.find((v) => v.name === 'chrome')
    assert.ok(b, 'bundle chrome not found in manifest')
    let members = (b.files || []).length
    let downloads = (b.files || []).length
    for (let a of b.archives || []) {
        members += a.extract.files.length
        downloads += Array.isArray(a.parts) ? a.parts.length : 1
    }
    return { members, downloads }
}


//carriesLock, 公開入口(w-html2png之main, 其內嵌取得函式)之程式是否含wsemi fsEnsureBins之跨程序鎖(以其'lock-wait'事件為記)
function carriesLock(text) {
    return String(text).includes('lock-wait')
}


//stripComments, 去除註解(區塊與行尾), 使註解中出現之字樣不被當作程式碼; 以簡單規則處理(字串內之//亦會被截, 只用於下列關鍵字掃描)
function stripComments(text) {
    return String(text).replace(/\/\*[\s\S]*?\*\//g, '').replace(/(^|[^:'"`])\/\/.*$/gm, '$1')
}


//usesChrome, 測試檔是否使用chrome(出圖入口、子行程出圖、匯入出圖入口或出圖子行程之輔助、或已呼叫共用取得工具), 站點全集由此規則自檔案系統取得而非手列; 註解不計
function usesChrome(text) {
    let code = stripComments(text)
    return /\b(WHc2png|WHc2pngServer|WHtml2png)\s*\(|\bfpChildDraw\b|\bfpChildDual\b|\bgetChrome(Exe|Info)\s*\(/.test(code) ||
        /from\s*['"](\.\.\/src\/WHc2png(Server)?\.mjs|\.\.\/dist\/[^'"]*|w-hc2png|w-html2png|\.\/tools\/child(Draw|Dual)\.mjs)['"]/.test(code)
}


//listTestFiles, test/下之*.test.mjs(不含本檔)
function listTestFiles() {
    return fs.readdirSync(fdTest).filter((n) => /\.test\.mjs$/.test(n) && n !== 'unit-chromeAcquire.test.mjs')
}


//inBeforeHook, 位置idx之前最近一個'before('至idx之間無it/after等其他hook或案例, 即該位置位於before hook內
function inBeforeHook(text, idx) {
    let pre = text.slice(0, idx)
    let k = pre.lastIndexOf('before(')
    if (k < 0) {
        return false
    }
    return !/\b(it|specify|context|describe|after|afterEach|beforeEach)(\.\w+)?\s*\(/.test(pre.slice(k))
}


describe(`unit-chromeAcquire`, function() {

    before(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdCase, { recursive: true })
    })

    after(function() {
        setEnv(envOld)
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    describe(`time budget`, function() {

        //R19(c): hook時限為CHROME_BUDGET_MS, 且遠大於全域--timeout 180000(下載預算約為其10倍以上)
        it(`should set the hook timeout to the download budget `, function() {
            let log = []
            applyChromeBudget(fakeCtx(log))
            assert.deepStrictEqual(log, [{ call: 'timeout', ms: CHROME_BUDGET_MS }])
            assert.ok(CHROME_BUDGET_MS > 10 * 180000, `budget ${CHROME_BUDGET_MS} must be far above 180000`)
            assert.ok(CHROME_BUDGET_MS < 2 ** 31 - 1, 'budget must fit the mocha timer limit')
        })

        //R19(c): ctx不是可設時限之上下文(漏傳this)即拋錯, 不靜默沿用180秒; 平台無關(getChromeInfo在非Windows亦驗ctx)
        it(`should reject a missing or non-mocha ctx instead of silently keeping the default timeout `, async function() {
            for (let bad of [undefined, null, {}, { timeout: 1 }, 'x']) {
                assert.throws(() => applyChromeBudget(bad), /ctx must be the mocha context/)
            }
            for (let fn of [getChromeInfo, getChromeExe]) {
                await assert.rejects(() => fn(), /ctx must be the mocha context/)
                await assert.rejects(() => fn({}), /ctx must be the mocha context/)
            }
        })

        //R19(c): 時限先於取得; 取得時之選項只有CHROME_ACQUIRE_OPT加事件回調(預算與取得同一份選項, 不得只在取得端另加totalMs等影響預算之鍵); 結果原樣回傳
        it(`should set the timeout before acquiring and pass only the shared options to ensureBins `, async function() {
            setEnv(undefined) //未啟用事件記錄: 回調為undefined
            let log = []
            let ret = { chrome: 'x' }
            let r = null
            try {
                r = await acquireChrome(fakeCtx(log), async (o) => {
                    log.push({ call: 'ensure', opt: o })
                    return ret
                })
            }
            finally {
                setEnv(envOld)
            }
            assert.strict.equal(r, ret)
            assert.deepStrictEqual(log, [
                { call: 'timeout', ms: CHROME_BUDGET_MS },
                { call: 'ensure', opt: { ...CHROME_ACQUIRE_OPT, onTrace: undefined, onProgress: undefined } },
            ])
        })

        //R19(c)/規格E5-3: 預算 = wsemi fsEnsureBinsBudget(單一取得預算, 與鎖之上限同一算式) × CHROME_PARALLEL_FACTOR(並行取兩倍); 清單與選項(totalMs、鏡像)皆傳入該函數, 不自寫算式
        it(`should derive the budget from fsEnsureBinsBudget times the parallel factor `, function() {
            //規格: 並行時最壞要先等他方一個預算、他方失敗才自行取得一個預算, 取兩倍(literal 2, 不引用被測之常數以免自我參照)
            assert.strict.equal(CHROME_PARALLEL_FACTOR, 2)
            let base = { pkgRoot: '.', offline: false }
            //不同之選項(T、鏡像、預設)皆須與「兩倍 × wsemi預算函數」逐位相同(不含wsemi內部常數之字面值, 內部值改變時不使本案誤紅)
            let opts = [{ ...base, mirror: '', totalMs: 1000 }, { ...base, mirror: './mirror', totalMs: 1000 }, { ...base, mirror: './mirror', totalMs: 2500 }, { ...base, mirror: '' }]
            for (let opt of opts) {
                assert.strict.equal(chromeBudgetMs(SYNTH_MANIFEST, opt), 2 * fsEnsureBinsBudget(SYNTH_MANIFEST, opt))
            }
            //選項確實傳入預算函數(漏傳則下列各組同值): 給定totalMs與預設不同、有無鏡像不同、totalMs不同者不同
            let vals = opts.map((opt) => chromeBudgetMs(SYNTH_MANIFEST, opt))
            assert.strict.equal(new Set(vals).size, opts.length, `options must change the budget: ${vals.join(',')}`)
        })

        //R19(c): 預算於呼叫當下讀環境變數(W_BIN_MIRROR設定時每個來源先試鏡像, 預算放大); 寫死不讀環境者(如固定無鏡像)轉紅
        it(`should size the timeout from the mirror setting of the environment `, function() {
            let old = process.env.W_BIN_MIRROR
            try {
                delete process.env.W_BIN_MIRROR
                let plain = chromeBudgetNow()
                process.env.W_BIN_MIRROR = fdCase
                let mirrored = chromeBudgetNow()
                assert.ok(mirrored > plain, `mirror setting must enlarge the budget: ${mirrored} <= ${plain}`)
                assert.ok(mirrored < 2 ** 31 - 1, 'budget with a mirror must still fit the mocha timer limit')
                delete process.env.W_BIN_MIRROR
                assert.strict.equal(chromeBudgetNow(), plain)
            }
            finally {
                if (old === undefined) {
                    delete process.env.W_BIN_MIRROR
                }
                else {
                    process.env.W_BIN_MIRROR = old
                }
            }
        })

        //R19(c): 實際之CHROME_BUDGET_MS依w-html2png之清單(其套件根與公開入口所依者同一)與CHROME_ACQUIRE_OPT, 以清單物件形式(工具用清單路徑形式, 輸入形式不同; 函數、選項、套件根共用)核對; 清單含檔案組chrome
        it(`should size the hook timeout from the manifest of the package behind the public entry `, function() {
            let root = findPkgRoot('w-html2png')
            //公開入口之主檔位於<套件根>/dist/, 其上一層即其套件根(不深層匯入, R17)
            assert.strict.equal(root, path.resolve(path.dirname(requireFrom.resolve('w-html2png')), '..'), 'budget manifest root differs from the package root of the public entry')
            assert.strict.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name, 'w-html2png')
            let manifest = readManifest()
            assert.strict.equal(manifest.pkg, 'w-html2png')
            assert.ok(manifestChrome(manifest).downloads >= 1, 'bundle chrome has no download in the manifest')
            let one = fsEnsureBinsBudget(manifest, { ...CHROME_ACQUIRE_OPT, pkgRoot: root })
            assert.ok(one > 0, `single acquisition budget ${one}`)
            assert.strict.equal(CHROME_BUDGET_MS, CHROME_PARALLEL_FACTOR * one)
        })

        //R19(c): 傳給下載之每檔上限不短於wsemi之預設(以預算比較: 取得端之選項所得預算不小於未給任何選項者; 給了較短之totalMs即轉紅)
        it(`should not shorten the per-file download limit below the wsemi default `, function() {
            let base = { pkgRoot: '.', mirror: '', offline: false }
            let own = fsEnsureBinsBudget(SYNTH_MANIFEST, { ...base, ...CHROME_ACQUIRE_OPT })
            let dflt = fsEnsureBinsBudget(SYNTH_MANIFEST, base)
            assert.ok(own >= dflt, `acquire options give budget ${own} < default ${dflt}: a shorter totalMs was passed`)
            //比較器本身: 較短之totalMs確實使預算變小(否則上列比較無鑑別力)
            assert.ok(fsEnsureBinsBudget(SYNTH_MANIFEST, { ...base, totalMs: 1000 }) < dflt)
            //共用選項維持空物件: 預算函數對本清單只計totalMs(stallMs只計主幹模式, maxAttempts已含於totalMs), 比較器看不出stallMs、maxAttempts等其餘時間類選項被縮短;
            //須加鍵者先確認其對下載每檔上限之影響不短於wsemi預設, 並同步修改本斷言與帳本R19
            assert.deepStrictEqual({ ...CHROME_ACQUIRE_OPT }, {}, 'CHROME_ACQUIRE_OPT must stay empty so that the wsemi defaults govern the download limits')
        })

    })

    describe(`cross-process single download`, function() {

        //R19(a): 取得只經公開入口, 無seed: 共用工具不匯入或呼叫wsemi之fsEnsureBins(取得單位之預算函數fsEnsureBinsBudget除外), 恰一處呼叫WHtml2png.ensureBins(
        it(`should acquire only through the public entry without a seed step `, function() {
            let code = stripComments(fs.readFileSync(path.join(fdTest, 'tools', 'chromeExe.mjs'), 'utf8'))
            let seeds = code.split(/\r?\n/).filter((line) => /\bfsEnsureBins(?![A-Za-z0-9_])/.test(line))
            assert.deepStrictEqual(seeds, [], `chromeExe.mjs must not import or call fsEnsureBins (no seed): ${seeds.join(' | ')}`)
            let pubs = code.match(/WHtml2png\s*\.\s*ensureBins\s*\(/g) || []
            assert.strict.equal(pubs.length, 1, `chromeExe.mjs must call WHtml2png.ensureBins( exactly once, found ${pubs.length}`)
            //偵測器本身: 有匯入或呼叫fsEnsureBins之寫法被抓到, fsEnsureBinsBudget不被誤抓
            for (let s of ['import fsEnsureBins from \'wsemi/src/fsEnsureBins.mjs\'', 'await fsEnsureBins(a, b)', 'let seed = fsEnsureBins']) {
                assert.ok(/\bfsEnsureBins(?![A-Za-z0-9_])/.test(s), s)
            }
            assert.ok(!/\bfsEnsureBins(?![A-Za-z0-9_])/.test('import fsEnsureBinsBudget from \'wsemi/src/fsEnsureBinsBudget.mjs\''))
        })

        //R19(a)(d): ensureChromeBins把選項原樣交公開入口並回傳其結果(不先行取得、不加工)
        it(`should hand the options to the public entry as they are and return its result `, async function() {
            let log = []
            let o = { onTrace: 'T', onProgress: 'P' }
            let ret = { chrome: 'dir' }
            let r = await ensureChromeBins(o, {
                pub: async (x) => {
                    log.push({ call: 'pub', same: x === o })
                    return ret
                },
            })
            assert.strict.equal(r, ret)
            assert.deepStrictEqual(log, [{ call: 'pub', same: true }])
        })

        //R19(a): 預設之取得函數即真實公開入口WHtml2png.ensureBins(接縫不用替身之預設路徑): 暫以記錄用之函數取代該靜態屬性, 呼叫當下綁定, 收到的須是同一個選項物件
        it(`should call the real public entry by default with the very same options object `, async function() {
            let orig = WHtml2png.ensureBins
            let got = []
            let ret = { chrome: 'y' }
            let o = { onTrace: 'T', onProgress: 'P' }
            let r = null
            WHtml2png.ensureBins = async (x) => {
                got.push(x)
                return ret
            }
            try {
                r = await ensureChromeBins(o)
            }
            finally {
                WHtml2png.ensureBins = orig
            }
            assert.strict.equal(typeof orig, 'function')
            assert.strict.equal(WHtml2png.ensureBins, orig, 'the public entry must be restored')
            assert.strict.equal(r, ret)
            assert.strict.equal(got.length, 1)
            assert.strict.equal(got[0], o)
        })

        //取得失敗(如E_LOCK_TIMEOUT、下載失敗)原樣拋出, 不吞、不改走他途、不重試(其內部已依選項重試)
        it(`should pass the failure of the public entry through unchanged `, async function() {
            let n = 0
            let err = new Error('acquire failed')
            await assert.rejects(() => ensureChromeBins({}, {
                pub: async () => {
                    n++
                    throw err
                },
            }), (e) => e === err)
            assert.strict.equal(n, 1)
            //取得函數同步拋錯亦以拒絕之Promise回傳(不使呼叫端收到同步例外)
            let p = null
            assert.doesNotThrow(() => {
                p = ensureChromeBins({}, {
                    pub: () => {
                        throw err
                    },
                })
            })
            await assert.rejects(() => p, (e) => e === err)
        })

        //R19(d): 公開入口(w-html2png之main)內嵌之取得函式須帶跨程序鎖(含'lock-wait'): 其dist以不帶鎖之wsemi建置時, 升級本套件之wsemi不使其內部取得帶鎖, 平行取得各自下載而全套仍綠
        it(`should keep the cross-process lock in the code behind the public entry `, function() {
            let text = fs.readFileSync(requireFrom.resolve('w-html2png'), 'utf8')
            assert.ok(carriesLock(text), 'the main of w-html2png carries no cross-process lock (no lock-wait): rebuilt with an old wsemi, acquisitions would download once per process')
            //判定器本身: 無該事件者為否
            assert.strict.equal(carriesLock('emit({ type: \'download\' })'), false)
            assert.strict.equal(carriesLock(''), false)
            assert.strict.equal(carriesLock('emit({ type: \'lock-wait\' })'), true)
        })

        //預算函數fsEnsureBinsBudget自wsemi 1.9.76起提供; 已安裝版本與package.json之宣告皆不得低於之
        it(`should use wsemi with the budget function (>= 1.9.76) `, function() {
            let fpWsemi = requireFrom.resolve('wsemi/package.json')
            let installed = JSON.parse(fs.readFileSync(fpWsemi, 'utf8')).version
            assert.ok(geVer(installed, '1.9.76'), `installed wsemi ${installed} < 1.9.76`)
            let declared = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8')).dependencies.wsemi
            assert.ok(geVer(declared, '1.9.76'), `declared wsemi ${declared} < 1.9.76`)
            assert.strict.equal(typeof fsEnsureBinsBudget, 'function')
        })

    })

    describe(`concurrent acquisition`, function() {

        //並行之子行程數: 多於1即有等候者(需要跨程序鎖才只下載一次); 不求多(非負載試驗)
        const N_CHILD = 3
        let rs = []
        let hookTimeout = null

        //R19(b): 取得放在before且以預算為時限(子行程取得之等候與下載皆在此預算內); 非Windows無自帶chrome, 略過
        before(async function() {
            applyChromeBudget(this)
            hookTimeout = this.timeout()
            if (!isWindows()) {
                this.skip()
            }
            let fpChild = path.join(fdTest, 'tools', 'childAcquire.mjs')
            rs = await Promise.all(Array.from({ length: N_CHILD }, () => runNode([fpChild], { timeoutMs: CHROME_BUDGET_MS })))
        })

        //R19(d): 同時啟動之子行程經公開入口取得, 皆成功並得到完整檔案組(組內成員數同清單)
        it(`should give every concurrent process the complete file set through the public entry `, function() {
            let { members } = manifestChrome(readManifest())
            assert.ok(rs.length >= 2, `at least two concurrent processes are needed to have a waiter, got ${rs.length}`)
            assert.strict.equal(rs.length, N_CHILD)
            assert.strict.equal(hookTimeout, CHROME_BUDGET_MS, 'the hook that waits for the children must carry the download budget as its timeout')
            for (let x of rs) {
                assert.ok(x.result !== null && x.code === 0 && x.killed === false, `child did not finish cleanly: code=${x.code}, killed=${x.killed}, out=${String(x.out).slice(-300)}`)
                assert.strict.equal(x.result.err, null, `child failed: ${x.result.err}`)
                assert.strict.equal(x.result.nFiles, members)
            }
            assert.strict.equal(new Set(rs.map((x) => x.result.pid)).size, N_CHILD, 'children must be distinct processes')
        })

        //R19(d): 事件為證(onTrace/onProgress): 並行取得下載者至多一個行程、同一檔不重複、發布至多一次、無等候逾時/鎖未生效/取得失敗/未結束之取得; 快取為空時下載全部分割恰一次, 已備妥時無下載
        it(`should download at most once across the concurrent processes (judged from the events) `, function() {
            let { downloads } = manifestChrome(readManifest())
            let evs = rs.flatMap((x) => x.result.events)
            let r = judgeTrace(evs)
            assert.ok(r.mode !== 'none', 'no acquisition events were delivered by the public entry (onTrace not forwarded?)')
            assert.ok(r.ok, `events do not show a single download: ${JSON.stringify(r.reasons)}`)
            assert.ok(r.downloaders.length <= 1, `downloaded by ${r.downloaders.join(',')}`)
            assert.ok(r.nDownload === 0 || r.nDownload === downloads, `download events ${r.nDownload}, expected 0 (cache ready) or ${downloads} (one process)`)
            for (let x of rs) {
                let mine = x.result.events.filter((e) => e.type === 'settle')
                assert.ok(mine.length >= 1 && mine.every((e) => e.ok === true), `process ${x.result.pid}: acquisition did not settle ok`)
            }
        })

    })

    describe(`wiring of the test files`, function() {

        let names = listTestFiles()
        let chromeNames = names.filter((n) => usesChrome(fs.readFileSync(path.join(fdTest, n), 'utf8')))

        //站點全集之防呆: 取不到使用chrome之測試檔代表掃描範圍壞了, 後續逐點案為空洞
        it(`should find the test files that use chrome `, function() {
            assert.ok(names.length >= 8, `test files found: ${names.length}`)
            assert.ok(chromeNames.length >= 7, `chrome-using test files found: ${chromeNames.length}: ${chromeNames.join(', ')}`)
            for (let n of ['unit-WHc2png.test.mjs', 'unit-inject.test.mjs', 'api-WHc2pngServer.test.mjs', 'unit-publicEntry.test.mjs']) {
                assert.ok(chromeNames.includes(n), `${n} (implicit or explicit chrome user) not found by the scan`)
            }
            assert.ok(!chromeNames.includes('unit-buildScript.test.mjs'), 'unit-buildScript does not use chrome')
        })

        //R19(a)(b): 逐點接線: 每個使用chrome之測試檔自共用工具匯入, 並於before hook內以this呼叫(含未給executablePath而隱式取得者)
        for (let n of chromeNames) {
            it(`should acquire chrome in a before hook through the shared tool: ${n} `, function() {
                let text = stripComments(fs.readFileSync(path.join(fdTest, n), 'utf8')) //註解中之字樣不算
                assert.ok(/import\s*\{[^}]*\bgetChrome(Exe|Info)\b[^}]*\}\s*from\s*'\.\/tools\/chromeExe\.mjs'/.test(text), `${n}: no import of getChromeExe/getChromeInfo from ./tools/chromeExe.mjs`)
                let re = /await\s+getChrome(?:Exe|Info)\(this\)/g
                let ms = []
                for (let m = re.exec(text); m !== null; m = re.exec(text)) {
                    ms.push(m)
                }
                assert.ok(ms.length >= 1, `${n}: no \`await getChromeExe(this)\` / \`await getChromeInfo(this)\``)
                //每一處取得皆須在before hook內(不得有一處在it內)
                for (let m of ms) {
                    assert.ok(inBeforeHook(text, m.index), `${n}: chrome is acquired outside a before hook (acquire before any use, with the hook timeout)`)
                }
            })
        }

        //R19(a): 取得集中, 他測試檔與工具不得直接呼叫ensureBins/fsEnsureBins(共用工具自身之限制見「cross-process single download」)
        it(`should not call ensureBins outside the shared tool `, function() {
            let files = []
            for (let n of names) {
                files.push(path.join(fdTest, n))
            }
            for (let n of fs.readdirSync(path.join(fdTest, 'tools'))) {
                if (/\.mjs$/.test(n) && n !== 'chromeExe.mjs') {
                    files.push(path.join(fdTest, 'tools', n))
                }
            }
            let hits = []
            for (let fp of files) {
                fs.readFileSync(fp, 'utf8').split(/\r?\n/).forEach((line, i) => {
                    if (/WHtml2png\s*\.\s*ensureBins\s*\(|\bfsEnsureBins\s*\(/.test(line)) {
                        hits.push(`${path.relative(fdTest, fp)}:${i + 1}`)
                    }
                })
            }
            assert.deepStrictEqual(hits, [], `acquire only through test/tools/chromeExe.mjs: ${hits.join(', ')}`)
        })

        //接線判定器本身: 位於before內者為真, 位於it內、hook之前者為假
        it(`should tell a before hook from other places (checker self test) `, function() {
            let ok = 'describe(`a`, function() {\n  before(async function() {\n    await getChromeExe(this)\n  })\n  it(`x`, function() {})\n})'
            let inIt = 'describe(`a`, function() {\n  before(function() {})\n  it(`x`, async function() {\n    await getChromeExe(this)\n  })\n})'
            let none = 'describe(`a`, function() {\n  it(`x`, async function() {\n    await getChromeExe(this)\n  })\n})'
            assert.strict.equal(inBeforeHook(ok, ok.indexOf('await getChromeExe')), true)
            assert.strict.equal(inBeforeHook(inIt, inIt.indexOf('await getChromeExe')), false)
            assert.strict.equal(inBeforeHook(none, none.indexOf('await getChromeExe')), false)
            assert.strict.equal(usesChrome('let r = await WHc2png(1, 2, 3, {}, {})'), true)
            assert.strict.equal(usesChrome('let r = await WHtml2png(1, 2, 3)'), true)
            assert.strict.equal(usesChrome('import X from \'../src/WHc2png.mjs\''), true)
            assert.strict.equal(usesChrome('import { runDraw } from \'./tools/childDraw.mjs\''), true)
            assert.strict.equal(usesChrome('let x = 1'), false)
            assert.strict.equal(usesChrome('// WHc2png(1) is only a comment\nlet x = 1'), false)
            //it.only/it.skip/context/specify亦視為案例, 不是hook
            for (let w of ['it.only', 'it.skip', 'context', 'specify']) {
                let s = `describe(\`a\`, function() {\n  before(function() {})\n  ${w}(\`x\`, async function() {\n    await getChromeExe(this)\n  })\n})`
                assert.strict.equal(inBeforeHook(s, s.indexOf('await getChromeExe')), false, w)
            }
        })

        //註解不算程式碼: 僅在註解中出現之取得字樣不得使逐點接線案通過; 區塊與行尾註解皆去除, 字串中之冒號雙斜線(網址)不被當成註解
        it(`should not count a call that only appears in a comment (checker self test) `, function() {
            let code = stripComments('// await getChromeExe(this)\n/* await getChromeInfo(this) */\nlet u = \'https://x.y/z\'\nawait getChromeExe(this)\n')
            assert.strict.equal((code.match(/await\s+getChrome(?:Exe|Info)\(this\)/g) || []).length, 1)
            assert.ok(code.includes('https://x.y/z'))
        })

    })

    describe(`trace judgement`, function() {

        let dl = (pid, file) => ({ src: 'trace', pid, type: 'download', name: 'chrome', file })
        let ev = (pid, type, more = {}) => ({ src: 'trace', pid, type, ...more })

        //事件記錄: 環境變數給了路徑時, 取得時之onTrace/onProgress事件逐列寫入(含pid), 可被判讀
        it(`should record the ensureBins events as JSON lines when ${envKey} is set `, async function() {
            let fp = path.join(fdCase, 'sub', 'trace.jsonl')
            setEnv(fp)
            try {
                await acquireChrome(fakeCtx(), async (o) => {
                    assert.strict.equal(typeof o.onTrace, 'function')
                    assert.strict.equal(typeof o.onProgress, 'function')
                    o.onTrace(Object.freeze({ type: 'download', name: 'chrome', file: 'p1' }))
                    o.onTrace(Object.freeze({ type: 'lock-wait', name: 'chrome', phase: 'start', hit: null }))
                    o.onProgress({ pkg: 'x', step: 'wait', name: 'chrome', pid: null })
                    return {}
                })
            }
            finally {
                setEnv(envOld)
            }
            let evs = readTrace(fp)
            assert.deepStrictEqual(evs.map((e) => `${e.src}:${e.type || e.step}`), ['trace:download', 'trace:lock-wait', 'progress:wait'])
            assert.ok(evs.every((e) => e.pid === process.pid && Number.isFinite(e.t)))
            assert.strict.equal(evs[2].evPid, null) //事件自帶之pid(持有者PID)不蓋掉本行程之pid
            let r = judgeTrace(evs)
            assert.strict.equal(r.ok, true)
            assert.strict.equal(r.mode, 'cold')
            assert.deepStrictEqual(r.waiters, [process.pid])
            assert.strict.equal(r.progressWait, 1)
        })

        //R19(d): 一個行程下載全部分割(8個各一次), 他行程等候後讀快取 => 通過
        it(`should accept a single downloader with waiters that read the cache `, function() {
            let evs = []
            for (let i = 1; i <= 8; i++) {
                evs.push(dl(100, `part${i}`))
            }
            evs.push(ev(100, 'publish', { name: 'chrome', result: 'placed' }), ev(100, 'settle', { ok: true, code: null }))
            for (let pid of [200, 300]) {
                evs.push(ev(pid, 'lock-wait', { name: 'chrome', phase: 'start', hit: null }))
                evs.push(ev(pid, 'lock-wait', { name: 'chrome', phase: 'end', hit: true }))
                evs.push(ev(pid, 'cache', { name: 'chrome', hit: true }), ev(pid, 'settle', { ok: true, code: null }))
            }
            let r = judgeTrace(evs)
            assert.strict.equal(r.ok, true, JSON.stringify(r.reasons))
            assert.strict.equal(r.mode, 'cold')
            assert.deepStrictEqual(r.downloaders, [100])
            assert.strict.equal(r.nDownload, 8)
            assert.strict.equal(r.nPublish, 1)
            assert.deepStrictEqual(r.waiters, [200, 300])
            assert.strict.equal(r.nWaitEndHit, 2)
        })

        //R19(d): 兩個行程各自下載(無跨程序鎖時之現象) => 不通過
        it(`should reject downloads by two processes `, function() {
            let r = judgeTrace([dl(100, 'part1'), dl(200, 'part1'), dl(100, 'part2'), dl(200, 'part2')])
            assert.strict.equal(r.ok, false)
            assert.deepStrictEqual(r.downloaders, [100, 200])
            assert.ok(r.reasons.some((s) => /2 processes/.test(s)), JSON.stringify(r.reasons))
            assert.ok(r.reasons.some((s) => /more than once/.test(s)), JSON.stringify(r.reasons))
        })

        //R19(d): 同一行程重複下載同一分割、重複發布 => 不通過
        it(`should reject a repeated download of the same file and a repeated publish `, function() {
            let r = judgeTrace([dl(100, 'part1'), dl(100, 'part1'), ev(100, 'publish', { name: 'chrome', result: 'placed' }), ev(100, 'publish', { name: 'chrome', result: 'replaced' })])
            assert.strict.equal(r.ok, false)
            assert.ok(r.reasons.some((s) => /more than once/.test(s)), JSON.stringify(r.reasons))
            assert.ok(r.reasons.some((s) => /published 2 times/.test(s)), JSON.stringify(r.reasons))
        })

        //等候逾時、取得失敗 => 不通過; 他方已發布(exists)不算重複發布
        it(`should reject a lock-wait timeout and a failed acquisition, and not count an existing bundle as a publish `, function() {
            let r1 = judgeTrace([ev(100, 'lock-wait', { name: 'chrome', phase: 'start', hit: null }), ev(100, 'lock-wait', { name: 'chrome', phase: 'timeout', hit: null })])
            assert.strict.equal(r1.ok, false)
            assert.ok(r1.reasons.some((s) => /lock-wait timeout/.test(s)), JSON.stringify(r1.reasons))
            let r2 = judgeTrace([ev(100, 'settle', { ok: false, code: 'E_LOCK_TIMEOUT' })])
            assert.strict.equal(r2.ok, false)
            assert.ok(r2.reasons.some((s) => /E_LOCK_TIMEOUT/.test(s)), JSON.stringify(r2.reasons))
            let r3 = judgeTrace([dl(100, 'part1'), ev(100, 'publish', { name: 'chrome', result: 'placed' }), ev(200, 'publish', { name: 'chrome', result: 'exists' })])
            assert.strict.equal(r3.ok, true, JSON.stringify(r3.reasons))
            assert.strict.equal(r3.nPublish, 1)
        })

        //快取命中(無下載)為warm; 無任何事件為none且不算通過(無法判定); 無法解析之列拋錯
        it(`should tell warm from none and refuse an unparsable line `, function() {
            let warm = judgeTrace([ev(100, 'cache', { name: 'chrome', hit: true }), ev(100, 'settle', { ok: true, code: null })])
            assert.strict.equal(warm.ok, true)
            assert.strict.equal(warm.mode, 'warm')
            assert.strict.equal(warm.nDownload, 0)
            let none = judgeTrace([])
            assert.strict.equal(none.ok, false)
            assert.strict.equal(none.mode, 'none')
            assert.deepStrictEqual(parseTrace('{"a":1}\n\n{"b":2}\n'), [{ a: 1 }, { b: 2 }])
            assert.throws(() => parseTrace('{"a":1}\nnot json\n'))
        })

        //鎖未生效(lock-skip: 無法建立鎖而不加鎖照舊取得)與取得中被終止/懸置(登記多於整體結果之行程)皆不通過; 登記與結果相等者通過
        it(`should reject a lock-skip and an acquisition that never settled `, function() {
            let r1 = judgeTrace([ev(100, 'lock-skip', { name: 'chrome', why: 'fail' }), ev(100, 'settle', { ok: true, code: null })])
            assert.strict.equal(r1.ok, false)
            assert.strictEqual(r1.nLockSkip, 1)
            assert.ok(r1.reasons.some((s) => /lock-skip \(fail\)/.test(s)), JSON.stringify(r1.reasons))
            let r2 = judgeTrace([ev(100, 'job', { name: 'chrome', mode: 'new' }), ev(100, 'job', { name: 'chrome', mode: 'new' }), ev(100, 'settle', { ok: true, code: null }), ev(200, 'job', { name: 'chrome', mode: 'new' }), ev(200, 'settle', { ok: true, code: null })])
            assert.strict.equal(r2.ok, false)
            assert.deepStrictEqual(r2.unsettled, [100])
            assert.ok(r2.reasons.some((s) => /did not settle in pid 100/.test(s)), JSON.stringify(r2.reasons))
            let r3 = judgeTrace([ev(100, 'job', { name: 'chrome', mode: 'new' }), ev(100, 'settle', { ok: true, code: null }), ev(100, 'job', { name: 'chrome', mode: 'new' }), ev(100, 'settle', { ok: true, code: null })])
            assert.strict.equal(r3.ok, true, JSON.stringify(r3.reasons))
            assert.deepStrictEqual(r3.unsettled, [])
        })

        //CLI: 以子行程執行判讀工具, 離開碼0=ok、1=違反、2=無事件, 且皆有輸出(經目錄連結或大小寫不同之路徑啟動而被誤判為非主模組時, 會無輸出以0結束, 等於通過)
        it(`should print a verdict and exit with 0, 1 or 2 from the command line `, function() {
            let fpTool = path.join(fdTest, 'tools', 'chromeTrace.mjs')
            let write = (name, evs) => {
                let fp = path.join(fdCase, name)
                fs.writeFileSync(fp, evs.map((e) => JSON.stringify(e)).join('\n') + (evs.length > 0 ? '\n' : ''))
                return fp
            }
            let run = (fp) => spawnSync(process.execPath, [fpTool, fp], { encoding: 'utf8', windowsHide: true })
            let okEvs = [dl(100, 'part1'), ev(100, 'settle', { ok: true, code: null })]
            let r0 = run(write('cli-ok.jsonl', okEvs))
            assert.strict.equal(r0.status, 0, r0.stderr)
            assert.strict.equal(JSON.parse(r0.stdout).ok, true)
            let r1 = run(write('cli-bad.jsonl', [dl(100, 'part1'), dl(200, 'part2')]))
            assert.strict.equal(r1.status, 1, r1.stderr)
            assert.strict.equal(JSON.parse(r1.stdout).ok, false)
            let r2 = run(write('cli-none.jsonl', []))
            assert.strict.equal(r2.status, 2, r2.stderr)
            assert.strict.equal(JSON.parse(r2.stdout).mode, 'none')
            //以相對路徑啟動(文件載明之用法 node test/tools/chromeTrace.mjs <檔>, cwd為套件根)亦須有輸出
            let r3 = spawnSync(process.execPath, [path.join('test', 'tools', 'chromeTrace.mjs'), write('cli-ok2.jsonl', okEvs)], { cwd: path.resolve('.'), encoding: 'utf8', windowsHide: true })
            assert.strict.equal(r3.status, 0, r3.stderr)
            assert.ok(r3.stdout.includes('"ok": true'), `no verdict printed with a relative path: ${r3.stdout.slice(0, 200)}`)
        })

    })

})
