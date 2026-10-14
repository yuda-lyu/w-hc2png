import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'
import { decodePng, pixelAt } from './tools/png.mjs'
import { assertChartPng } from './tools/assertChart.mjs'
import { isWindows } from './tools/child.mjs'


//T-e: 物件opt之文字經JSON嵌入頁面時須逐字呈現(帳本R7, R8, 裁示D-10)
//頁內探針: load後檢查標題文字, 結果畫成左上角20x20色塊; 綠=符合, 藍=已知缺陷(w-html2png第29項)之特徵, 紅=其他失敗
//探針程式碼本身不含$與<(以String.fromCharCode組字), 以免被w-html2png之模板替換改寫


let GREEN = [0, 255, 0]
let BLUE = [0, 0, 255]


//codes, 字串轉char code陣列字串
function codes(s) {
    return [...s].map((c) => c.charCodeAt(0)).join(',')
}


//probeTitle, 檢查標題是否等於expect(null時只檢查標題存在); known為已知缺陷時之標題(可為null)
function probeTitle(expect, known = null) {
    return `
    window.addEventListener('load', function () {
        var t = document.querySelector('.highcharts-title')
        var c = 'rgb(255,0,0)'
        if (t) {
            ${expect === null ? `c = 'rgb(0,255,0)'` : `if (t.textContent === String.fromCharCode(${codes(expect)})) { c = 'rgb(0,255,0)' }`}
            ${known === null ? '' : `if (t.textContent === String.fromCharCode(${codes(known)})) { c = 'rgb(0,0,255)' }`}
        }
        var d = document.createElement('div')
        d.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px;z-index:99999;background:' + c
        document.body.appendChild(d)
    })
    `
}


//probeInjected, 檢查注入之highcharts程式碼是否被w-html2png模板替換改寫(annotations.js內之"\\$&"被換成"\\{cExecJsHead}")
function probeInjected() {
    return `
    window.addEventListener('load', function () {
        var bs = String.fromCharCode(92, 92)
        var bad = bs + '{cExec' + 'JsHead}'
        var good = bs + String.fromCharCode(36, 38)
        var hasBad = false
        var hasGood = false
        for (var i = 0; i < document.scripts.length; i++) {
            var tx = document.scripts[i].text
            if (tx.indexOf(bad) >= 0) { hasBad = true }
            if (tx.indexOf(good) >= 0) { hasGood = true }
        }
        var c = hasBad ? 'rgb(0,0,255)' : (hasGood ? 'rgb(0,255,0)' : 'rgb(255,0,0)')
        var d = document.createElement('div')
        d.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px;z-index:99999;background:' + c
        document.body.appendChild(d)
    })
    `
}


async function drawProbe(opt, probe) {
    let b64 = await WHc2png(400, 300, 1, opt, { execJsPost: probe })
    let buf = Buffer.from(b64, 'base64')
    assertChartPng(buf, { width: 400, height: 300, minNonWhite: 3000, name: 'unit-inject' })
    return pixelAt(decodePng(buf), 10, 10)
}


describe(`unit-inject`, function() {

    after(async function() {
        await WHc2png.close()
    })

    //R8: 物件opt之標題含替換字串之特殊樣式($&, $', $$, $`)時逐字呈現
    let cases = [
        { name: 'dollar-amp', text: 'A$&B', known: 'A{cExecJsPost}B' },
        { name: 'dollar-quote', text: 'it$\'s', known: null },
        { name: 'dollar-dollar', text: 'US$$9', known: 'US$9' },
        { name: 'dollar-backtick', text: 'x$`y', known: null },
    ]
    for (let k of cases) {
        it(`should render object-opt title literally: ${k.name} `, async function() {
            if (!isWindows()) {
                this.skip()
            }
            let px = await drawProbe({ title: { text: k.text }, series: [{ data: [1, 3, 2, 4] }] }, probeTitle(k.text))
            assert.deepStrictEqual(px, GREEN, `title not rendered literally, marker=${px}`)
        })
    }

    //R8: 物件opt之文字含</script>時不得使頁面腳本中斷(圖非空白且標題存在); Highcharts本身對標題之HTML處理不屬本套件
    for (let text of ['a</script>b', 'x</SCRIPT >y']) {
        it(`should render chart when object-opt text contains closing script tag: ${text} `, async function() {
            if (!isWindows()) {
                this.skip()
            }
            let px = await drawProbe({ title: { text }, series: [{ name: text, data: [1, 3, 2, 4] }] }, probeTitle(null))
            assert.deepStrictEqual(px, GREEN, `chart not rendered, marker=${px}`)
        })
    }

    //已知缺陷(w-html2png第29項: 模板以字串替換填值): 注入之highcharts程式碼不得被改寫; 偵測到缺陷特徵時標pending
    it(`should not corrupt injected highcharts code (KNOWN-DEFECT w-html2png#29) `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let px = await drawProbe({ title: { text: 'probe' }, series: [{ data: [1, 3, 2, 4] }] }, probeInjected())
        if (px[0] === BLUE[0] && px[1] === BLUE[1] && px[2] === BLUE[2]) {
            console.log('KNOWN-DEFECT(w-html2png#29): injected highcharts code corrupted by template string replacement')
            this.skip()
        }
        assert.deepStrictEqual(px, GREEN, `marker=${px}`)
    })

    //已知缺陷(w-html2png第29項): 字串opt為呼叫端之程式碼, 本套件不改寫; 其$樣式之文字待w-html2png修正, 偵測到缺陷特徵時標pending
    it(`should render string-opt title literally (KNOWN-DEFECT w-html2png#29) `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let cOpt = `let opt = { title: { text: 'A$&B' }, series: [{ data: [1, 3, 2, 4] }] }`
        let px = await drawProbe(cOpt, probeTitle('A$&B', 'A{cExecJsPost}B'))
        if (px[0] === BLUE[0] && px[1] === BLUE[1] && px[2] === BLUE[2]) {
            console.log('KNOWN-DEFECT(w-html2png#29): string-opt text with $& replaced by template placeholder')
            this.skip()
        }
        assert.deepStrictEqual(px, GREEN, `marker=${px}`)
    })

})
