import { createRequire } from 'module'
import { pathToFileURL } from 'url'
import { countChildChrome } from './child.mjs'


//childDual: 同一行程內以main(建出之dist)與src兩入口各以alive模式出圖, 計數本行程之子chrome.exe, 檢查是否共用同一常駐瀏覽器
//用法: node test/tools/childDual.mjs '<JSON>'  JSON: { dist, src }   環境變數EXE: 指定whOpt.executablePath


let require = createRequire(import.meta.url)
let a = JSON.parse(process.argv[2])
let r = {}


async function main() {
    let A = require(a.dist)
    let B = (await import(pathToFileURL(a.src).href)).default
    let whOpt = { mode: 'alive' }
    if (process.env.EXE) {
        whOpt.executablePath = process.env.EXE
    }
    let opt = { series: [{ data: [1, 3, 2, 4] }] }
    await A(300, 200, 1, opt, { ...whOpt })
    r.afterMainAlive = countChildChrome(process.pid)
    await B(300, 200, 1, opt, { ...whOpt })
    r.afterSrcAlive = countChildChrome(process.pid)
    await B.close()
    r.afterSrcClose = countChildChrome(process.pid)
    await A.close()
    r.afterAllClose = countChildChrome(process.pid)
}


main()
    .catch((err) => {
        r.err = String(err && err.message ? err.message : err).split('\n')[0]
    })
    .finally(() => {
        console.log('RESULT ' + JSON.stringify(r))
    })
