import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


//globals, 外部模組與其UMD全域名(值同鍵); 須等於產物之外部模組集合, 且只含Node內建模組與package.json之dependencies(帳本R1)
//w-html2png以其main(CJS之dist)外部化, 不內嵌其src: 其相依playwright-core以__dirname與動態require定位自身檔案, 打包必失真, 且內嵌會造成多份常駐瀏覽器(帳本R1, R9)
let globals = {
    'fs': 'fs',
    'module': 'module',
    'w-html2png': 'w-html2png',
}


//distConfig, dist建置選項之單一來源, 供toolg/gDistRollup.mjs與測試共用
let distConfig = {
    fns: 'WHc2png.mjs',
    hookNameDist: () => 'w-hc2png',
    runin: 'nodejs', //本套件為Node-only, 以Node內建模組解析(帳本R2)
    globals,
    external: Object.keys(globals),
}


/**
 * 建置dist, 建置失敗時印出錯誤並將離開碼設為1(帳本R3)
 *
 * @param {Object} opt 輸入設定物件
 * @param {String} opt.fdSrc 輸入原始碼資料夾字串
 * @param {String} opt.fdTar 輸入輸出資料夾字串, rollupFiles會先清空此資料夾
 * @returns {Promise} 回傳Promise, resolve為是否建置成功之布林值
 */
async function buildDist({ fdSrc, fdTar }) {
    let ok = true
    await rollupFiles({ ...distConfig, fdSrc, fdTar })
        .catch((err) => {
            console.log(err)
            process.exitCode = 1
            ok = false
        })
    return ok
}


export {
    distConfig,
    buildDist
}
export default distConfig
