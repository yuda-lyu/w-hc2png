import Hapi from '@hapi/hapi'
import JSON5 from 'json5'
import get from 'lodash-es/get.js'
import isint from 'wsemi/src/isint.mjs'
import isestr from 'wsemi/src/isestr.mjs'
import iseobj from 'wsemi/src/iseobj.mjs'
// import ispm from 'wsemi/src/ispm.mjs'
import cint from 'wsemi/src/cint.mjs'
import cstr from 'wsemi/src/cstr.mjs'
// import haskey from 'wsemi/src/haskey.mjs'
import genPm from 'wsemi/src/genPm.mjs'
import WHc2png from './WHc2png.mjs'


//keysWhOptReq, request之whOpt可給之鍵(白名單, 帳本R12): 只含繪圖用之設定, 不含涉及路徑、行程、寫檔之設定
let keysWhOptReq = ['mode', 'scriptsHead', 'stylesHead', 'execJsHead', 'execJsPost']


/**
 * 提供Highcharts設定檔(含數據)轉png圖服務
 *
 * 服務內部繪圖預設採alive常駐瀏覽器模式跨request重用，省去每次啟閉瀏覽器開銷；
 * 呼叫端於request之whOpt自帶mode則尊重其設定。服務停止(server.stop())時會自動關閉常駐瀏覽器釋放資源
 *
 * 安全(詳見README)：request之whOpt只採白名單鍵(mode、scriptsHead、stylesHead、execJsHead、execJsPost)，
 * 其餘(例如executablePath、modeHeadless、retry、writeError、fdHtml、fdErr)一律忽略，記錄於log並於回應之ignoredWhOpt列出；
 * 涉及路徑、行程、寫檔之設定只能由伺服器端之opt.whOpt提供。字串opt與execJs類設定會在以--no-sandbox啟動之Chrome內執行任意JS，
 * 屬功能固有，故服務預設只綁本機(opt.host='localhost')，對外提供時應置於閘道之後並限制來源
 *
 * @class
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.port=8080] 輸入Hapi伺服器所在port，預設8080
 * @param {String} [opt.apiName='api'] 輸入http API伺服器網址的api名稱，預設'api'
 * @param {String} [opt.host='localhost'] 輸入Hapi伺服器綁定之主機字串，預設'localhost'只接受本機連線，給予'0.0.0.0'等則對外開放，預設'localhost'
 * @param {Boolean|Object} [opt.cors=true] 輸入Hapi之routes.cors設定，true為允許任意來源之網頁跨域呼叫，false為不允許，亦可給予Hapi之cors設定物件，預設true
 * @param {Object} [opt.whOpt={}] 輸入伺服器端之繪圖設定物件(同WHc2png之whOpt)，可含executablePath、retry、writeError、fdErr等，request之白名單鍵會覆蓋同名鍵，預設{}
 * @returns {Promise} 回傳Promise，resolve為已啟動之Hapi server實例，可於需要時呼叫server.stop()關閉服務
 * @example
 *
 * import WHc2pngServer from 'w-hc2png/src/WHc2pngServer.mjs'
 *
 * let opt = {
 *     port: 9020,
 *     apiName: 'api',
 * }
 * WHc2pngServer(opt)
 *
 */
