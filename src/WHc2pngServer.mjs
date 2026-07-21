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


/**
 * 提供Highcharts設定檔(含數據)轉png圖服務
 *
 * @class
 * 服務內部繪圖預設採alive常駐瀏覽器模式跨request重用，省去每次啟閉瀏覽器開銷；
 * 呼叫端於request之whOpt自帶mode則尊重其設定。服務停止(server.stop())時會自動關閉常駐瀏覽器釋放資源
 *
 * @param {Object} [opt={}] 輸入設定物件，預設{}
 * @param {Integer} [opt.port=8080] 輸入Hapi伺服器所在port，預設8080
 * @param {String} [opt.apiName='api'] 輸入http API伺服器網址的api名稱，預設'api'
 * @returns {Promise} 回傳Promise，resolve為已啟動之Hapi server實例，可於需要時呼叫server.stop()關閉服務
 * @example
 *
 * import WHc2pngServer from 'w-hc2png'
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

                //mode, 服務長駐預設alive重用常駐瀏覽器省去每次啟閉開銷, 呼叫端有指定則尊重其設定
                if (!isestr(get(whOpt, 'mode'))) {
                    whOpt.mode = 'alive'
                }

                //WHc2png
                let b64 = await WHc2png(width, height, scale, opt, whOpt)

                //r
                b64 = `data:image/png;base64, ${b64}`
                // b64 = `<img src="${b64}">`
                // r = b64
                let o = JSON.stringify({ b64 })

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
                    r = JSON.stringify({ err })
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
            //host: 'localhost',
            routes: {
                cors: true
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
