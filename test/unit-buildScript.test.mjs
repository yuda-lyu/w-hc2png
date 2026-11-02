import fs from 'fs'
import path from 'path'
import assert from 'assert'
import { makeBuildCopy, runToolg } from './tools/buildCopy.mjs'


//T-c: 建置與清空失敗須以非0結束(帳本R3, 裁示D-13)
//依dspec〈自有套件之發布與建置腳本〉規則4: 每案把src、toolg、package.json複製到test/_tmp/unit-buildScript/<案名>/,
//以spawn指定cwd=副本執行toolg/gDistRollup.mjs與toolg/cleanFolder.mjs(兩者之'./dist'、'dist'、'docs'皆相對cwd), 不觸及repo之dist/docs


let fdCase = path.resolve('./test/_tmp/unit-buildScript')


describe(`unit-buildScript`, function() {

    before(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
        fs.mkdirSync(fdCase, { recursive: true })
    })

    after(function() {
        fs.rmSync(fdCase, { recursive: true, force: true })
    })

    //R3: 原始碼語法錯時toolg/gDistRollup.mjs離開碼為1且不產出dist(原為catch只印出而以0結束)
    it(`should exit with code 1 when gDistRollup fails to build `, async function() {
        let fd = makeBuildCopy(path.join(fdCase, 'brokensrc'))
        fs.writeFileSync(path.join(fd, 'src', 'WHc2png.mjs'), 'import fs from \'fs\'\nlet a = {\nexport default a\n')
        let r = await runToolg(fd, 'gDistRollup')
        assert.strict.equal(r.code, 1, r.out.slice(-800))
        assert.ok(/WHc2png\.mjs/.test(r.out), `error output does not mention the broken source: ${r.out.slice(-800)}`)
        assert.ok(!fs.existsSync(path.join(fd, 'dist', 'w-hc2png.umd.js')), 'dist built from broken source')
    })

    //R3: 可建立之新資料夾正常建立, 既有內容被清空, 離開碼0
    it(`should clean existing and create missing dist and docs with exit code 0 `, async function() {
        let fd = makeBuildCopy(path.join(fdCase, 'cleanok'))
        fs.mkdirSync(path.join(fd, 'dist', 'sub'), { recursive: true })
        fs.writeFileSync(path.join(fd, 'dist', 'old.txt'), 'x')
        fs.writeFileSync(path.join(fd, 'dist', 'sub', 'old.txt'), 'x')
        let r = await runToolg(fd, 'cleanFolder')
        assert.strict.equal(r.code, 0, r.out.slice(-800))
        for (let name of ['dist', 'docs']) {
            let fdx = path.join(fd, name)
            assert.ok(fs.existsSync(fdx) && fs.statSync(fdx).isDirectory(), `${name} is not a folder`)
            assert.deepStrictEqual(fs.readdirSync(fdx), [], `${name} is not empty`)
        }
    })

    //R3: 清空目標dist為檔案時非0結束(原為回傳{error}而被忽略)
    it(`should exit non-zero when dist is a file `, async function() {
        let fd = makeBuildCopy(path.join(fdCase, 'distfile'))
        fs.writeFileSync(path.join(fd, 'dist'), 'x')
        let r = await runToolg(fd, 'cleanFolder')
        assert.notStrictEqual(r.code, 0, r.out.slice(-800))
        assert.ok(/dist/.test(r.out), r.out.slice(-800))
        assert.ok(fs.statSync(path.join(fd, 'dist')).isFile(), 'dist file was replaced')
    })

    //R3: 第二個清空目標docs為檔案(dist可清空)時非0結束(第二次呼叫不得被略過或忽略)
    it(`should exit non-zero when docs is a file `, async function() {
        let fd = makeBuildCopy(path.join(fdCase, 'docsfile'))
        fs.mkdirSync(path.join(fd, 'dist'), { recursive: true })
        fs.writeFileSync(path.join(fd, 'dist', 'old.txt'), 'x')
        fs.writeFileSync(path.join(fd, 'docs'), 'x')
        let r = await runToolg(fd, 'cleanFolder')
        assert.notStrictEqual(r.code, 0, r.out.slice(-800))
        assert.ok(/docs/.test(r.out), r.out.slice(-800))
        assert.deepStrictEqual(fs.readdirSync(path.join(fd, 'dist')), [], 'dist was not cleaned before docs failed')
        assert.ok(fs.statSync(path.join(fd, 'docs')).isFile(), 'docs file was replaced')
    })

})
