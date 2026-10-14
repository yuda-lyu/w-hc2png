import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { builtinModules } from 'module'
import { distConfig } from '../toolg/distConfig.mjs'
import { fdRepo, isWindows, runNode } from './tools/child.mjs'
import { assertChartPng } from './tools/assertChart.mjs'


//T-a: 以與發布同一份設定(toolg/distConfig.mjs)由現行src建出dist至test/_tmp, 驗證可載入且可完成最小繪圖(帳本R1, R2, R3, R4, R5, R9)
//repo之dist/只於發布時重建, 本測試不讀也不改寫repo之dist/


let fdCase = path.resolve('./test/_tmp/unit-dist')
let fdDist = path.join(fdCase, 'dist')
let fpDist = path.join(fdDist, 'w-hc2png.umd.js')
let fpSrc = path.resolve('./src/WHc2png.mjs')
let fpCli = path.resolve('./test/tools/distBuildCli.mjs')
let fpChildDraw = path.resolve('./test/tools/childDraw.mjs')
let fpChildDual = path.resolve('./test/tools/childDual.mjs')
let pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))


let optA = {
    title: { text: 'Logarithmic axis demo' },
    xAxis: { tickInterval: 1, type: 'logarithmic' },
    yAxis: { type: 'logarithmic', minorTickInterval: 0.1 },
    series: [{ data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512], pointStart: 1 }],
}


