import fs from 'fs'
import path from 'path'
import assert from 'assert'
import cleanFolderStrict from '../toolg/cleanFolderStrict.mjs'
import { fdRepo, runNode } from './tools/child.mjs'


//T-c: 建置與清空失敗須以非0結束(帳本R3, 裁示D-13)
//不執行toolg/gDistRollup.mjs與toolg/cleanFolder.mjs(兩者寫死./dist、./docs), 改以同一建置函數之測試入口與cleanFolderStrict驗證


let fdCase = path.resolve('./test/_tmp/unit-buildScript')
let fpCli = path.resolve('./test/tools/distBuildCli.mjs')


describe(`unit-buildScript`, function() {

    before(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(path.join(fdCase, 'brokensrc'), { recursive: true })
        fs.writeFileSync(path.join(fdCase, 'brokensrc', 'WHc2png.mjs'), 'import fs from \'fs\'\nlet a = {\nexport default a\n')
        fs.writeFileSync(path.join(fdCase, 'afile.txt'), 'x')
    })

    after(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R3: 原始碼語法錯時建置程序離開碼為1(原為catch只印出而以0結束)
    it(`should exit with code 1 when build fails `, async function() {
        let r = await runNode([fpCli, path.relative(fdRepo, path.join(fdCase, 'brokensrc')), path.relative(fdRepo, path.join(fdCase, 'dist'))], { cwd: fdRepo })
        assert.strict.equal(r.code, 1, r.out.slice(-800))
    })

    //R3: 清空目標為檔案時拋錯(原為回傳{error}而被忽略)
    it(`should throw when clean target is a file `, function() {
        assert.throws(() => {
            cleanFolderStrict(path.join(fdCase, 'afile.txt'))
        })
    })

    //R3: 清空目標之上層為檔案(無法建立)時拋錯(cleanFolder回傳裸Error之分支)
    it(`should throw when clean target can not be created `, function() {
        assert.throws(() => {
            cleanFolderStrict(path.join(fdCase, 'afile.txt', 'child'))
        })
    })

    //R3: 可建立之新資料夾正常清空(建立)且不拋錯
    it(`should clean (create) a new folder without throwing `, function() {
        let fd = path.join(fdCase, 'newdir')
        cleanFolderStrict(fd)
        assert.ok(fs.existsSync(fd) && fs.statSync(fd).isDirectory())
        assert.deepStrictEqual(fs.readdirSync(fd), [])
    })

    //R3: toolg之建置與清空腳本不得catch後只印出, 且分別經buildDist與cleanFolderStrict
    it(`should not swallow errors in toolg scripts `, function() {
        let fd = path.resolve('./toolg')
        for (let fn of fs.readdirSync(fd).filter((v) => v.endsWith('.mjs'))) {
            let c = fs.readFileSync(path.join(fd, fn), 'utf8')
            assert.ok(!/\.catch\(\(err\) => \{\s*console\.log\(err\)\s*\}\)/.test(c), `toolg/${fn} swallows errors`)
        }
        assert.ok(/buildDist\(/.test(fs.readFileSync(path.join(fd, 'gDistRollup.mjs'), 'utf8')), 'gDistRollup.mjs does not use buildDist')
        assert.ok(/cleanFolderStrict\(/.test(fs.readFileSync(path.join(fd, 'cleanFolder.mjs'), 'utf8')), 'cleanFolder.mjs does not use cleanFolderStrict')
    })

})
