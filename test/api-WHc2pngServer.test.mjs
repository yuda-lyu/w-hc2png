import fs from 'fs'
import assert from 'assert'
import WHc2pngServer from '../src/WHc2pngServer.mjs'
import { assertChartPng } from './tools/assertChart.mjs'


function isWindows() {
    return process.platform === 'win32'
}


let port = 9021
let apiName = 'api'


async function testServer() {

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

    //POST至api, 服務內部走alive模式繪圖並回傳data url字串
    let resp = await fetch(`http://localhost:${port}/${apiName}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ width, height, scale, opt }),
    })
    let j = await resp.json()

    //回應須為data url(錯誤時為{err})
    assert.ok(typeof j.b64 === 'string' && j.b64.startsWith('data:image/png;base64, '), `response has no b64: ${JSON.stringify(j).slice(0, 300)}`)

    //剝除data url前綴取回裸base64, 與baseline比對
    let ret = j.b64.replace('data:image/png;base64, ', '')

    return {
        ans,
        ret,
    }
}


describe(`WHc2pngServer`, function() {

    let server = null

    before(async function() {
        if (isWindows()) {
            server = await WHc2pngServer({ port, apiName })
        }
    })

    after(async function() {
        //關閉服務, 觸發onPreStop關閉alive模式之常駐瀏覽器, 使測試結束後Node行程可立即退出
        if (server !== null) {
            await server.stop()
        }
    })

    //R6: 經http POST出圖, 回應之data url為PNG、尺寸=寬高×scale、非空白, 並與基準圖容差比對; 不重產基準圖(裁示D-8)
    //R10: 非Windows以skip呈現
    it(`should return (data url png) matching baseline within tolerance via http POST `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let t = await testServer()
        assertChartPng(Buffer.from(t.ret, 'base64'), { width: 1500, height: 1200, baseline: Buffer.from(t.ans, 'base64'), name: 'api-WHc2pngServer' })
    })

})
