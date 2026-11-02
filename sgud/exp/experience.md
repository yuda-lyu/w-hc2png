# 累積經驗

本檔為執行工作時特有之累積經驗,留給後續之嘗試、執行與判斷,由agent自行編列、擴充與維護.

## 環境與測試執行(2026-10-14,審計 run01)

- **npm 12 預設封鎖相依套件之 postinstall**:新裝後 `node_modules/w-html2png/chrome/` 不存在,免安裝 Chrome 於第一次出圖時才下載(約 200MB、本機約 24 秒)。此時直接跑 `npm test`(`--parallel`)會因兩個 worker 同時下載而撞檔(`ENOENT ... portable.zip.00N.download`),4 案全敗。對策:先以單一行程出一次圖(或呼叫 `WHtml2png.ensureBins()`;`w-html2png/src/autoDownloadFiles.mjs` 於 1.0.57 已移除)把 Chrome 下載好再跑測試;根因在 w-html2png;**w-html2png 1.0.54 起已修(多行程同時首次使用只下載一份),此段僅適用 ≤1.0.53**。
- **既有測試以 base64 逐位元比對 2025-07-03 之基準**(`test/test-scl{a,b}.b64`):本機穩態 4/4 失敗,差異只在標題文字反鋸齒 9 像素(最大通道差 9);同機重複出圖逐位元一致。未經授權不得重產基準圖;改法見審計回應 R6/T-d。
- 機上常有他方之 `C:\Users\semi\AppData\Local\ms-playwright\chromium_headless_shell-*` 行程,非本套件所啟,勿殺;本套件之 Chrome 路徑(w-html2png ≤1.0.56)為 `node_modules/w-html2png/chrome/portable/App/Chrome-bin/138.0.7204.97/chrome.exe`;**1.0.57 起**改為 `node_modules/w-html2png/bin-cache/<組識別>/portable/App/Chrome-bin/<版本>/chrome.exe`(`WHtml2png.ensureBins()` 取得,與 cwd 無關;組根層之 `Chrome-bin/chrome.exe` 為啟動器,測試明給 `executablePath` 時不取它),見下方〈w-html2png 1.0.57〉。
- 對含 `node_modules` 之 `./tmp` 跑 `du -sh` 會超過 120 秒,勿用。

## 打包(dist)

- playwright-core **不可打包**:其延遲 `require('chromium-bidi/…')` 會被 commonjs 外掛提升為載入即執行;且以 `path.join(__dirname,'..')` 找自身 `package.json`/`browsers.json`(`lib/coreBundle.js:10714-10720`、`:29405`),打包後被改寫為必拋錯之 `commonjsRequire`。只外部化 chromium-bidi 無效。
- 未給 `runin` 時 w-package-tools 預設 browser(`preferBuiltins:false`),Node 內建模組全部印「could not be resolved」;本套件為 Node-only,應給 `runin:'nodejs'`。
- `rollupFiles` 開頭即清空 `fdTar`:在 `./tmp` 建變體時每個變體用專屬資料夾。
- 判斷 dist 是否打包了某套件:讀 `*.umd.js.map` 之 `sources`;判斷外部模組:讀 UMD 頭 `module.exports=t(require(...))` 之清單。

- **不要內嵌有模組層狀態之自有套件(w-html2png)**:內嵌後同行程會有多份常駐瀏覽器與 `pmDownload`(main 與 src 並用時 2 個瀏覽器,dist 之 `close()` 關不到 src 者)。改 `import WHtml2png from 'w-html2png'`(引 main=CJS dist)並列 external(審計 run01 之 S9),外部模組只剩內建與已宣告相依,且三入口共用一個實例。
- 補宣告「自有套件之相依」(例如在本套件 package.json 加 playwright-core)違反全域規範 §7,改從打包策略解決。

## 頁面注入

- w-html2png 以 `g.replace('{cXxx}', 字串)` 填模板:替換值中之 `$&`、`$'`、`$$`、`` $` `` 會被當特殊樣式。Highcharts `modules/annotations.js` 內唯一一處 `"\\$&"` 因此每次被改寫為 `"\\{cExecJsHead}"`;使用者文字 `A$&B` 變 `A{cExecJsPost}B`、`it$'s` 得全白圖。本套件以 `JSON.stringify` 嵌入 opt 時須跳脫 `<`(防 `</script>`)與 `$`(`$`)。
- 頁內探針手法:以字串 opt 在頁面內檢查 `document.scripts[i].text` 並把結果寫進圖表標題,直接在截圖上讀結果。

