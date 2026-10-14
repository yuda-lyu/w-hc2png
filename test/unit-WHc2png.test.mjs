import fs from 'fs'
import WHc2png from '../src/WHc2png.mjs'
import { assertChartPng } from './tools/assertChart.mjs'


function isWindows() {
    return process.platform === 'win32'
}


async function testa(whOpt = {}) {

    let width = 500
    let height = 400
    let scale = 3
    let opt = {

        title: {
            text: 'Logarithmic axis demo'
        },

        xAxis: {
            tickInterval: 1,
            type: 'logarithmic',
            accessibility: {
                rangeDescription: 'Range: 1 to 10'
            }
        },

        yAxis: {
            type: 'logarithmic',
            minorTickInterval: 0.1,
            accessibility: {
                rangeDescription: 'Range: 0.1 to 1000'
            }
        },

        tooltip: {
            headerFormat: '<b>{series.name}</b><br />',
            pointFormat: 'x = {point.x}, y = {point.y}'
        },

        series: [{
            data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
            pointStart: 1
        }]

    }

    let ans = fs.readFileSync('./test/test-scla.b64', 'utf8')

    let ret = await WHc2png(width, height, scale, opt, whOpt)

    return {
        ans,
        ret,
    }
}


async function testb() {

    let width = 500
    let height = 400
    let scale = 3
    let cOpt = `
    let ds = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
    for (let i = 0; i < ds.length; i++) {
        ds[i] = Math.sin(ds[i]/360*Math.PI)
    }
    let opt = {

        title: {
            text: 'Logarithmic axis demo'
        },

        xAxis: {
            tickInterval: 1,
            type: 'logarithmic',
            accessibility: {
                rangeDescription: 'Range: 1 to 10'
            }
        },

        yAxis: {
            type: 'logarithmic',
            minorTickInterval: 0.1,
            accessibility: {
                rangeDescription: 'Range: 0.1 to 1000'
            }
        },

        tooltip: {
            headerFormat: '<b>{series.name}</b><br />',
            pointFormat: 'x = {point.x}, y = {point.y}'
        },

        series: [{
            data: ds,
            pointStart: 1
        }]

    }
    `
    let whOpt = {}

    let ans = fs.readFileSync('./test/test-sclb.b64', 'utf8')

    let ret = await WHc2png(width, height, scale, cOpt, whOpt)
    // console.log('test', b64)

    return {
        ans,
        ret,
    }
}


describe(`WHc2png`, function() {

    after(async function() {
        //關閉常駐瀏覽器, 使測試結束後Node行程可立即退出
        await WHc2png.close()
    })

    //R6: 出圖為PNG、尺寸=寬高×scale(500×400×3)、非空白, 並與基準圖(test/test-scla.b64)容差比對; 不重產基準圖(裁示D-8)
    //R10: 非Windows無法出圖(w-html2png限Windows), 以skip呈現而非恆過
    it(`should return png matching baseline within tolerance when run testa `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let t = await testa()
        assertChartPng(Buffer.from(t.ret, 'base64'), { width: 1500, height: 1200, baseline: Buffer.from(t.ans, 'base64'), name: 'unit-WHc2png-testa' })
    })

    it(`should return png matching baseline within tolerance when run testa with whOpt.mode='alive' `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let t = await testa({ mode: 'alive' })
        assertChartPng(Buffer.from(t.ret, 'base64'), { width: 1500, height: 1200, baseline: Buffer.from(t.ans, 'base64'), name: 'unit-WHc2png-testa-alive' })
    })

    //R6: 字串opt(iife程式碼)出圖, 與基準圖(test/test-sclb.b64)容差比對
    it(`should return png matching baseline within tolerance when run testb `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let t = await testb()
        assertChartPng(Buffer.from(t.ret, 'base64'), { width: 1500, height: 1200, baseline: Buffer.from(t.ans, 'base64'), name: 'unit-WHc2png-testb' })
    })

})