//headerRequires, 取產物UMD頭(CommonJS分支)之require清單
function headerRequires(code) {
    let head = code.slice(0, 20000)
    let i0 = head.indexOf('module.exports=')
    let i1 = head.indexOf(':"function"==typeof define', i0)
    assert.ok(i0 >= 0 && i1 > i0, 'can not find umd header')
    return [...head.slice(i0, i1).matchAll(/require\("([^"]+)"\)/g)].map((m) => m[1])
}


//draw, 以子行程(全新模組快取)載入並出圖
async function draw(via, fp, name, opt = {}) {
    let { cwd = fdRepo, exe = '', whOpt = {} } = opt
    let out = path.join(fdCase, `${name}.png`)
    let a = { via, fp, width: 500, height: 400, scale: 3, opt: optA, whOpt, out }
    let r = await runNode([fpChildDraw, JSON.stringify(a)], { cwd, env: exe ? { EXE: exe } : {} })
    assert.ok(r.result, `${name}: no RESULT, out=${r.out.slice(-500)}`)
    assert.strict.equal(r.result.load, 'ok', `${name}: load ${r.result.loadErr}`)
    assert.strict.equal(r.result.draw, 'ok', `${name}: draw ${r.result.drawErr}`)
    return fs.readFileSync(out)
}


describe(`unit-dist`, function() {

    let build = null
    let exe = ''

    before(async function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdCase, { recursive: true })

        //建置: 與toolg/gDistRollup.mjs同一建置函數與設定, 輸出限定test/_tmp
        build = await runNode([fpCli, './src', path.relative(fdRepo, fdDist)], { cwd: fdRepo })

        //exe, 他處cwd時須明給執行檔(w-html2png之預設chrome依cwd定位)
        if (isWindows()) {
            let { default: autoDownloadFiles } = await import('w-html2png/src/autoDownloadFiles.mjs')
            exe = (await autoDownloadFiles()).fpExe
        }
    })

    after(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R3: 建置成功以離開碼0結束; R2: 無could not be resolved與invalid runin
    it(`should build dist with exit code 0 and without unresolved-import warnings `, async function() {
        assert.strict.equal(build.code, 0, build.out.slice(-800))
        assert.ok(fs.existsSync(fpDist), 'dist not built')
        let nUnresolved = (build.out.match(/could not be resolved/g) || []).length
        assert.strict.equal(nUnresolved, 0, build.out.slice(-800))
        assert.ok(!/invalid runin/.test(build.out), 'runin not given')
    })

    //R1: UMD頭之外部模組 = distConfig.external(= globals之鍵), 且 ⊆ Node內建 ∪ package.json之dependencies
    it(`should only require builtins and declared dependencies `, async function() {
        let reqs = headerRequires(fs.readFileSync(fpDist, 'utf8'))
        assert.deepStrictEqual([...reqs].sort(), [...distConfig.external].sort())
        assert.deepStrictEqual([...distConfig.external].sort(), Object.keys(distConfig.globals).sort())
        let allowed = new Set([...builtinModules, ...Object.keys(pkg.dependencies)])
        for (let r of reqs) {
            assert.ok(allowed.has(r) || allowed.has(r.replace(/^node:/, '')), `external[${r}] is neither builtin nor dependency`)
        }
    })

    //R1, R9: 不內嵌w-html2png與playwright-core(sourcemap之來源檔)
    it(`should not bundle w-html2png, playwright-core or chromium-bidi `, async function() {
        let m = JSON.parse(fs.readFileSync(`${fpDist}.map`, 'utf8'))
        let bad = m.sources.filter((s) => /node_modules\/(w-html2png|playwright-core|chromium-bidi)\//.test(s))
        assert.deepStrictEqual(bad, [])
    })

    //R5: CommonJS之require與ESM之import皆可載入(不需Chrome, 全平台)
    it(`should load built dist via require and import `, async function() {
        for (let via of ['cjs', 'esm']) {
            let a = { via, fp: fpDist, loadOnly: true }
            let r = await runNode([fpChildDraw, JSON.stringify(a)], { cwd: fdRepo })
            assert.ok(r.result, r.out.slice(-500))
            assert.strict.equal(r.result.load, 'ok', `${via}: ${r.result.loadErr}`)
            assert.strict.equal(r.result.typeofExport, 'function')
            assert.strict.equal(r.result.typeofClose, 'function')
        }
    })

    //R5: dist出圖與src出圖在容差內(同一機器同一Chrome)
    it(`should draw with built dist the same as src within tolerance `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let bufSrc = await draw('esm', fpSrc, 'src-esm')
        assertChartPng(bufSrc, { width: 1500, height: 1200, name: 'unit-dist-src' })
        let bufCjs = await draw('cjs', fpDist, 'dist-cjs')
        assertChartPng(bufCjs, { width: 1500, height: 1200, baseline: bufSrc, name: 'unit-dist-cjs' })
        let bufEsm = await draw('esm', fpDist, 'dist-esm', { whOpt: { mode: 'alive' } })
        assertChartPng(bufEsm, { width: 1500, height: 1200, baseline: bufSrc, name: 'unit-dist-esm-alive' })
    })

    //R4: 工作目錄在他處(無node_modules)時, dist與src仍可載入出圖(highcharts以模組位置解析)
    it(`should load and draw when cwd has no node_modules `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let cwdx = path.join(fdCase, 'cwdx')
        fs.mkdirSync(cwdx, { recursive: true })
        let bufSrc = await draw('esm', fpSrc, 'cwdx-src', { cwd: cwdx, exe })
        assertChartPng(bufSrc, { width: 1500, height: 1200, name: 'unit-dist-cwdx-src' })
        let bufDist = await draw('cjs', fpDist, 'cwdx-dist', { cwd: cwdx, exe })
        assertChartPng(bufDist, { width: 1500, height: 1200, baseline: bufSrc, name: 'unit-dist-cwdx-dist' })
        assert.ok(!fs.existsSync(path.join(cwdx, 'chrome')), 'chrome downloaded into cwd')
    })

    //R9: 同行程main(dist)與src共用同一常駐瀏覽器, 任一端close後歸零, 行程自然結束
    it(`should share one alive browser between dist and src in the same process `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let a = { dist: fpDist, src: fpSrc }
        let r = await runNode([fpChildDual, JSON.stringify(a)], { cwd: fdRepo, env: { EXE: exe } })
        assert.ok(r.result, r.out.slice(-500))
        assert.ok(!r.result.err, r.result.err)
        assert.strict.equal(r.result.afterMainAlive, 1)
        assert.strict.equal(r.result.afterSrcAlive, 1)
        assert.strict.equal(r.result.afterSrcClose, 0)
        assert.strict.equal(r.killed, false, 'process did not exit naturally')
        assert.strict.equal(r.code, 0)
    })

})