## 實作與測試(2026-10-14,run02)

- **絕不執行 `toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs`**(寫死 `./dist`、`./docs`,為受追蹤檔)。建置驗證走 `test/tools/distBuildCli.mjs`(與 gDistRollup 共用 `toolg/distConfig.mjs` 之 `buildDist`,且拒絕 `test/_tmp` 以外之輸出),或於 `./tmp` 之腳本 import `buildDist`。(2026-11-02 依 dspec〈自有套件之發布與建置腳本〉撤,改回標準寫法:`distConfig.mjs`、`distBuildCli.mjs` 已移除,測試改以副本並指定 cwd 執行 toolg 腳本,見下則。)
- **建置腳本之測試用副本並指定 cwd 執行(2026-11-02,dspec 規則 4)**:`toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs` 寫相對 cwd 之 `./src`、`./dist`、`dist`、`docs`,測試把 `src`、`toolg`、`package.json` 複製到 `test/_tmp/<案名>/`(輔助 `test/tools/buildCopy.mjs` 之 `makeBuildCopy`/`runToolg`),以 `spawn` 指定 cwd=副本執行,產物與清空皆落在副本、不觸及 repo 之 `dist/`、`docs/`。副本位於 repo 內,副本內的 `import 'w-package-tools/...'`、rollup 的模組解析皆經上層資料夾找到 repo 之 `node_modules`,**不需建 junction/symlink**(免去拆連結之風險)。仍禁在 repo 根直接執行 `toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs` 當測試(會清空受追蹤之 `dist/`、`docs/`);須在 repo 根實跑發布列驗證時,先把 `dist/`、`docs/` 複製到 `./tmp/` 備份,跑完比對(2026-11-02 實跑:`dist/` 兩檔與已提交者逐位元相同,`docs/` 僅 jsdoc 產生時間戳一行之差),再把 `docs/` 時間戳差異檔以備份覆蓋回去,免得工作樹留下無意義變更。
- **`runin: 'nodejs'` 在現行 src 下無可觀察效果(2026-11-02 變異證明所得)**:src 只用已列 external 之 `fs`、`module`,拿掉 `runin` 後產物逐位元不變、建置輸出也無 `could not be resolved`,故單測建置本身無法鑑別 R2。測試改在副本的 entry 頂端加 `import nodePath from 'path'`(未列 external 之內建模組),有 `runin:'nodejs'` 時無警告,拿掉則出現 `"path" is imported by …, but could not be resolved`(`unit-dist` 之 `should resolve unlisted Node builtins when building as nodejs`)。
- **背景指令不要再加 `&`**:Bash 工具 `run_in_background` 已是背景執行,結尾再加 `&` 會讓指令實際繼續跑、而前景殼立即結束,看似「沒跑」而重複啟動;`quiet-run --lock` 會讓第二份排隊,等到你已改檔後才執行,產生與目前程式不符之假紅。
- 修前紅燈證據:以 `git show HEAD:<path>` 把 src/toolg 取到 `./tmp/run02/before/`,再以 shim 重現舊建置設定,並讓 `before/node_modules` 以 junction 指向 repo 之 `node_modules`(HEAD 之 src 以 cwd 讀 highcharts,w-html2png 以 cwd 找 Chrome;不這樣做會因環境而全紅)。拆除時先 `cmd /c rmdir <junction>` 並確認不存在,再刪其餘(`tmp/run02/setup-before.mjs --remove`)。
- 專案 eslint 之 `comma-dangle` 對 `exports` 為 `never`:`export { a, b }` 不可帶尾逗號;lint 指令:`node node_modules/eslint/bin/eslint.js --no-eslintrc -c .eslintrc.js --resolve-plugins-relative-to . <檔>`。`srv.mjs:11` 有既有之 no-unused-vars 錯誤(未改)。
- npm 12 之 `npm pack --json` 回傳以套件名為鍵之物件(非陣列)。
- Server 預設 `host:'localhost'` 在本機綁 `::1`;以 `fetch('http://localhost:…')` 可連,以區網 IPv4 連線被拒(測試以此斷言「只綁本機」)。
- CORS 標頭只在請求帶 `Origin` 時出現;測 `cors` 時以無效 width 讓服務不需出圖即回應。
- 測「請求端 executablePath 被忽略」時用一個存在但不可執行之檔案(如 `package.json`):若未被忽略會 `spawn EFTYPE` 而失敗,且不會開出任何視窗。
- 頁內探針:以使用者 `execJsPost` 掛 `window.addEventListener('load', …)` 讀 `.highcharts-title` 之 `textContent`,結果畫成左上角色塊再取像素判讀;探針原始碼不可含 `$`、`<`(以 `String.fromCharCode` 組字),以免被 w-html2png 之模板替換改寫。
- 自寫之 PNG 解碼(`test/tools/png.mjs`)已與 playwright-core 內建 pngjs 逐位元比對一致;Chromium 截圖為 8-bit RGB 非交錯。

