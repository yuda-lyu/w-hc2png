import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { fdRepo, isWindows, runNode } from './tools/child.mjs'
import { assertChartPng } from './tools/assertChart.mjs'


//T-b: highcharts以本模組所在位置解析且於首次呼叫時才讀(帳本R4, 裁示D-9)
//以cwd指向「node_modules/highcharts為不繪圖之替身」之資料夾: 若以cwd相對路徑讀檔, 將讀到替身而得空白圖


let fdCase = path.resolve('./test/_tmp/unit-hcResolve')
let fdDist = path.join(fdCase, 'dist')
let fpDist = path.join(fdDist, 'w-hc2png.umd.js')
let fdFake = path.join(fdCase, 'fakeRoot')
let fdEmpty = path.join(fdCase, 'emptyCwd')
let fpSrc = path.resolve('./src/WHc2png.mjs')
let fpCli = path.resolve('./test/tools/distBuildCli.mjs')
let fpChildDraw = path.resolve('./test/tools/childDraw.mjs')

let fpsHc = ['highcharts.js', 'highcharts-more.js', 'modules/stock.js', 'modules/annotations.js', 'modules/heatmap.js', 'modules/boost.js', 'modules/boost-canvas.js']

let optA = {
    title: { text: 'Logarithmic axis demo' },
    xAxis: { tickInterval: 1, type: 'logarithmic' },
    yAxis: { type: 'logarithmic', minorTickInterval: 0.1 },
    series: [{ data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512], pointStart: 1 }],
}


async function child(a, opt = {}) {
    let r = await runNode([fpChildDraw, JSON.stringify(a)], opt)
    assert.ok(r.result, r.out.slice(-500))
    return r.result
}


describe(`unit-hcResolve`, function() {

    let exe = ''
    let ref = null

    before(async function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdEmpty, { recursive: true })

        //替身highcharts: Highcharts.chart不繪圖
        let fdHc = path.join(fdFake, 'node_modules', 'highcharts')
        fs.mkdirSync(path.join(fdHc, 'modules'), { recursive: true })
        fs.writeFileSync(path.join(fdHc, 'package.json'), JSON.stringify({ name: 'highcharts', version: '0.0.0-fake', main: 'highcharts.js' }))
        for (let fp of fpsHc) {
            fs.writeFileSync(path.join(fdHc, fp), fp === 'highcharts.js' ? 'window.Highcharts = { chart: function () {} }\n' : '//fake\n')
        }

        //本檔自建dist(不依賴其他測試檔之產物)
        let b = await runNode([fpCli, './src', path.relative(fdRepo, fdDist)], { cwd: fdRepo })
        assert.strict.equal(b.code, 0, b.out.slice(-800))

        if (isWindows()) {
            let { default: autoDownloadFiles } = await import('w-html2png/src/autoDownloadFiles.mjs')
            exe = (await autoDownloadFiles()).fpExe
        }
    })

    after(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R4(S5'): 載入時不讀highcharts, 故cwd無node_modules時src與dist皆可載入(全平台)
    it(`should load src and dist when cwd has no node_modules `, async function() {
        let rs = await child({ via: 'esm', fp: fpSrc, loadOnly: true }, { cwd: fdEmpty })
        assert.strict.equal(rs.load, 'ok', rs.loadErr)
        let rd = await child({ via: 'cjs', fp: fpDist, loadOnly: true }, { cwd: fdEmpty })
        assert.strict.equal(rd.load, 'ok', rd.loadErr)
    })

    //R4: cwd下之他版(替身)highcharts不得被採用, src仍以本套件相依之highcharts正常出圖
    it(`should draw with own highcharts via src when cwd has another highcharts `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let outRef = path.join(fdCase, 'ref.png')
        let r0 = await child({ via: 'esm', fp: fpSrc, width: 500, height: 400, scale: 3, opt: optA, out: outRef }, { cwd: fdRepo })
        assert.strict.equal(r0.draw, 'ok', r0.drawErr)
        ref = fs.readFileSync(outRef)
        let out = path.join(fdCase, 'src-fake.png')
        let r = await child({ via: 'esm', fp: fpSrc, width: 500, height: 400, scale: 3, opt: optA, out }, { cwd: fdFake, env: { EXE: exe } })
        assert.strict.equal(r.load, 'ok', r.loadErr)
        assert.strict.equal(r.draw, 'ok', r.drawErr)
        assertChartPng(fs.readFileSync(out), { width: 1500, height: 1200, baseline: ref, name: 'unit-hcResolve-src' })
    })

    //R4: dist同上
    it(`should draw with own highcharts via dist when cwd has another highcharts `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        if (ref === null) {
            let outRef = path.join(fdCase, 'ref.png')
            let r0 = await child({ via: 'esm', fp: fpSrc, width: 500, height: 400, scale: 3, opt: optA, out: outRef }, { cwd: fdRepo })
            assert.strict.equal(r0.draw, 'ok', r0.drawErr)
            ref = fs.readFileSync(outRef)
        }
        let out = path.join(fdCase, 'dist-fake.png')
        let r = await child({ via: 'cjs', fp: fpDist, width: 500, height: 400, scale: 3, opt: optA, out }, { cwd: fdFake, env: { EXE: exe } })
        assert.strict.equal(r.load, 'ok', r.loadErr)
        assert.strict.equal(r.draw, 'ok', r.drawErr)
        assertChartPng(fs.readFileSync(out), { width: 1500, height: 1200, baseline: ref, name: 'unit-hcResolve-dist' })
    })

})
