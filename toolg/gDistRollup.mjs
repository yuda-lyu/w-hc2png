import { buildDist } from './distConfig.mjs'


let fdSrc = './src'
let fdTar = './dist'


//buildDist, 建置選項(external/globals/runin)之單一來源為toolg/distConfig.mjs(與測試共用), rollupFiles預設會clean folder;
//建置失敗時印出錯誤並以離開碼1結束, 不得catch後只印出(帳本R3)
buildDist({ fdSrc, fdTar })