## w-html2png 1.0.57(2026-10-31,主控排程第 182 項)

- **深層匯入是上游整理時第一個壞的東西**:測試曾 `import('w-html2png/src/autoDownloadFiles.mjs')` 取 `fpExe`,1.0.57 移除後三個測試檔之 `before` hook 拋 `ERR_MODULE_NOT_FOUND`,**該檔所有案例都不執行**(不是只壞一案),全套輸出像「3 failing」而非「幾十案全壞」。取 chrome 路徑改走公開入口 `WHtml2png.ensureBins()`(`test/tools/chromeExe.mjs`);盤點由 `test/unit-publicEntry.test.mjs` 自動做(帳本 R17)。
- `ensureBins()` 回傳 `{ chrome: <組資料夾> }`,另有**不可列舉**之 `bundles.chrome.files[組內路徑]`(`Object.keys(bins)` 只見 `chrome`);組內有兩個 `chrome.exe`:`portable/App/Chrome-bin/chrome.exe`(啟動器)與 `portable/App/Chrome-bin/<版本>/chrome.exe`(w-html2png 內部取後者),以 `/^portable\/App\/Chrome-bin\/[^/]+\/chrome\.exe$/` 篩出唯一一筆,版本不寫死。
- 首次 `ensureBins()` 於本機約 31 秒(下載 8 個分割、校驗、解壓 107 檔);之後自快取取得。快取在 `node_modules/w-html2png/bin-cache/`,重裝 `node_modules` 會清掉而須重取。
- 預設 Chrome 與 cwd 無關(實測:空 cwd 不給 `executablePath` 出圖成功,cwd 內無任何新檔);故「測試於他處 cwd 須明給 `executablePath`」之舊理由已失效。現有測試仍明給(順帶涵蓋 `whOpt.executablePath` 之傳遞),不是為了 cwd。
- 掃描「深層匯入」之測試,其 fixture 字串與正規式不得讓測試檔自己被掃到:以 `['w-html2png','src','…'].join('/')` 組字串、正規式以 `\/` 跳脫,否則實際檔案掃描恆有 1 筆自我命中。
- 變異還原不用 git(禁用 checkout/restore/stash):變異前以 `git hash-object <檔>` 記雜湊,以 Edit 還原後再比對雜湊一致。
- `npm i` 之副作用:`package.json` 檔尾補了換行(原無),無其他格式差異。

## 驗證手法

- **頁面實際載入哪一版 Highcharts**:以字串 opt `let opt = { title: { text: 'Highcharts.version=' + Highcharts.version }, series: [{ data: [1,3,2,4] }] }` 出圖,版本直接畫在標題。
- **外部使用者模擬**:`npm pack` 暫存之套件副本 → 在 `./tmp/consumer/<名>/` 安裝 → 把探測腳本複製進 consumer 目錄執行(模組解析以檔案位置為準)。注意:consumer 位於 repo 內時,找不到的模組會往上解析到 **repo 自己的 `node_modules`**(pnpm `hoist=false` 之測試即因此失真);凡測「解析不到」之情境,先印出 `createRequire(...).resolve()` 之落點,並於出圖後稽核 `Object.keys(require.cache)` 是否全在 consumer 目錄內(`tmp/probe/consumer-audit.cjs`)。pnpm 可用 `npx --yes pnpm@9.15.9 --dir <dir> add <spec> --ignore-scripts --store-dir <./tmp 內> --config.hoist=false`。
- 頁面端繪圖失敗(opt 語法錯、無效圖型、lodash 缺)時 WHc2png 會 resolve 全白圖;驗收出圖須斷言非白像素數,不能只看有無 base64。
- PNG 逐像素比對可暫用 `playwright-core/lib/utilsBundle` 之 `PNG`(僅探測用;正式測試不宜依賴他套件內部 API)。
