import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import get from 'lodash/get'
import each from 'lodash/each'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import isbol from 'wsemi/src/isbol.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import now2strp from 'wsemi/src/now2strp.mjs'
import genID from 'wsemi/src/genID.mjs'
// import fsCopyFolder from 'wsemi/src/fsCopyFolder.mjs'


// //自動複製chromium, node_modules/puppeteer/.local-chromium/win64-884014
// fsCopyFolder('./node_modules/puppeteer/.local-chromium', './chromium')

//提供給網頁用的highcharts程式碼
let code_highcharts = fs.readFileSync('./node_modules/highcharts/highcharts.js', 'utf8')
let code_stock = fs.readFileSync('./node_modules/highcharts/modules/stock.js', 'utf8')
let code_heatmap = fs.readFileSync('./node_modules/highcharts/modules/heatmap.js', 'utf8')
let code_annotations = fs.readFileSync('./node_modules/highcharts/modules/annotations.js', 'utf8')
let code_boost = fs.readFileSync('./node_modules/highcharts/modules/boost.js', 'utf8')
let code_boost_canvas = fs.readFileSync('./node_modules/highcharts/modules/boost-canvas.js', 'utf8')

//wd
let wd = process.cwd()
// console.log('process.cwd()', wd)


/**
 * 轉Highcharts設定檔(含數據)為png圖
 *
 * @class
 * @param {Number} [width=700] 輸入圖片原始寬度數字，單位px，預設700
 * @param {Number} [height=400] 輸入圖片原始高度數字，單位px，預設400
 * @param {Number} [scale=3] 輸入欲將圖片放大比例數字，單位px，預設3
 * @param {Object|String} [opt={}] 輸入Highcharts設定物件或字串，可給予iife執行程式碼直接回傳Highcharts設定物件，預設{}
 * @param {Object} [whOpt={}] 輸入設定物件，預設{}
 * @param {Array} [whOpt.addScripts=[]] 輸入引用js程式碼網址陣列，預設[]
 * @param {String} [whOpt.addCode=''] 輸入插用js程式碼字串，可提供編譯後函數例如getOpt之iife或umd等格式程式碼，預設''
 * @returns {Promise} 回傳Promise，resolve為回傳base64圖片，reject為錯誤訊息
 * @example
 *
 * import fs from 'fs'
 * import WHc2png from './src/WHc2png.mjs'
 *
 *
 * function genPlotHtml(fp, b64) {
 *     let h = `
 * <html>
 *     <head></head>
 *     <body>
 *         <img style="border:1px dashed #ddd;" src="data:image/png;base64, {b64}">
 *     </body>
 * </html>
 *     `
 *     h = h.replace('{b64}', b64)
 *     fs.writeFileSync(fp, h, 'utf8')
 * }
 *
 *
 * async function test() {
 *
 *     let width = 500
 *     let height = 400
 *     let scale = 3
 *     let opt = {
 *
 *         title: {
 *             text: 'Logarithmic axis demo'
 *         },
 *
 *         xAxis: {
 *             tickInterval: 1,
 *             type: 'logarithmic',
 *             accessibility: {
 *                 rangeDescription: 'Range: 1 to 10'
 *             }
 *         },
 *
 *         yAxis: {
 *             type: 'logarithmic',
 *             minorTickInterval: 0.1,
 *             accessibility: {
 *                 rangeDescription: 'Range: 0.1 to 1000'
 *             }
 *         },
 *
 *         tooltip: {
 *             headerFormat: '<b>{series.name}</b><br />',
 *             pointFormat: 'x = {point.x}, y = {point.y}'
 *         },
 *
 *         series: [{
 *             data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
 *             pointStart: 1
 *         }]
 *
 *     }
 *     let b64 = await WHc2png(width, height, scale, opt)
 *     // console.log('test', b64)
 *
 *     // fs.writeFileSync('./test.b64', b64)
 *     genPlotHtml('./test-scla.html', b64)
 *
 *     console.log('finish')
 * }
 * test()
 *
 */