function WHc2pngServer(opt) {

    //port
    let port = get(opt, 'port')
    if (!isint(port)) {
        port = 8080
    }
    port = cint(port)
    port = Math.max(port, 0)

    //apiName
    let apiName = get(opt, 'apiName')
    if (!isestr(apiName)) {
        apiName = 'api'
    }
    apiName = cstr(apiName)

    //host, 預設只綁本機(帳本R13)
    let host = get(opt, 'host')
    if (!isestr(host)) {
        host = 'localhost'
    }

    //cors, 預設允許跨域(維持既有行為), 可給false或Hapi之cors設定物件(帳本R14)
    let cors = get(opt, 'cors')
    if (cors !== false && cors !== true && !iseobj(cors)) {
        cors = true
    }

    //whOptServer, 伺服器端之繪圖設定, 涉及路徑、行程、寫檔之設定只能由此提供(帳本R12)
    let whOptServer = get(opt, 'whOpt')
    if (!iseobj(whOptServer)) {
        whOptServer = {}
    }

    //kpPlotfun
    let kpPlotfun = get(opt, 'kpPlotfun')
    if (!iseobj(kpPlotfun)) {
        kpPlotfun = {}
    }

    //api
    let api = {
        path: '/' + apiName,
        method: 'POST',
        options: {
            payload: {
                maxBytes: 1000 * 1024 * 1024, //1g
                timeout: 3 * 60 * 1000, //3分鐘, 注意payload timeout必須小於socket timeout
                multipart: true, //hapi 19之後修改multipart預設值為false
            },
            timeout: {
                socket: 5 * 60 * 1000, //5分鐘
            },
        },
        handler: function (req, res) {
            let pm = genPm()
            let r = null
            let ignoredWhOpt = []

            async function core() {

                //data
                let data = req.payload
                // console.log('req', req)
                // console.log('data', data)

                //width = 700, height = 400, scale = 3, plotFun
                let width = get(data, 'width', null)
                let height = get(data, 'height', null)
                let scale = get(data, 'scale', null)
                let opt = get(data, 'opt', null)
                let whOpt = get(data, 'whOpt', null)
                // console.log('opt', opt)

                //若傳入whOpt是string得轉回object
                if (isestr(whOpt)) {
                    whOpt = JSON5.parse(whOpt)
                }

                //whOpt, 預設物件
                if (!iseobj(whOpt)) {
                    whOpt = {}
                }

                //whOptUse, 以伺服器端設定為底, request只採白名單鍵, 其餘忽略並記錄(帳本R12)
                let whOptUse = { ...whOptServer }
                for (let k of Object.keys(whOpt)) {
                    if (keysWhOptReq.includes(k)) {
                        whOptUse[k] = whOpt[k]
                    }
                    else {
                        ignoredWhOpt.push(k)
                    }
                }
                if (ignoredWhOpt.length > 0) {
                    console.log(`w-hc2png ignored whOpt keys from request: ${ignoredWhOpt.join(', ')}`)
                }

                //mode, 服務長駐預設alive重用常駐瀏覽器省去每次啟閉開銷, 呼叫端有指定則尊重其設定
                if (!isestr(get(whOptUse, 'mode'))) {
                    whOptUse.mode = 'alive'
                }

                //WHc2png
                let b64 = await WHc2png(width, height, scale, opt, whOptUse)

                //r
                b64 = `data:image/png;base64, ${b64}`
                // b64 = `<img src="${b64}">`
                // r = b64
                let ro = { b64 }
                if (ignoredWhOpt.length > 0) {
                    ro.ignoredWhOpt = ignoredWhOpt
                }
                let o = JSON.stringify(ro)

                return o
            }

            //core
            core()
                .then((res) => {
                    r = res
                })
                .catch((err) => {
                    console.log('w-hc2png catch', err)
                    err = err.toString()
                    let ro = { err }
                    if (ignoredWhOpt.length > 0) {
                        ro.ignoredWhOpt = ignoredWhOpt
                    }
                    r = JSON.stringify(ro)
                })
                .finally(() => {
                    pm.resolve(r)
                })

            return pm
        },
    }

    async function startServer() {

        //server
        let server = Hapi.server({
            port,
            host, //預設'localhost'只綁本機(帳本R13)
            routes: {
                cors, //預設true(帳本R14)
            },
        })

        //route api
        server.route(api)

        //onPreStop, 服務停止前關閉alive模式之常駐瀏覽器, 釋放資源
        server.ext('onPreStop', async () => {
            await WHc2png.close()
        })

        //start
        await server.start()

        console.log(`Server running at: ${server.info.uri}`)

        return server
    }

    //startServer, 回傳Promise<server>供呼叫端於需要時server.stop()關閉服務(會觸發onPreStop釋放常駐瀏覽器)
    return startServer()

}


export default WHc2pngServer
