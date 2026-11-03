import fs from 'fs'
import os from 'os'
import net from 'net'
import path from 'path'
import assert from 'assert'
import JSON5 from 'json5'
import WHc2png from '../src/WHc2png.mjs'
import WHc2pngServer from '../src/WHc2pngServer.mjs'
import { decodePng, pixelAt } from './tools/png.mjs'
import { assertChartPng } from './tools/assertChart.mjs'
import { isWindows } from './tools/child.mjs'
import { getChromeExe } from './tools/chromeExe.mjs'
import { makeTrace } from './tools/trace.mjs'


//D-11: Server之安全面(帳本R12, R13, R14, R18); 埠9022-9028


let fdCase = path.resolve('./test/_tmp/api-WHc2pngServerSecurity')
let fdErrReq = path.join(fdCase, 'err-from-request')
let fdErrSrv = path.join(fdCase, 'err-from-server')
let fpNotExe = path.resolve('./package.json') //存在但不可執行之檔案, 若被當成瀏覽器執行檔將啟動失敗

let opt = { series: [{ data: [1, 3, 2, 4] }] }


async function post(port, body, headers = {}) {
    let resp = await fetch(`http://localhost:${port}/api`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
    })
    let j = await resp.json()
    return { status: resp.status, headers: resp.headers, j }
}


function b64ToBuf(j) {
    assert.ok(typeof j.b64 === 'string' && j.b64.startsWith('data:image/png;base64, '), `no b64: ${JSON.stringify(j).slice(0, 300)}`)
    return Buffer.from(j.b64.replace('data:image/png;base64, ', ''), 'base64')
}


function isLoopback(addr) {
    return addr === '127.0.0.1' || addr === '::1' || addr === '::ffff:127.0.0.1'
}


//connectable, 嘗試以TCP連線, 回傳是否連得上
function connectable(host, port) {
    return new Promise((resolve) => {
        let s = net.connect({ host, port, timeout: 3000 })
        s.on('connect', () => {
            s.destroy()
            resolve(true)
        })
        s.on('timeout', () => {
            s.destroy()
            resolve(false)
        })
        s.on('error', () => {
            resolve(false)
        })
    })
}


//nonLoopbackIPv4, 本機之非loopback IPv4(無則null)
function nonLoopbackIPv4() {
    for (let list of Object.values(os.networkInterfaces())) {
        for (let v of list || []) {
            if (v.family === 'IPv4' && !v.internal) {
                return v.address
            }
        }
    }
    return null
}


function listFiles(fd) {
    return fs.existsSync(fd) ? fs.readdirSync(fd) : []
}


