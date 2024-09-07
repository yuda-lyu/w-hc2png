import fs from 'fs'
import path from 'path'
import puppeteer from 'puppeteer'
import get from 'lodash-es/get.js'
import each from 'lodash-es/each.js'
import find from 'lodash-es/find.js'
import isnum from 'wsemi/src/isnum.mjs'
import isearr from 'wsemi/src/isearr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import now2strp from 'wsemi/src/now2strp.mjs'
import genID from 'wsemi/src/genID.mjs'
import fsTreeFolder from 'wsemi/src/fsTreeFolder.mjs'
import fsIsFile from 'wsemi/src/fsIsFile.mjs'
// import fsCopyFolder from 'wsemi/src/fsCopyFolder.mjs'


//已不須自動複製chromium, node_modules/puppeteer/.local-chromium/win64-884014


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
 * 呼叫Chromium轉轉Highcharts設定檔(含數據)為png圖
 *
 * @class
 * @param {Number} [width=700] 輸入圖片原始寬度數字，單位px，預設700
 * @param {Number} [height=400] 輸入圖片原始高度數字，單位px，預設400
 * @param {Number} [scale=3] 輸入欲將圖片放大比例數字，單位px，預設3
 * @param {Object|String} [opt={}] 輸入Highcharts設定物件或字串，可給予iife執行程式碼直接回傳Highcharts設定物件，預設{}
 * @param {Object} [whOpt={}] 輸入設定物件，預設{}
 * @param {Array} [whOpt.addScripts=[]] 輸入引用js程式碼網址陣列，預設[]
 * @param {String} [whOpt.addCode=''] 輸入插用js程式碼字串，可提供編譯後函數例如getOpt之iife或umd等格式程式碼，預設''
 * @param {String} [whOpt.executablePath=''] 輸入puppeteer的executablePath字串，預設''
 * @param {String} [whOpt.executableFolder=''] 輸入不提供executablePath時則提供搜索chrome.exe所在資料夾字串，找到後將自動給予puppeteer的executablePath，預設''
 * @returns {Promise} 回傳Promise，resolve為回傳base64圖片，reject為錯誤訊息
 * @example
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
 * async function testa() {
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
 *
 *     let b64 = await WHc2png(width, height, scale, opt)
 *     // console.log('b64', b64)
 *
 *     fs.writeFileSync('./test-scla.b64', b64)
 *     genPlotHtml('./test-scla.html', b64)
 *
 *     console.log('finish')
 * }
 * testa()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 * async function testb() {
 *
 *     let width = 500
 *     let height = 400
 *     let scale = 3
 *     let cOpt = `
 *     let ds = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
 *     for (let i = 0; i < ds.length; i++) {
 *         ds[i] = Math.sin(ds[i]/360*Math.PI)
 *     }
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
 *             data: ds,
 *             pointStart: 1
 *         }]
 *
 *     }
 *     `
 *     let whOpt = {}
 *
 *     let b64 = await WHc2png(width, height, scale, cOpt, whOpt)
 *     // console.log('b64', b64)
 *
 *     fs.writeFileSync('./test-sclb.b64', b64)
 *     genPlotHtml('./test-sclb.html', b64)
 *
 *     console.log('finish')
 * }
 * testb()
 *     .catch((err) => {
 *         console.log(err)
 *     })
 *
 */
async function WHc2png(width = 700, height = 400, scale = 3, opt = {}, whOpt = {}) {
    // console.log('WHc2png', width, height, scale, opt, whOpt)

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

    //executablePath
    let executablePath = get(whOpt, 'executablePath', '')
    //若不給則由puppeteer偵測取得或給executableFolder搜尋取得

    //executableFolder
    let executableFolder = get(whOpt, 'executableFolder', '')
    if (isestr(executableFolder) && !isestr(executablePath)) {
        //executablePath='C:\\Users\\user\\.cache\\puppeteer\\chrome\\win64-116.0.5845.96\\chrome-win64\\chrome.exe'
        //executableFolder='C:\\Users\\user\\.cache\\puppeteer'
        let fps = fsTreeFolder(executableFolder, null)
        let r = find(fps, (v) => {
            return v.name === 'chrome.exe'
        })
        // console.log('r', r)
        if (iseobj(r)) {
            executablePath = r.path
        }
        else {
            throw new Error(`can not find chrome.exe in executableFolder[${executableFolder}]`)
        }
    }

    //cOpt
    let cOpt = ''
    if (isestr(opt)) {
        cOpt = opt //外部給予opt字串時須自行給予let opt=ooo
    }
    else {
        let j = JSON.stringify(opt)
        cOpt = `let opt=${j};`
    }

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

        {cOpt}

        if(_.isObject(opt)){

            //強制關閉動畫避免過慢顯示無法截到數據圖
            _.set(opt, 'chart.animation', false)
            _.set(opt, 'plotOptions.series.animation', false)
            // console.log('opt', opt)
        
            //plot
            Highcharts.chart('hc', opt)

        }
        else{
            console.log('invalid opt')
        }

    </script>

</body>
</html>
`

    //客製化程式得先取代, 避免取代到外部引入程式碼
    g = g.replace('{width}', width)
    g = g.replace('{height}', height)
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

    //b64
    let b64 = ''
    let core = async () => {

        //puppeteerOpt
        let puppeteerOpt = {
            headless: 'new', //true,
            slowMo: 20,
        }
        if (isestr(executablePath)) {
            puppeteerOpt.executablePath = executablePath
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

        //readFileSync
        b64 = fs.readFileSync(fpOut, { encoding: 'base64' })

    }
    await core()
        .catch((err) => {
            console.log(err)
        })

    //delete
    if (fsIsFile(fpHtml)) {
        fs.unlinkSync(fpHtml)
    }

    //delete
    if (fsIsFile(fpOut)) {
        fs.unlinkSync(fpOut)
    }

    return b64
}


export default WHc2png
