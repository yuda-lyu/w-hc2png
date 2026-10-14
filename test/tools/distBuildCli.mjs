import path from 'path'
import { buildDist } from '../../toolg/distConfig.mjs'


//distBuildCli: 測試用建置入口, 以與toolg/gDistRollup.mjs同一份設定與建置函數(toolg/distConfig.mjs之buildDist)建置,
//輸出目錄限定在test/_tmp之下(不得改寫repo之dist), 建置失敗之離開碼由buildDist決定
//用法: node test/tools/distBuildCli.mjs <fdSrc> <fdTar>   (cwd=repo根)


let [fdSrc, fdTar] = process.argv.slice(2)
let fdTmp = path.resolve('./test/_tmp')
if (!fdSrc || !fdTar || !path.resolve(fdTar).startsWith(fdTmp + path.sep)) {
    console.log(`refuse: fdTar must be under ${fdTmp}`)
    process.exit(2)
}
await buildDist({ fdSrc, fdTar })
