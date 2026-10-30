import fs from 'fs'
import path from 'path'
import assert from 'assert'
import WHtml2png from 'w-html2png'
import { isWindows } from './tools/child.mjs'
import { getChromeExe } from './tools/chromeExe.mjs'


//帳本R17: 本套件(src、test、toolg與根目錄腳本)對w-html2png之匯入一律為公開入口'w-html2png', 不深層匯入其src或dist內檔
//起因: w-html2png 1.0.57移除深層匯入點src/autoDownloadFiles.mjs, 測試深層匯入之而於升版後全壞(before hook拋ERR_MODULE_NOT_FOUND)


let fdCase = path.resolve('./test/_tmp/unit-publicEntry')
let fdRepo = path.resolve('.')

//以字串組成, 使本檔原始碼不含「引號+w-html2png+斜線」之字面而被下方掃描命中
let deep = ['w-html2png', 'src', 'ensureBins.mjs'].join('/')
let deepDist = ['w-html2png', 'dist', 'w-html2png.umd.js'].join('/')


//scanDeepImports, 掃描資料夾(遞迴)內之.mjs/.js/.cjs, 回傳含深層匯入(引號內以「w-html2png/」開頭之模組指定字串)之行; 略過之資料夾名由skip給
function scanDeepImports(fd, { skip = [], recursive = true } = {}) {
    let hits = []
    let reg = /['"`]w-html2png\/[^'"`\s]*['"`]/
    for (let ent of fs.readdirSync(fd, { withFileTypes: true })) {
        let fp = path.join(fd, ent.name)
        if (ent.isDirectory()) {
            if (recursive && !skip.includes(ent.name)) {
                hits.push(...scanDeepImports(fp, { skip, recursive }))
            }
        }
        else if (/\.(mjs|js|cjs)$/.test(ent.name)) {
            fs.readFileSync(fp, 'utf8').split(/\r?\n/).forEach((line, i) => {
                if (reg.test(line)) {
                    hits.push({ file: path.relative(fdRepo, fp), line: i + 1, text: line.trim() })
                }
            })
        }
    }
    return hits
}


describe(`unit-publicEntry`, function() {

    before(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(path.join(fdCase, 'sub'), { recursive: true })
        fs.mkdirSync(path.join(fdCase, 'node_modules'), { recursive: true })
        fs.writeFileSync(path.join(fdCase, 'a-static.mjs'), `import x from '${deep}'\n`)
        fs.writeFileSync(path.join(fdCase, 'sub', 'b-dynamic.mjs'), `let m = await import("${deep}")\n`)
        fs.writeFileSync(path.join(fdCase, 'c-require.cjs'), `let m = require('${deepDist}')\n`)
        fs.writeFileSync(path.join(fdCase, 'd-public.mjs'), `import WHtml2png from 'w-html2png'\nlet r = require('w-html2png')\nlet s = 'w-html2png-other/x'\n`)
        fs.writeFileSync(path.join(fdCase, 'node_modules', 'e-skipped.mjs'), `import x from '${deep}'\n`)
    })

    after(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R17(掃描器本身): 靜態import、動態import、require之深層指定皆命中, 公開入口與他名套件不命中, skip之資料夾不掃
    it(`should detect deep imports of w-html2png and ignore the public entry `, function() {
        let hits = scanDeepImports(fdCase, { skip: ['node_modules'] })
        let files = hits.map((v) => path.basename(v.file)).sort()
        assert.deepStrictEqual(files, ['a-static.mjs', 'b-dynamic.mjs', 'c-require.cjs'])
        let hitsAll = scanDeepImports(fdCase)
        assert.strict.equal(hitsAll.length, 4)
    })

    //R17: 本套件實際檔案不得有對w-html2png之深層匯入(src、test(不含test/_tmp)、toolg、根目錄腳本)
    it(`should not deep-import w-html2png in src, test, toolg and root scripts `, function() {
        let hits = []
        for (let fd of ['src', 'test', 'toolg']) {
            hits.push(...scanDeepImports(path.join(fdRepo, fd), { skip: ['_tmp', 'node_modules'] }))
        }
        hits.push(...scanDeepImports(fdRepo, { recursive: false }))
        assert.deepStrictEqual(hits, [], `deep imports of w-html2png: ${JSON.stringify(hits)}`)
    })

    //R17: 公開入口提供ensureBins(取得自帶chrome之正式管道); 全平台
    it(`should expose ensureBins on the public entry `, function() {
        assert.strict.equal(typeof WHtml2png.ensureBins, 'function')
    })

    //R17: 經公開入口取得之chrome執行檔存在, 為套件自帶之帶版本者(非組根層啟動器); Windows限定
    it(`should get the bundled chrome.exe through ensureBins `, async function() {
        if (!isWindows()) {
            this.skip()
        }
        let fp = await getChromeExe()
        assert.ok(fs.existsSync(fp), fp)
        assert.ok(/[\\/]portable[\\/]App[\\/]Chrome-bin[\\/][^\\/]+[\\/]chrome\.exe$/.test(fp), fp)
        let bins = await WHtml2png.ensureBins()
        assert.ok(path.resolve(fp).startsWith(path.resolve(bins.chrome) + path.sep), `${fp} is not inside ${bins.chrome}`)
    })

})