describe(`api-WHc2pngServerSecurity`, function() {

    let exe = ''

    before(async function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdCase, { recursive: true })
        exe = await getChromeExe()
    })

    after(async function() {
        await WHc2png.close()
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R13: 未給host時只綁本機; 以本機之非loopback位址連線須被拒
    it(`should listen on loopback only by default `, async function() {
        let port = 9022
        let server = await WHc2pngServer({ port })
        try {
            let addr = server.listener.address().address
            assert.ok(isLoopback(addr), `listening on ${addr}`)
            assert.strict.equal(await connectable('localhost', port), true)
            let ip = nonLoopbackIPv4()
            if (ip !== null) {
                assert.strict.equal(await connectable(ip, port), false, `reachable via ${ip}`)
            }
            else {
                console.log('no non-loopback IPv4 on this machine, sub-assertion skipped')
            }
        }
        finally {
            await server.stop()
        }
    })

    //R13: 給host時從之
    it(`should listen on the given host `, async function() {
        let port = 9023
        let server = await WHc2pngServer({ port, host: '127.0.0.1' })
        try {
            assert.strict.equal(server.listener.address().address, '127.0.0.1')
        }
        finally {
            await server.stop()
        }
    })

    //R14: cors未給時維持允許跨來源; cors:false時不帶access-control-allow-origin(以無效width使其不需出圖即回應)
    it(`should allow cross-origin by default and disallow when cors is false `, async function() {
        let port = 9024
        let origin = 'http://other.example'
        let s1 = await WHc2pngServer({ port })
        try {
            let r = await post(port, { width: 'x', height: 1, scale: 1, opt }, { origin })
            assert.ok(r.j.err, 'expect err for invalid width')
            assert.ok(r.headers.get('access-control-allow-origin'), 'cors header missing by default')
        }
        finally {
            await s1.stop()
        }
        let s2 = await WHc2pngServer({ port, cors: false })
        try {
            let r = await post(port, { width: 'x', height: 1, scale: 1, opt }, { origin })
            assert.ok(r.j.err, 'expect err for invalid width')
            assert.strict.equal(r.headers.get('access-control-allow-origin'), null)
        }
        finally {
            await s2.stop()
        }
    })

    //R12: 請求端之executablePath/modeHeadless/retry/writeError/fdErr被忽略: 仍以預設瀏覽器出圖、不寫錯誤檔、回應列出被忽略之鍵
    it(`should ignore path/process/write settings from request whOpt `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let port = 9025
        let server = await WHc2pngServer({ port })
        try {
            let whOpt = { executablePath: fpNotExe, modeHeadless: false, retry: 1, writeError: true, fdErr: fdErrReq }
            let r = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt })
            assertChartPng(b64ToBuf(r.j), { width: 300, height: 200, minNonWhite: 2000, name: 'api-security-ignore' })
            assert.deepStrictEqual([...r.j.ignoredWhOpt].sort(), ['executablePath', 'fdErr', 'modeHeadless', 'retry', 'writeError'])
            assert.deepStrictEqual(listFiles(fdErrReq), [])

            //R12: 以JSON5字串給whOpt亦同
            let r2 = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt: JSON5.stringify({ executablePath: fpNotExe, writeError: true, fdErr: fdErrReq }) })
            assertChartPng(b64ToBuf(r2.j), { width: 300, height: 200, minNonWhite: 2000, name: 'api-security-ignore-json5' })
            assert.deepStrictEqual([...r2.j.ignoredWhOpt].sort(), ['executablePath', 'fdErr', 'writeError'])
            assert.deepStrictEqual(listFiles(fdErrReq), [])
        }
        finally {
            await server.stop()
        }
    })

    //R12: 請求端之白名單鍵(execJsPost)仍生效, 回應不帶ignoredWhOpt
    it(`should keep whitelisted keys from request whOpt `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let port = 9025
        let server = await WHc2pngServer({ port })
        try {
            let marker = `window.addEventListener('load', function () { var d = document.createElement('div'); d.style.cssText = 'position:fixed;left:0;top:0;width:20px;height:20px;z-index:99999;background:rgb(0,0,255)'; document.body.appendChild(d) })`
            let r = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt: { mode: 'single', execJsPost: marker } })
            let buf = b64ToBuf(r.j)
            assert.deepStrictEqual(pixelAt(decodePng(buf), 10, 10), [0, 0, 255])
            assert.strict.equal(r.j.ignoredWhOpt, undefined)
        }
        finally {
            await server.stop()
        }
    })

    //R12: 伺服器端opt.whOpt之設定生效(執行檔、寫錯誤檔), 且請求端無法以executablePath覆寫
    it(`should apply server-side whOpt and not let request override it `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let port = 9026
        let server = await WHc2pngServer({ port, whOpt: { executablePath: fpNotExe, retry: 1, writeError: true, fdErr: fdErrSrv } })
        try {
            let r = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt: { executablePath: exe } })
            assert.ok(r.j.err, `expect launch failure with server-side executablePath, got ${JSON.stringify(r.j).slice(0, 200)}`)
            assert.deepStrictEqual(r.j.ignoredWhOpt, ['executablePath'])
            assert.ok(listFiles(fdErrSrv).length >= 1, 'server-side writeError/fdErr not applied')
        }
        finally {
            await server.stop()
        }
    })

    //R18/R12: timeout涉及行程處置(逾時會關閉乃至結束該次所用之常駐瀏覽器, 並牽連同用之並發請求), 不在請求端白名單; 只能由伺服器端opt.whOpt提供
    //此案: 請求端不得「放寬」伺服器端之時限 -- 伺服器端timeout為1ms, 請求端給60000須被忽略, 仍以1ms逾時(若timeout被加入白名單, 請求端之60000會覆蓋而正常回圖, 本案即紅)
    it(`should not let request whOpt.timeout override the server-side timeout `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let port = 9027
        let tr = makeTrace()
        let server = await WHc2pngServer({ port, whOpt: { timeout: 1, retry: 1, onTrace: tr.onTrace } })
        try {
            let r = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt: { timeout: 60000 } })
            assert.ok(typeof r.j.err === 'string' && /^timeout\[1ms\] in /.test(r.j.err), `expect server-side timeout[1ms], got ${JSON.stringify(r.j).slice(0, 200)}`)
            assert.strict.equal(r.j.b64, undefined)
            assert.deepStrictEqual(r.j.ignoredWhOpt, ['timeout'])

            //w-html2png收到之timeout為伺服器端之1, 不是請求端之60000
            let attempts = tr.ofType('attempt')
            assert.strict.equal(attempts.length, 1, 'expect exactly 1 attempt event (server-side retry: 1)')
            assert.strict.equal(attempts[0].timeout, 1)

            //逾時時瀏覽器尚在啟動, 等其啟動完成後於背景關閉之事件, 使本案不留殘留行程
            await tr.wait('browser-close')
        }
        finally {
            await server.stop()
        }
    })

    //R18/R12: 伺服器端opt.whOpt.timeout生效(到達w-html2png), 且請求端不得「收緊」: 請求端給1須被忽略, 仍以伺服器端之60000正常回圖並列入ignoredWhOpt
    //(請求端可令共用之常駐瀏覽器逾時而被關閉, 牽連他人並發請求; 若timeout被加入白名單, 請求端之1會覆蓋而逾時, 本案即紅)
    it(`should apply server-side timeout and not let request whOpt.timeout shorten it `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let port = 9028
        let tr = makeTrace()
        let server = await WHc2pngServer({ port, whOpt: { timeout: 60000, retry: 1, onTrace: tr.onTrace } })
        try {
            let r = await post(port, { width: 300, height: 200, scale: 1, opt, whOpt: { timeout: 1 } })
            assertChartPng(b64ToBuf(r.j), { width: 300, height: 200, minNonWhite: 2000, name: 'api-security-timeout' })
            assert.deepStrictEqual(r.j.ignoredWhOpt, ['timeout'])

            //伺服器端之timeout(60000)確實到達w-html2png, 且未逾時
            let attempts = tr.ofType('attempt')
            assert.strict.equal(attempts.length, 1, 'expect exactly 1 attempt event')
            assert.strict.equal(attempts[0].timeout, 60000)
            assert.strict.equal(tr.ofType('timeout').length, 0, 'unexpected timeout event')
        }
        finally {
            await server.stop()
        }
    })

})
