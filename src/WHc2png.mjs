import fs from 'fs'
import path from 'path'
import set from 'lodash/set'
import isnum from 'wsemi/src/isnum.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import now2strp from 'wsemi/src/now2strp.mjs'
import genID from 'wsemi/src/genID.mjs'
import fsCopyFolder from 'wsemi/src/fsCopyFolder.mjs'
import puppeteer from 'puppeteer'


//自動複製chromium, node_modules/puppeteer/.local-chromium/win64-884014
fsCopyFolder('./node_modules/puppeteer/.local-chromium', './chromium')

//提供給網頁用的highcharts程式碼
let code_highcharts = fs.readFileSync('./node_modules/highcharts/highcharts.js', 'utf8')
let code_stock = fs.readFileSync('./node_modules/highcharts/modules/stock.js', 'utf8')
let code_heatmap = fs.readFileSync('./node_modules/highcharts/modules/heatmap.js', 'utf8')
let code_annotations = fs.readFileSync('./node_modules/highcharts/modules/annotations.js', 'utf8')
let code_boost = fs.readFileSync('./node_modules/highcharts/modules/boost.js', 'utf8')
let code_boost_canvas = fs.readFileSync('./node_modules/highcharts/modules/boost-canvas.js', 'utf8')

//wd
let wd = process.cwd()
console.log('process.cwd()', wd)


/**
 * 轉Highcharts設定檔(含數據)為png圖
 *
 * @class
 * @param {Number} [width=700] 輸入圖片原始寬度數字，單位px，預設700
 * @param {Number} [height=400] 輸入圖片原始高度數字，單位px，預設400
 * @param {Number} [scale=3] 輸入欲將圖片放大比例數字，單位px，預設3
 * @param {Object} [highchartsOptions={}] 輸入Highcharts設定物件，預設{}
 * @returns {Promise} 回傳Promise，resolve為回傳base64圖片，reject為錯誤訊息
 * @example
 *
 * async function test1() {
 *
 *     let st = {
 *         width: 500,
 *         height: 400,
 *         scale: 3,
 *         opt: {
 *
 *             title: {
 *                 text: 'Logarithmic axis demo'
 *             },
 *
 *             xAxis: {
 *                 tickInterval: 1,
 *                 type: 'logarithmic',
 *                 accessibility: {
 *                     rangeDescription: 'Range: 1 to 10'
 *                 }
 *             },
 *
 *             yAxis: {
 *                 type: 'logarithmic',
 *                 minorTickInterval: 0.1,
 *                 accessibility: {
 *                     rangeDescription: 'Range: 0.1 to 1000'
 *                 }
 *             },
 *
 *             tooltip: {
 *                 headerFormat: '<b>{series.name}</b><br />',
 *                 pointFormat: 'x = {point.x}, y = {point.y}'
 *             },
 *
 *             series: [{
 *                 data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
 *                 pointStart: 1
 *             }]
 *
 *         }
 *     }
 *     let b64 = await WHc2png(st.width, st.height, st.scale, st.opt)
 *     console.log('test1', b64)
 *
 *     // fs.writeFileSync('test1.b64',b64)
 *
 * }
 * test1()
 *
 */
async function WHc2png(width = 700, height = 400, scale = 3, highchartsOptions = {}) {
    // console.log('WHc2png', width, height, scale, highchartsOptions)

    //width
    if (!isnum(width)) {
        return Promise.reject('width is not number')
    }
    width = cdbl(width)
    if (width <= 0) {
        return Promise.reject('width <= 0')
    }

    //height
    if (!isnum(height)) {
        return Promise.reject('height is not number')
    }
    height = cdbl(height)
    if (height <= 0) {
        return Promise.reject('height <= 0')
    }

    //scale
    if (!isnum(scale)) {
        return Promise.reject('scale is not number')
    }
    scale = cdbl(scale)
    if (scale <= 0) {
        return Promise.reject('scale <= 0')
    }

    //highchartsOptions, 強制關閉動畫避免過慢顯示無法截到數據圖
    set(highchartsOptions, 'chart.animation', false)
    set(highchartsOptions, 'plotOptions.series.animation', false)
    // console.log('highchartsOptions', highchartsOptions)

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
    let executablePath = puppeteer.executablePath()
    let ss = executablePath.split('.local-chromium')
    let chromiumExecutablePath = path.resolve() + path.sep + 'chromium' + ss[1]
    // console.log('chromiumExecutablePath', chromiumExecutablePath)

    //cHighchartsOptions
    let cHighchartsOptions = JSON.stringify(highchartsOptions)
    // console.log('cHighchartsOptions', cHighchartsOptions)

    //html
    let g = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>highcharts to png</title>

  <script>{code_highcharts}</script>
  <script>{code_stock}</script>
  <script>{code_heatmap}</script>
  <script>{code_annotations}</script>
  <script>{code_boost}</script>
  <script>{code_boost_canvas}</script>

</head>
<body style="padding:0; margin:0;">

  <div id="hc" style="width:{width}px; height:{height}px;"></div>

  <script>
      
      let opt={opt}

      let chart = Highcharts.chart('hc', opt)

  </script>

</body>
</html>
`
    g = g.replace('{opt}', cHighchartsOptions)
    g = g.replace('{width}', width)
    g = g.replace('{height}', height)
    g = g.replace('{code_highcharts}', code_highcharts)
    g = g.replace('{code_stock}', code_stock)
    g = g.replace('{code_heatmap}', code_heatmap)
    g = g.replace('{code_annotations}', code_annotations)
    g = g.replace('{code_boost}', code_boost)
    g = g.replace('{code_boost_canvas}', code_boost_canvas)

    //writeFileSync
    fs.writeFileSync(fpHtml, g, 'utf8')

    //opt
    let opt = {
        executablePath: chromiumExecutablePath,
        headless: true,
        slowMo: 20,
    }

    //browser
    let browser = await puppeteer.launch(opt)

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