import fs from 'fs'
import assert from 'assert'
import WHtml2png from 'w-html2png'
import { isWindows } from './child.mjs'


//chromeExe: 取得w-html2png自帶chrome之執行檔絕對路徑, 供測試明給whOpt.executablePath(含傳遞路徑之涵蓋)與請求端覆寫之斷言
//只經w-html2png之公開入口WHtml2png.ensureBins(首次使用時下載, 之後自快取取得並校驗; 與cwd無關), 不深層匯入w-html2png之src(帳本R17)
//選取規則同w-html2png內部: 組chrome內恰有一個portable/App/Chrome-bin/<版本>/chrome.exe(版本由其清單決定, 不寫死); 組根層之同名檔為啟動器, 不取
//自帶chrome只有Windows版, 其他平台回傳''


async function getChromeExe() {
    if (!isWindows()) {
        return ''
    }
    let bins = await WHtml2png.ensureBins()
    let files = bins.bundles.chrome.files
    let ks = Object.keys(files).filter((k) => /^portable\/App\/Chrome-bin\/[^/]+\/chrome\.exe$/.test(k))
    assert.strict.equal(ks.length, 1, `the bundle chrome must have exactly one versioned chrome.exe, found ${ks.length}`)
    let fp = files[ks[0]]
    assert.ok(fs.existsSync(fp), `chrome.exe not found: ${fp}`)
    return fp
}


export {
    getChromeExe
}
