import fs from 'fs'
import { createRequire } from 'module'
import { pathToFileURL } from 'url'


//childDraw: 子行程以指定方式(cjs之require或esm之import)載入目標模組並出圖, 輸出一行RESULT(JSON)
//用法: node test/tools/childDraw.mjs '<JSON>'  JSON: { via:'cjs'|'esm', fp, width, height, scale, opt, whOpt, out, loadOnly }
//環境變數EXE: 指定whOpt.executablePath


let require = createRequire(import.meta.url)
let a = JSON.parse(process.argv[2])
let r = { via: a.via, cwd: process.cwd() }


async function main() {
    let f = null
    try {
        if (a.via === 'cjs') {
            let m = require(a.fp)
            f = typeof m === 'function' ? m : m.default
        }
        else {
            f = (await import(pathToFileURL(a.fp).href)).default
        }
        r.load = 'ok'
        r.typeofExport = typeof f
        r.typeofClose = typeof (f && f.close)
    }
    catch (err) {
        r.load = 'err'
        r.loadErr = String(err && err.message ? err.message : err).split('\n')[0]
        return
    }
    if (a.loadOnly) {
        return
    }
    let whOpt = { ...(a.whOpt || {}) }
    if (process.env.EXE) {
        whOpt.executablePath = process.env.EXE
    }
    try {
        let b64 = await f(a.width, a.height, a.scale, a.opt, whOpt)
        fs.writeFileSync(a.out, Buffer.from(b64, 'base64'))
        r.draw = 'ok'
    }
    catch (err) {
        r.draw = 'err'
        r.drawErr = String(err && err.message ? err.message : err).split('\n')[0].slice(0, 300)
    }
    if (whOpt.mode === 'alive') {
        await f.close()
    }
}


main()
    .catch((err) => {
        r.fatal = String(err)
    })
    .finally(() => {
        console.log('RESULT ' + JSON.stringify(r))
    })
