import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'
import { assertChartPng } from './tools/assertChart.mjs'
import { isWindows } from './tools/child.mjs'
import { getChromeExe } from './tools/chromeExe.mjs'
import { makeTrace } from './tools/trace.mjs'


//帳本R18: whOpt整包轉傳至w-html2png, 其中whOpt.timeout(單次出圖/每次嘗試之允許時長, w-html2png 1.0.65起)與whOpt.onTrace(觀察回調)須到達w-html2png
//規格來源: Gitea #61第2節兩項驗證 + w-html2png之opt.timeout/opt.onTrace說明(README〈單次出圖之允許時長〉與JSDoc)
//  - 逾時: 該次嘗試失敗並依retry重試, 訊息開頭為`timeout[Nms] in <步驟>`
//  - 允許時長內完成不受影響; 未給timeout時不限時(attempt事件之timeout為null)
//以onTrace事件(attempt.timeout、timeout事件)證明「值確實到達w-html2png」, 不以耗時推斷; 只靠出圖結果無法分辨timeout是被轉傳還是被丟棄(timeout:60000時兩者皆回圖)


let opt = { title: { text: 'timeout' }, series: [{ data: [1, 3, 2, 4] }] }


//callWith, 執行一次WHc2png並回傳{ b64, err, tr }; err為reject值(未reject為null)
async function callWith(whOptBase) {
    let tr = makeTrace()
    let whOpt = { ...whOptBase, onTrace: tr.onTrace }
    let b64 = null
    let err = null
    try {
        b64 = await WHc2png(300, 200, 1, opt, whOpt)
    }
    catch (e) {
        err = e
    }
    return { b64, err, tr }
}


describe(`unit-whOptTimeout`, function() {

    before(async function() {
        //先取得自帶chrome(首次使用時下載, 計時不含此步驟), 使下列時限只量測出圖
        if (isWindows()) {
            await getChromeExe()
        }
    })

    after(async function() {
        //關閉常駐瀏覽器, 使測試結束後Node行程可立即退出
        await WHc2png.close()
    })

    //#61第2.1: { mode: 'alive', retry: 1, timeout: 1 }須reject, 訊息開頭為`timeout[1ms] in `
    it(`should reject with timeout[1ms] when whOpt.timeout is 1 in alive mode `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let { b64, err, tr } = await callWith({ mode: 'alive', retry: 1, timeout: 1 })
        assert.ok(err !== null, `expect reject but resolved with ${typeof b64}`)
        assert.match(String(err), /^timeout\[1ms\] in /)

        //w-html2png收到之timeout值即為1(一次嘗試、逾時事件之timeout為1)
        let attempts = tr.ofType('attempt')
        assert.strict.equal(attempts.length, 1, 'expect exactly 1 attempt event (retry: 1)')
        assert.strict.equal(attempts[0].timeout, 1)
        let tos = tr.ofType('timeout')
        assert.strict.equal(tos.length, 1, 'expect exactly 1 timeout event')
        assert.strict.equal(tos[0].timeout, 1)

        //逾時時瀏覽器尚在啟動, 等其啟動完成後於背景關閉之事件, 使本案不留殘留行程
        await tr.wait('browser-close')
    })

    //#61第2.1: single模式(WHc2png預設模式)同樣須轉傳; 逾時時瀏覽器尚在啟動, 等其啟動完成後於背景關閉之事件, 使本案不留殘留行程
    it(`should reject with timeout[1ms] when whOpt.timeout is 1 in single mode `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let { b64, err, tr } = await callWith({ mode: 'single', retry: 1, timeout: 1 })
        assert.ok(err !== null, `expect reject but resolved with ${typeof b64}`)
        assert.match(String(err), /^timeout\[1ms\] in /)
        assert.strict.equal(tr.ofType('attempt')[0].timeout, 1)
        assert.strict.equal(tr.ofType('timeout')[0].timeout, 1)
        await tr.wait('browser-close')
    })

    //#61第2.2: { mode: 'alive', retry: 1, timeout: 60000 }正常回圖, 且timeout值到達w-html2png(attempt事件之timeout為60000), 未逾時
    it(`should draw normally and pass timeout to w-html2png when whOpt.timeout is 60000 `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let { b64, err, tr } = await callWith({ mode: 'alive', retry: 1, timeout: 60000 })
        assert.ok(err === null, `expect resolve but rejected with ${String(err)}`)
        assertChartPng(Buffer.from(b64, 'base64'), { width: 300, height: 200, minNonWhite: 2000, name: 'unit-whOptTimeout-60000' })
        let attempts = tr.ofType('attempt')
        assert.strict.equal(attempts.length, 1, 'expect exactly 1 attempt event')
        assert.strict.equal(attempts[0].timeout, 60000)
        assert.strict.equal(tr.ofType('timeout').length, 0, 'unexpected timeout event')
    })

    //w-html2png之說明: 未給timeout時不限時(attempt事件之timeout為null), 流程同未支援前; WHc2png不得自行加入預設時限
    it(`should not limit drawing when whOpt.timeout is not given `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let { b64, err, tr } = await callWith({ mode: 'alive', retry: 1 })
        assert.ok(err === null, `expect resolve but rejected with ${String(err)}`)
        assertChartPng(Buffer.from(b64, 'base64'), { width: 300, height: 200, minNonWhite: 2000, name: 'unit-whOptTimeout-none' })
        let attempts = tr.ofType('attempt')
        assert.strict.equal(attempts.length, 1, 'expect exactly 1 attempt event')
        assert.strict.equal(attempts[0].timeout, null)
        assert.strict.equal(tr.ofType('timeout').length, 0, 'unexpected timeout event')
    })

})
