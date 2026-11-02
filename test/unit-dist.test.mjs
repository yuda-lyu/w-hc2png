import fs from 'fs'
import path from 'path'
import assert from 'assert'
import crypto from 'crypto'
import { builtinModules } from 'module'
import { fdRepo, isWindows, runNode } from './tools/child.mjs'
import { makeBuildCopy, runToolg } from './tools/buildCopy.mjs'
import { assertChartPng } from './tools/assertChart.mjs'
import { getChromeExe } from './tools/chromeExe.mjs'


//T-a: 依dspec〈自有套件之發布與建置腳本〉規則4, 把src、toolg、package.json複製到test/_tmp/unit-dist/build, 以cwd=副本執行toolg/gDistRollup.mjs建出dist,
//驗證可載入且可完成最小繪圖(帳本R1, R2, R3, R4, R5, R9); repo之dist/只於發布時重建, 本測試不讀也不改寫(僅比對建置前後之雜湊, 證明未被觸及)


let fdCase = path.resolve('./test/_tmp/unit-dist')
let fdBuild = path.join(fdCase, 'build')
let fdDist = path.join(fdBuild, 'dist')
let fpDist = path.join(fdDist, 'w-hc2png.umd.js')
let fpRepoDist = path.resolve('./dist/w-hc2png.umd.js')
let fpSrc = path.resolve('./src/WHc2png.mjs')
let fpChildDraw = path.resolve('./test/tools/childDraw.mjs')
let fpChildDual = path.resolve('./test/tools/childDual.mjs')
let pkg = JSON.parse(fs.readFileSync('./package.json', 'utf8'))


//R1: dist外部化之模組集合(Node內建fs、module與已宣告相依w-html2png); 增減外部模組須同步改本表與toolg/gDistRollup.mjs
let externals = ['fs', 'module', 'w-html2png']


let optA = {
    title: { text: 'Logarithmic axis demo' },
    xAxis: { tickInterval: 1, type: 'logarithmic' },
    yAxis: { type: 'logarithmic', minorTickInterval: 0.1 },
    series: [{ data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512], pointStart: 1 }],
}


//headerExternals, 取產物UMD頭三個分支之外部模組清單: CommonJS之require、AMD之define依賴、全域(瀏覽器)之globals名(UMD全域名w-hc2png)
function headerExternals(code) {
    let head = code.slice(0, 20000)
    let i0 = head.indexOf('module.exports=')
    let i1 = head.indexOf(':"function"==typeof define', i0)
    let i2 = head.indexOf('define([', i1)
    let i3 = head.indexOf('}(this,', i2)
    assert.ok(i0 >= 0 && i1 > i0 && i2 > i1 && i3 > i2, 'can not find umd header')
    let cjs = [...head.slice(i0, i1).matchAll(/require\("([^"]+)"\)/g)].map((m) => m[1])
    let amd = JSON.parse(head.slice(i2 + 'define('.length, head.indexOf(']', i2) + 1))
    let mg = head.slice(i2, i3).match(/\["w-hc2png"\]=\w+\(([^)]*)\)/)
    assert.ok(mg, 'can not find umd global branch')
    let globals = mg[1].split(',').map((v) => {
        let m = v.match(/^\w+\.(\w+)$/) || v.match(/^\w+\["([^"]+)"\]$/)
        assert.ok(m, `can not parse umd global[${v}]`)
        return m[1]
    })
    return { cjs, amd, globals }
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
    let hashRepoDistBefore = null

    before(async function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdCase, { recursive: true })

        //建置: 副本內以cwd=副本執行toolg/gDistRollup.mjs(其'./src'、'./dist'相對副本)
        hashRepoDistBefore = fs.existsSync(fpRepoDist) ? crypto.createHash('sha256').update(fs.readFileSync(fpRepoDist)).digest('hex') : null
        makeBuildCopy(fdBuild)
        build = await runToolg(fdBuild, 'gDistRollup')

        //exe, 明給w-html2png自帶chrome之執行檔(經公開入口ensureBins取得), 涵蓋whOpt.executablePath之傳遞
        exe = await getChromeExe()
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

    //R2: gDistRollup以runin:'nodejs'建置, 未列external之Node內建模組(如path)可解析, 無could-not-be-resolved
    //(src現僅用已列external之fs、module, 故另於副本之entry頂端加入path之import以使runin可被觀察)
    it(`should resolve unlisted Node builtins when building as nodejs `, async function() {
        let fd = makeBuildCopy(path.join(fdCase, 'build-runin'))
        let fpEntry = path.join(fd, 'src', 'WHc2png.mjs')
        fs.writeFileSync(fpEntry, `import nodePath from 'path'\nexport let probePathSep = nodePath.sep\n${fs.readFileSync(fpEntry, 'utf8')}`)
        let r = await runToolg(fd, 'gDistRollup')
        assert.strict.equal(r.code, 0, r.out.slice(-800))
        assert.ok(/require\("path"\)/.test(fs.readFileSync(path.join(fd, 'dist', 'w-hc2png.umd.js'), 'utf8').slice(0, 2000)), 'path is not required by the product')
        assert.strict.equal((r.out.match(/could not be resolved/g) || []).length, 0, r.out.slice(-800))
        assert.ok(!/invalid runin/.test(r.out), 'runin not given')
    })

    //R3: 副本內執行建置腳本不觸及repo之dist/(cwd=副本, './dist'落在副本)
    it(`should not touch repo dist when building in the copy `, async function() {
        let hashAfter = fs.existsSync(fpRepoDist) ? crypto.createHash('sha256').update(fs.readFileSync(fpRepoDist)).digest('hex') : null
        assert.strict.equal(hashAfter, hashRepoDistBefore)
    })

    //R1: UMD頭三個分支(require、AMD、全域)之外部模組皆 = externals(fs、module、w-html2png), 且 ⊆ Node內建 ∪ package.json之dependencies
    it(`should only require builtins and declared dependencies `, async function() {
        let { cjs, amd, globals } = headerExternals(fs.readFileSync(fpDist, 'utf8'))
        assert.deepStrictEqual([...cjs].sort(), [...externals].sort())
        assert.deepStrictEqual([...amd].sort(), [...externals].sort())
        assert.deepStrictEqual([...globals].sort(), [...externals].sort())
        let allowed = new Set([...builtinModules, ...Object.keys(pkg.dependencies)])
        for (let r of cjs) {
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
