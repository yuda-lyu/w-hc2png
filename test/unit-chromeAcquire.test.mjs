import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { createRequire } from 'module'
import { spawnSync } from 'child_process'
import {
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
    getChromeInfo,
    getChromeExe
} from './tools/chromeExe.mjs'
import { parseTrace, readTrace, judgeTrace } from './tools/chromeTrace.mjs'


//帳本R19: 測試取得w-html2png自帶chrome(約402MB)須集中、取得處時限對齊下載預算、跨程序只下載一次(平行時各檔不各自下載)
//  (a) 唯一取得點為test/tools/chromeExe.mjs, 其他測試檔與工具不得呼叫WHtml2png.ensureBins或fsEnsureBins
//  (b) 凡使用chrome之測試檔(含未給executablePath、出圖時隱式取得者)於before呼叫getChromeExe(this)或getChromeInfo(this), 先於任何使用
//  (c) 取得處之hook時限為CHROME_BUDGET_MS(自totalMs、下載次數、解壓批數推得), 不沿用--timeout 180000; 常數不低於w-html2png清單所需
//  (d) 跨程序只下載一次由wsemi之fsEnsureBins跨程序鎖保證, 以onTrace事件驗收(W_HC2PNG_CHROME_TRACE與test/tools/chromeTrace.mjs), 不以耗時判斷
//  (e) 不靠--require之全域前置, 不改scripts.test
//本檔不下載chrome: 取得以替身驗證接線(時限先於取得、傳入totalMs與事件回調), 真實取得由其他測試檔之before實跑(接縫不用替身)


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

//wsemi fsEnsureBins之ARGS_CAP(每批解壓之成員參數總長上限字元, 內部值); 其調整時由CHROME_EXTRACT_BATCHES之1批餘裕吸收, 超出則下方守門轉紅
const WSEMI_ARGS_CAP = 6000


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


