import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'
import { decodePng, pixelAt } from './tools/png.mjs'
import { assertChartPng } from './tools/assertChart.mjs'
import { isWindows } from './tools/child.mjs'


//T-e: 物件opt之文字經JSON嵌入頁面時須逐字呈現(帳本R7, R8, 裁示D-10)
//頁內探針: load後檢查標題文字, 結果畫成左上角20x20色塊; 綠=符合, 其他色=失敗
//探針程式碼本身不含$與<(以String.fromCharCode組字), 使探針與模板填值方式無關


let GREEN = [0, 255, 0]


//codes, 字串轉char code陣列字串
function codes(s) {
    return [...s].map((c) => c.charCodeAt(0)).join(',')
}


//probeTitle, 檢查標題是否等於expect(null時只檢查標題存在)
function probeTitle(expect) {
    return `
    window.addEventListener('load', function () {
        var t = document.querySelector('.highcharts-title')
        var c = 'rgb(255,0,0)'
        if (t) {
            ${expect === null ? `c = 'rgb(0,255,0)'` : `if (t.textContent === String.fromCharCode(${codes(expect)})) { c = 'rgb(0,255,0)' }`}
        }
        var d = document.createElement('div')
        d.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px;z-index:99999;background:' + c
        document.body.appendChild(d)
    })
    `
}


//probeInjected, 檢查注入之highcharts程式碼是否被模板填值改寫(annotations.js內之"\\$&"曾被換成"\\{cExecJsHead}"); 藍=被改寫, 綠=原樣
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
        { name: 'dollar-amp', text: 'A$&B' },
        { name: 'dollar-quote', text: 'it$\'s' },
        { name: 'dollar-dollar', text: 'US$$9' },
        { name: 'dollar-backtick', text: 'x$`y' },
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

    //R8: 注入之highcharts程式碼不得被模板填值改寫(w-html2png>=1.0.54逐字填值)
    it(`should not corrupt injected highcharts code `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let px = await drawProbe({ title: { text: 'probe' }, series: [{ data: [1, 3, 2, 4] }] }, probeInjected())
        assert.deepStrictEqual(px, GREEN, `marker=${px}`)
    })

    //R8: 字串opt為呼叫端之程式碼, 本套件不改寫; 其中$樣式之文字須逐字呈現
    it(`should render string-opt title literally `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let cOpt = `let opt = { title: { text: 'A$&B' }, series: [{ data: [1, 3, 2, 4] }] }`
        let px = await drawProbe(cOpt, probeTitle('A$&B'))
        assert.deepStrictEqual(px, GREEN, `marker=${px}`)
    })

})
