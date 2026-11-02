import fs from 'fs'
import path from 'path'
import { fdRepo, runNode } from './child.mjs'


//buildCopy: 建置腳本之測試輔助, 依dspec〈自有套件之發布與建置腳本〉規則4: 以副本並指定cwd執行toolg腳本
//把src、toolg、package.json複製到副本資料夾(限定在test/_tmp之下), 再以spawn指定cwd=副本執行toolg腳本,
//腳本內相對cwd之'./src'、'./dist'、'dist'、'docs'皆落在副本, 不觸及repo之dist/docs; 副本內之import經上層資料夾解析到repo之node_modules(不建連結)


let fdTmp = path.join(fdRepo, 'test', '_tmp')


//makeBuildCopy, 重建副本資料夾fdCopy並複製src、toolg、package.json, 回傳fdCopy
function makeBuildCopy(fdCopy) {
    let fd = path.resolve(fdCopy)
    if (!fd.startsWith(fdTmp + path.sep)) {
        throw new Error(`fdCopy must be under ${fdTmp}: ${fd}`)
    }
    fs.rmSync(fd, { recursive: true, force: true })
    fs.mkdirSync(fd, { recursive: true })
    fs.cpSync(path.join(fdRepo, 'src'), path.join(fd, 'src'), { recursive: true })
    fs.cpSync(path.join(fdRepo, 'toolg'), path.join(fd, 'toolg'), { recursive: true })
    fs.copyFileSync(path.join(fdRepo, 'package.json'), path.join(fd, 'package.json'))
    return fd
}


//runToolg, 於副本以cwd=副本執行toolg/<name>.mjs, 回傳runNode之結果{ code, out, ... }
function runToolg(fdCopy, name) {
    return runNode([path.join('toolg', `${name}.mjs`)], { cwd: fdCopy })
}


export {
    makeBuildCopy,
    runToolg
}