//manifestNeeds, 依w-html2png之清單推算檔案組chrome於無鏡像時fsEnsureBins之下載次數與解壓批數(同wsemi lockBudget之計法)
function manifestNeeds(manifest, bundleName) {
    let b = manifest.bundles.find((v) => v.name === bundleName)
    assert.ok(b, `bundle ${bundleName} not found in manifest`)
    let downloads = (b.files || []).length //組內直接來源檔(自有檔或廠商網址)各下載1次
    let batches = 0
    for (let a of b.archives || []) {
        downloads += Array.isArray(a.parts) ? a.parts.length : 1
        let cur = 0
        let len = 0
        let n = 1
        for (let m of a.extract.files) {
            if (cur > 0 && len + m.path.length + 1 > WSEMI_ARGS_CAP) {
                n++
                cur = 0
                len = 0
            }
            cur++
            len += m.path.length + 1
        }
        batches += n
    }
    return { downloads, batches }
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

        //R19(c): 時限先於取得; 取得時明給totalMs(使預算之推算不隨wsemi預設值漂移); 結果原樣回傳
        it(`should set the timeout before acquiring and pass totalMs to ensureBins `, async function() {
            setEnv(undefined) //未啟用事件記錄: 不傳回調
            let log = []
            let ret = { chrome: 'x' }
            let r = null
            try {
                r = await acquireChrome(fakeCtx(log), async (o) => {
                    log.push({ call: 'ensure', totalMs: o.totalMs, onTrace: typeof o.onTrace, onProgress: typeof o.onProgress })
                    return ret
                })
            }
            finally {
                setEnv(envOld)
            }
            assert.strict.equal(r, ret)
            assert.deepStrictEqual(log, [
                { call: 'timeout', ms: CHROME_BUDGET_MS },
                { call: 'ensure', totalMs: CHROME_TOTAL_MS, onTrace: 'undefined', onProgress: 'undefined' },
            ])
        })

        //R19(c): 常數不低於w-html2png清單所需(清單改為更多分割或成員時轉紅, 提醒重估); 預算不低於wsemi跨程序鎖之持有/等候上限推算值
        it(`should not underestimate the downloads and extract batches of the w-html2png manifest `, function() {
            let fpManifest = path.join(findPkgRoot('w-html2png'), MANIFEST_REL)
            let need = manifestNeeds(JSON.parse(fs.readFileSync(fpManifest, 'utf8')), 'chrome')
            assert.ok(need.downloads >= 1 && need.batches >= 1, `manifest needs ${JSON.stringify(need)}`)
            assert.ok(CHROME_DOWNLOADS >= need.downloads, `CHROME_DOWNLOADS ${CHROME_DOWNLOADS} < manifest downloads ${need.downloads}`)
            assert.ok(CHROME_EXTRACT_BATCHES >= need.batches, `CHROME_EXTRACT_BATCHES ${CHROME_EXTRACT_BATCHES} < manifest batches ${need.batches}`)
            assert.ok(CHROME_BUDGET_MS >= chromeBudgetMs(CHROME_TOTAL_MS, need.downloads, need.batches), 'budget below the derived lock budget')
        })

        //R19(c): 預算公式之數值核對(同wsemi lockBudget: n×T + x×(T+5秒) + min(T, 60秒))
        it(`should derive the budget as downloads*T + batches*(T+5s) + min(T,60s) `, function() {
            assert.strict.equal(chromeBudgetMs(100000, 8, 2), 8 * 100000 + 2 * 105000 + 60000)
            assert.strict.equal(chromeBudgetMs(30000, 1, 1), 30000 + 35000 + 30000)
        })

    })

    describe(`cross-process single download`, function() {

        //R19(d): 先以本套件之wsemi(帶跨程序鎖)依w-html2png之清單取得(seed), 再經公開入口取得路徑; 順序、清單、套件根、選項之傳遞
        it(`should seed the cache with the lock before reading the paths through the public entry `, async function() {
            let log = []
            let r = await ensureChromeBins({ totalMs: 123, onTrace: 'T', onProgress: 'P' }, {
                seed: async (mf, o) => {
                    log.push({ call: 'seed', mf, pkgRoot: o.pkgRoot, totalMs: o.totalMs, onTrace: o.onTrace, onProgress: o.onProgress })
                },
                pub: async (o) => {
                    log.push({ call: 'pub', totalMs: o.totalMs })
                    return { chrome: 'dir' }
                },
                root: () => 'ROOT',
            })
            assert.deepStrictEqual(log, [
                { call: 'seed', mf: MANIFEST_REL, pkgRoot: 'ROOT', totalMs: 123, onTrace: 'T', onProgress: 'P' },
                { call: 'pub', totalMs: 123 },
            ])
            assert.deepStrictEqual(r, { chrome: 'dir' })
        })

        //seed失敗(如E_LOCK_TIMEOUT、下載失敗)即拋出, 不進入公開入口之取得(其內嵌之取得無鎖, 不得於seed失敗後自行下載)
        it(`should not go on to the public entry when the seed fails `, async function() {
            let called = 0
            let err = new Error('seed failed')
            await assert.rejects(() => ensureChromeBins({}, {
                seed: async () => {
                    throw err
                },
                pub: async () => {
                    called++
                    return {}
                },
                root: () => 'ROOT',
            }), (e) => e === err)
            assert.strict.equal(called, 0)
        })

        //seed之清單與套件根為w-html2png之實檔: 套件根之package.json名為w-html2png, 其清單存在且含檔案組chrome(與其預設快取位置相同, 故seed放入之快取即其公開入口所讀者)
        it(`should point the seed at the package root and manifest of w-html2png `, function() {
            let root = findPkgRoot('w-html2png')
            assert.strict.equal(JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name, 'w-html2png')
            let manifest = JSON.parse(fs.readFileSync(path.join(root, MANIFEST_REL), 'utf8'))
            assert.strict.equal(manifest.pkg, 'w-html2png')
            assert.ok(manifest.bundles.some((b) => b.name === 'chrome'), 'bundle chrome not found in the manifest')
        })

        //R19(d): 跨程序鎖來自wsemi 1.9.75之fsEnsureBins; 已安裝版本與package.json之宣告皆不得低於1.9.75, 且其原始碼含鎖(lock-wait事件)
        it(`should use wsemi with the cross-process lock (>= 1.9.75) `, function() {
            let fpWsemi = requireFrom.resolve('wsemi/package.json')
            let installed = JSON.parse(fs.readFileSync(fpWsemi, 'utf8')).version
            assert.ok(geVer(installed, '1.9.75'), `installed wsemi ${installed} < 1.9.75`)
            let declared = JSON.parse(fs.readFileSync(path.resolve('./package.json'), 'utf8')).dependencies.wsemi
            assert.ok(geVer(declared, '1.9.75'), `declared wsemi ${declared} < 1.9.75`)
            let src = fs.readFileSync(path.join(path.dirname(fpWsemi), 'src', 'fsEnsureBinsCore.mjs'), 'utf8')
            assert.ok(src.includes('lock-wait'), 'installed wsemi fsEnsureBins has no cross-process lock')
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

        //R19(a): 取得集中, 他測試檔與工具不得直接呼叫ensureBins/fsEnsureBins
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