async function WHc2png(width = 700, height = 400, scale = 3, opt = {}, whOpt = {}) {
    // console.log('WHc2png', width, height, scale, opt)

    //width
    if (!isnum(width)) {
        return Promise.reject('width is not a number')
    }
    width = cdbl(width)
    if (width <= 0) {
        return Promise.reject('width <= 0')
    }

    //height
    if (!isnum(height)) {
        return Promise.reject('height is not a number')
    }
    height = cdbl(height)
    if (height <= 0) {
        return Promise.reject('height <= 0')
    }

    //scale
    if (!isnum(scale)) {
        return Promise.reject('scale is not a number')
    }
    scale = cdbl(scale)
    if (scale <= 0) {
        return Promise.reject('scale <= 0')
    }

    //opt
    if (!iseobj(opt) && !isestr(opt)) {
        return Promise.reject('opt is not an effective object or string')
    }

    //addScripts
    let addScripts = get(whOpt, 'addScripts')
    if (!isearr(addScripts)) {
        addScripts = []
    }

    //caddCode
    let caddCode = get(whOpt, 'addCode')
    if (!isearr(caddCode)) {
        caddCode = ''
    }

    //useWindowOpt
    let useWindowOpt = get(whOpt, 'useWindowOpt')
    if (!isbol(useWindowOpt)) {
        useWindowOpt = false
    }

    //cLetOptStart, cLetOptEnd
    let cLetOptStart = 'let _opt='
    let cLetOptEnd = ''
    if (useWindowOpt) {
        cLetOptStart = ''
        cLetOptEnd = 'let _opt=window.opt;'
    }

    //cOpt
    let cOpt = opt
    if (iseobj(opt)) {
        cOpt = JSON.stringify(opt)
    }
    // console.log('cOpt', cOpt)

    //fnOut
    let fnOut = `./whpic-${now2strp()}-${genID()}.png` //一定要給副檔名, 否則puppeteer的screenshot會無法識別格式

    //fpOut
    let fpOut = path.resolve(wd, fnOut)
    // console.log('fpOut', fpOut)

    //fnHtml
    let fnHtml = `./whweb-${now2strp()}-${genID()}.html`

    //fpHtml
    let fpHtml = path.resolve(wd, fnHtml)
    // console.log('fpHtml', fpHtml)

    //chromiumExecutablePath
    // let executablePath = puppeteer.executablePath()
    // console.log('executablePath', executablePath)
    // let ss = executablePath.split('.local-chromium')
    // let chromiumExecutablePath = path.resolve() + path.sep + 'chromium' + ss[1]
    // let chromiumExecutablePath = puppeteer.executablePath()
    // console.log('chromiumExecutablePath', chromiumExecutablePath)

    //cAddScripts
    let cAddScripts = ''
    each(addScripts, (v) => {
        let c = `<script src="${v}"></script>`
        cAddScripts += c
    })

    //html
    let g = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>highcharts to png</title>

  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>

  <script>{code_highcharts}</script>
  <script>{code_stock}</script>
  <script>{code_heatmap}</script>
  <script>{code_annotations}</script>
  <script>{code_boost}</script>
  <script>{code_boost_canvas}</script>

  {add_scripts}

  <script>{add_code}</script>

</head>
<body style="padding:0; margin:0;">

    <div id="hc" style="width:{width}px; height:{height}px;"></div>

    <script>

        {cLetOptStart}{cOpt}
        {cLetOptEnd}

        //opt若為物件時, 強制關閉動畫避免過慢顯示無法截到數據圖
        _.set(_opt, 'chart.animation', false)
        _.set(_opt, 'plotOptions.series.animation', false)
        // console.log('_opt', _opt)
    
        Highcharts.chart('hc', _opt)

    </script>

</body>
</html>
`

    //客製化程式得先取代, 避免取代到外部引入程式碼
    g = g.replace('{width}', width)
    g = g.replace('{height}', height)
    g = g.replace('{cLetOptStart}', cLetOptStart)
    g = g.replace('{cLetOptEnd}', cLetOptEnd)
    g = g.replace('{cOpt}', cOpt)

    //引入外部程式碼
    g = g.replace('{code_highcharts}', code_highcharts)
    g = g.replace('{code_stock}', code_stock)
    g = g.replace('{code_heatmap}', code_heatmap)
    g = g.replace('{code_annotations}', code_annotations)
    g = g.replace('{code_boost}', code_boost)
    g = g.replace('{code_boost_canvas}', code_boost_canvas)
    g = g.replace('{add_scripts}', cAddScripts)
    g = g.replace('{add_code}', caddCode)

    //writeFileSync
    fs.writeFileSync(fpHtml, g, 'utf8')

    //puppeteerOpt
    let puppeteerOpt = {
        // executablePath: chromiumExecutablePath,
        headless: true,
        slowMo: 20,
    }

    //browser
    let browser = await puppeteer.launch(puppeteerOpt)

    //page
    let page = await browser.newPage()

    //viewport
    let viewport = {
        x: 0,
        y: 0,
        width: Number(width),
        height: Number(height),
        deviceScaleFactor: Number(scale),
    }
    //console.log('viewport',viewport)

    //show page
    await page.goto(fpHtml)
    await page.setViewport(viewport)

    // //delay 3s for highchart rendered
    // await page.waitFor(3000)

    //screenshot
    await page.screenshot({ path: fpOut }) //fullPage: true

    //close
    // await page.close()
    await browser.close()

    //delete
    fs.unlinkSync(fpHtml)

    //read
    let b64 = fs.readFileSync(fpOut, { encoding: 'base64' })

    //delete
    fs.unlinkSync(fpOut)

    return b64
}


export default WHc2png
