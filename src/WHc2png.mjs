import fs from 'fs'
import get from 'lodash-es/get.js'
import isnum from 'wsemi/src/isnum.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import cdbl from 'wsemi/src/cdbl.mjs'
import WHtml2png from 'w-html2png/src/WHtml2png.mjs'


//提供給網頁用的highcharts程式碼
let code_highcharts = fs.readFileSync('./node_modules/highcharts/highcharts.js', 'utf8')
let code_highcharts_more = fs.readFileSync('./node_modules/highcharts/highcharts-more.js', 'utf8')
let code_stock = fs.readFileSync('./node_modules/highcharts/modules/stock.js', 'utf8')
let code_annotations = fs.readFileSync('./node_modules/highcharts/modules/annotations.js', 'utf8')
let code_heatmap = fs.readFileSync('./node_modules/highcharts/modules/heatmap.js', 'utf8')
let code_boost = fs.readFileSync('./node_modules/highcharts/modules/boost.js', 'utf8')
let code_boost_canvas = fs.readFileSync('./node_modules/highcharts/modules/boost-canvas.js', 'utf8')


/**
 * 開啟瀏覽器依照Highcharts設定檔(含數據)繪圖並儲存成png
 *
 * 底層透過w-html2png以Chromium繪圖，提供兩種瀏覽器使用模式(whOpt.mode)：
 * 'single'為每次呼叫啟動新瀏覽器，出圖後即關閉釋放，Node行程可自然結束，適合排程批次；
 * 'alive'為常駐瀏覽器，第一次呼叫時啟動，同行程後續呼叫重用故出圖較快，閒置超過1小時自動關閉，
 * 批次腳本結束前可呼叫WHc2png.close()主動關閉常駐瀏覽器，使Node行程可立即退出
 *
 * @class
 * @param {Number} [width=700] 輸入圖片原始寬度數字，單位px，預設700
 * @param {Number} [height=400] 輸入圖片原始高度數字，單位px，預設400
 * @param {Number} [scale=3] 輸入欲將圖片放大比例數字，單位px，預設3
 * @param {Object|String} [opt={}] 輸入Highcharts設定物件或字串，可給予iife執行程式碼直接回傳Highcharts設定物件，預設{}
 * @param {Object} [whOpt={}] 輸入設定物件，預設{}
 * @param {String} [whOpt.mode='single'] 輸入瀏覽器使用模式字串，'single'代表每次呼叫啟閉瀏覽器，'alive'代表常駐瀏覽器供同行程重用，預設'single'
 * @param {String} [whOpt.executablePath=''] 輸入瀏覽器執行檔路徑字串，未給則使用套件自帶之免安裝chrome，預設''
 * @param {Array} [whOpt.scriptsHead=[]] 輸入引用js程式碼網址陣列，預設[]
 * @param {String|Array} [whOpt.execJsHead=''] 輸入插入head內執行js程式碼字串或陣列，預設''
 * @param {String|Array} [whOpt.execJsPost=''] 輸入於dom末插入執行js程式碼字串或陣列，預設''
 * @param {Integer} [whOpt.retry=3] 輸入失敗重試次數整數，預設3
 * @param {Boolean} [whOpt.writeError=false] 輸入是否輸出錯誤訊息至檔案布林值，預設false
 * @param {String} [whOpt.fdPng='./_convertTemp'] 輸入臨時儲存圖片png檔之資料夾位置字串，預設'./_convertTemp'
 * @param {String} [whOpt.fdHtml='./_convertTemp'] 輸入臨時儲存繪圖用html檔之資料夾位置字串，預設'./_convertTemp'
 * @param {String} [whOpt.fdProfile='./_convertTemp'] 輸入臨時儲存瀏覽器使用者資料之資料夾位置字串，預設'./_convertTemp'
 * @param {String} [whOpt.fdErr='./_convertTemp'] 輸入臨時儲存錯誤檔之資料夾位置字串，預設'./_convertTemp'
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
 *     // fs.writeFileSync('./test-scla.b64', b64)
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

    //淺拷貝whOpt, 避免後續擴充execJsHead與execJsPost時改寫呼叫端物件, 導致重用同一whOpt時繪圖碼逐次疊加
    whOpt = { ...whOpt }

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

    //execJsHead
    let execJsHead = [
        code_highcharts,
        code_highcharts_more,
        code_stock,
        code_annotations,
        code_heatmap,
        code_boost,
        code_boost_canvas,
    ]

    //cOpt
    let cOpt = ''
    if (isestr(opt)) {
        cOpt = opt //外部給予opt字串時須自行給予let opt=ooo
    }
    else {
        let j = JSON.stringify(opt)
        cOpt = `let opt=${j};`
    }

    //execJsPost
    let execJsPost = `

        ${cOpt}

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

    `
    execJsPost = [execJsPost] //先轉陣列讓後續處理有一致性

    //html
    let html = `

        <div id="hc" style="width:${width}px; height:${height}px;"></div>

    `

    //自動擴充execJsHead
    let _execJsHead = get(whOpt, 'execJsHead', '')
    if (isestr(_execJsHead)) {
        _execJsHead = [_execJsHead]
    }
    if (true) {
        _execJsHead = [
            ..._execJsHead,
            ...execJsHead,
        ]
    }
    whOpt.execJsHead = _execJsHead

    //自動擴充execJsPost
    let _execJsPost = get(whOpt, 'execJsPost', '')
    if (isestr(_execJsPost)) {
        _execJsPost = [_execJsPost]
    }
    if (true) {
        _execJsPost = [
            ..._execJsPost,
            ...execJsPost,
        ]
    }
    whOpt.execJsPost = _execJsPost

    //WHtml2png
    let b64 = await WHtml2png(width, height, scale, html, whOpt)
    // console.log('b64', b64)

    return b64
}


//close, 主動關閉alive模式之常駐瀏覽器, 轉呼叫WHtml2png.close, 供批次或服務結束前呼叫使Node行程可立即退出
WHc2png.close = async () => {
    await WHtml2png.close()
}


export default WHc2png
