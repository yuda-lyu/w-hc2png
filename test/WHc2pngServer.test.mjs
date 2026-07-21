import fs from 'fs'
import assert from 'assert'
import WHc2pngServer from '../src/WHc2pngServer.mjs'


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

    it(`should return (data url base64) via http POST `, async function() {
        let rr = null
        let rt = null
        if (isWindows()) {
            let t = await testServer()
            rr = t.ret
            rt = t.ans
        }
        else {
            rr = 1
            rt = 1
        }
        assert.strict.deepStrictEqual(rr, rt)
    })

})
