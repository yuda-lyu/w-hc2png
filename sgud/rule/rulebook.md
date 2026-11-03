# 規則帳本

本檔為套件設計與開發階段之規則帳本,為要求程式碼須長成什麼樣,或由規格產出之測試(項目/說明/流程)有哪些,包含軸、單一擁有者、已知限制、破壞性變更紀錄,以及對應是哪些測試檔案或指令等,由agent自行編列、擴充與維護.

## 0. 來源與範圍

- 來源:主控任務 20261014042248(dist 載入即找不到 chromium-bidi)之審計 run01(`C:\opensrcOper\dnow\20261014042248\agent-out\run01-審計回應.md`)與主控複審裁示(`C:\opensrcOper\dnow\20261014042248\review\run01-複審.md`,2026-10-14)。
- 類別:本套件在每一種使用方式下(`main` 之 dist、`src/*.mjs`、Server)皆能載入並完成一次最小繪圖;打包設定與實際相依一致;建置失敗以非 0 結束;不因打包或工作目錄而失真;Server 不讓請求端控制路徑、行程與寫檔。
- 判準用語:**已套**(程式已符合,附 `file:line`)/**未套**(待修)/**刻意不套**(附理由)。

## 1. 規則

### R1 打包策略與外部模組一致性(裁示 D-2,方案 S9)

- 規則:dist 不內嵌任何自有套件之有狀態模組;`src/WHc2png.mjs` 以 `import WHtml2png from 'w-html2png'`(其 main 為 CJS dist)引用,打包時列 external。dist 之 UMD 頭外部模組集合 = `toolg/gDistRollup.mjs` 之 `external` = `globals` 之鍵 = `fs`、`module`、`w-html2png`,且 ⊆ Node 內建模組 ∪ `package.json` 之 `dependencies`。
- 理由:playwright-core 以 `__dirname`/動態 require 定位自身檔案,打包必失真;內嵌 w-html2png 會帶入 playwright-core 並造成多份常駐瀏覽器(審計 F1、F2、F13)。
- 單一擁有者:`toolg/gDistRollup.mjs`(選項寫於本檔;寫法依 dspec〈自有套件之發布與建置腳本〉規則 4,測試以副本並指定 cwd 執行該腳本,不共用設定檔)。
- 盤點:建置後讀產物頭 `module.exports=t(require(...))` 之清單與 `*.umd.js.map` 之 `sources`。
- 測試:`test/unit-dist.test.mjs`(外部模組集合於測試內明列、sourcemap、載入、出圖)。

### R2 本套件為 Node-only,建置一律 `runin: 'nodejs'`

- 站點:`toolg/gDistRollup.mjs`(`runin: 'nodejs'`)。
- 理由:未給時 w-package-tools 預設 browser(node-resolve `preferBuiltins:false`),Node 內建模組全列「could not be resolved」,且同名 npm 套件可遮蔽內建模組(審計 F4)。
- 測試:`test/unit-dist.test.mjs`(建置輸出「could not be resolved」0 筆、無 `invalid runin`)。

### R3 建置與清空失敗以非 0 結束

- 規則:依 dspec〈自有套件之發布與建置腳本〉規則 4 之標準寫法,本套件不另立寫法:`toolg/cleanFolder.mjs` 直接呼叫 w-package-tools 之 `cleanFolder('dist')`、`cleanFolder('docs')`(該函數失敗即拋錯並重試,故腳本以非 0 結束);`toolg/gDistRollup.mjs` 於建置失敗時印出錯誤並 `process.exitCode = 1`。
- 站點:`toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs`。
- 測試:`test/unit-buildScript.test.mjs`(以副本並指定 cwd 執行 toolg 腳本:語法錯之來源 → `gDistRollup.mjs` 離開碼 1;`dist` 或 `docs` 為檔案 → `cleanFolder.mjs` 非 0;正常 → 清空既有內容並建立缺少者、離開碼 0)。
- 刻意不套:執行器是否於非 0 時中止屬主控發布流程(裁示 D-13)。

### R4 套件自身相依之檔案以模組位置解析,且延遲讀取(裁示 D-9,方案 S5')

- 規則:highcharts 程式碼以 `createRequire(import.meta.url).resolve('highcharts/…')` 解析,第一次呼叫時才讀並快取;不得以 cwd 相對路徑讀檔;不得於頂層宣告 `__filename`/`__dirname`(rollup umd 之 `import.meta.url` 墊片自我參照 TDZ);`import.meta` 只用 `url`。
- 站點:`src/WHc2png.mjs`。
- 盤點:Grep `\./node_modules|readFileSync\(['"]\.|^\s*(export\s+)?(let|const|var)\s+__(filename|dirname)|import\.meta\.(dirname|filename|resolve)` 於 `src/`(0 筆為已套)。
- 測試:`test/unit-hcResolve.test.mjs`(cwd 指向含替身 highcharts 之資料夾仍正常出圖)、`test/unit-dist.test.mjs`(cwd 在他處可載入出圖)。

### R5 dist 以「由現行 src 建出」者測載入與出圖

- 規則:不得只測 src、不得只測可載入;repo 之 `dist/` 只於發布時重建,測試一律把 `src`、`toolg`、`package.json` 複製到 `test/_tmp/<案名>/` 副本,以 `spawn` 指定 cwd=副本執行 `toolg/gDistRollup.mjs` 自建(輔助 `test/tools/buildCopy.mjs`;dspec〈自有套件之發布與建置腳本〉規則 4)。
- 測試:`test/unit-dist.test.mjs`。

### R6 圖像斷言:語意為主,像素容差為補強;非 Windows 以 skip 呈現(裁示 D-4、D-7、D-8)

- 規則:斷言 PNG 簽章、尺寸(寬高 × scale)、非空白(非白像素數);與基準/參考圖之比對用容差(差異像素數 ≤ 門檻),不用逐位元相等;不重產 `test/*.b64`;比對失敗之 capture/baseline/diff 三聯組落 `./testPending/`(ms 時間戳,不覆蓋、不自動刪);非 Windows 之出圖案例 `this.skip()`,建置/載入/靜態案例全平台跑。
- 單一擁有者:`test/tools/png.mjs`(以 Node `zlib` 自解 8-bit RGB/RGBA 非交錯 PNG,不新增相依)。
- 測試:全部出圖測試。

### R7 不以字串替換值把資料注入模板

- 規則:本套件程式注入資料一律用模板字面值或替換函式,不用 `str.replace('{x}', 字串)`(替換字串之 `$&`、`$'`、`$$`、`` $` `` 為特殊樣式)。
- 站點:`src/*.mjs`(目前 0 處);w-html2png 側之同型問題已由主控排程(第 29 項)。
- 盤點:Grep `\.replace\(['"]\{` 於 `src/`。

### R8 嵌入 inline script 之 JSON 須跳脫(裁示 D-10,方案 S10)

- 規則:物件 opt 以 `JSON.stringify` 嵌入時,`<` 轉 `\u003c`(防 `</script>`)、`$` 轉 `\u0024`(防 w-html2png 模板之 `$` 特殊樣式)。字串 opt 為呼叫端之程式碼,不改寫,文件載明不得含字面 `</script>`。
- 站點:`src/WHc2png.mjs`。
- 測試:`test/unit-inject.test.mjs`。

### R9 不內嵌有模組層狀態之自有套件

- 規則:dist 之 sourcemap 不得含 `w-html2png/`;同行程 main(dist)與 src 並用時只有一個常駐瀏覽器。
- 測試:`test/unit-dist.test.mjs`(sourcemap、同行程實例數)。

### R10 測試不得以「非 Windows 恆過」充當綠燈

- 規則:出圖案例於非 Windows `this.skip()`(呈現為 pending),不得以 `1 === 1` 通過。發布流程是否跑測試屬主控(裁示 D-13)。
- 盤點:Grep `rr = 1|rt = 1` 於 `test/`(0 筆為已套)。

### R11 繪圖失敗不得以空白圖 resolve(裁示 D-1:待 w-html2png 第 29 項)

- 本輪:刻意不套於 API(需 w-html2png 提供頁面失敗回報);測試於成功路徑一律斷言非空白(R6)。

### R12 Server 請求端 `whOpt` 白名單(裁示 D-11①)

- 規則:請求端 `whOpt` 只採白名單鍵 `mode`、`scriptsHead`、`stylesHead`、`execJsHead`、`execJsPost`;其餘(含 `executablePath`、`modeHeadless`、`retry`、`timeout`〔R18〕、`writeError`、`fdHtml`、`fdErr`、`fdPng`、`fdProfile`、`funGetUrl`、`funPageWait`)一律忽略,於 log 與回應之 `ignoredWhOpt` 註明。涉及路徑、行程、寫檔之設定只能由伺服器端建構參數 `opt.whOpt` 提供;請求端白名單鍵覆蓋伺服器端同名鍵。
- 站點:`src/WHc2pngServer.mjs`。
- 測試:`test/api-WHc2pngServerSecurity.test.mjs`(請求端給 `executablePath` 不採用、給 `writeError`+`fdErr` 不寫檔、回應列出被忽略之鍵;伺服器端 `whOpt` 生效)。

### R13 Server `host` 預設 `'localhost'`(裁示 D-11②)

- 規則:未給 `opt.host` 時綁 `'localhost'`;給則從之。
- 測試:`test/api-WHc2pngServerSecurity.test.mjs`(listener 位址為 loopback;以本機非 loopback 位址連線被拒,無此位址時略過該子斷言並註明)。

### R14 Server `cors` 可設定(裁示 D-11③)

- 規則:`opt.cors` 未給時為 `true`(維持現行);給 `false`/物件時從之。
- 測試:`test/api-WHc2pngServerSecurity.test.mjs`(未給時回應帶 `access-control-allow-origin`;`cors:false` 時不帶)。

### R15 README 載明 Server 之安全前提(裁示 D-11④)

- 規則:README 載明字串 opt 於 `--no-sandbox` 之 Chrome 執行任意 JS 屬功能固有、Server 應只綁本機或置於閘道之後、`cors` 之風險、請求端 `whOpt` 白名單。
- 站點:`README.md`、`src/WHc2pngServer.mjs` JSDoc。

### R16 測試執行方式(裁示 D-3)

- 規則:`package.json` 之 test 為 `mocha --parallel "test/*.test.mjs" --timeout 180000`(w-html2png 1.0.54 已修跨行程首次下載撞檔,2026-10-16 改回並連跑 2 次 33 passing)。
- 測試檔一律 `test/*.test.mjs` 並以 `unit-`/`api-` 前綴分層(裁示 D-6);輔助工具放 `test/tools/`;暫存放 `test/_tmp/<案名>/` 並於 `after` 清除;埠沿用 9021,新增 9022–9039。
- 2026-10-31(w-html2png 1.0.57、wsemi 1.9.33 後):全套 `npm test` 37 passing(33 + R17 新增 4)。
- 2026-11-02(toolg 改回 dspec 標準寫法、測試改以副本並指定 cwd 執行 toolg 腳本後):全套 38 passing(`unit-buildScript` 5→4、`unit-dist` 7→9、其餘不變)。
- 2026-11-03(w-html2png 1.0.65、R18 新增 6 案後):全套 44 passing(`unit-whOptTimeout` 4、`api-WHc2pngServerSecurity` +2;埠新增 9027、9028)。

### R17 對 w-html2png 一律走公開入口(2026-10-31,主控排程第 182 項)

- 規則:本套件之 `src/`、`test/`(不含 `test/_tmp/`)、`toolg/`、根目錄腳本對 w-html2png 之匯入只用公開入口 `'w-html2png'`(其 main 為 CJS dist),不得深層匯入其 `src/`、`dist/` 內檔(例如 1.0.57 已移除之 `w-html2png/src/autoDownloadFiles.mjs`)。需要自帶 chrome.exe 路徑者經 `WHtml2png.ensureBins()`,取組 chrome 內符合 `portable/App/Chrome-bin/<版本>/chrome.exe` 之唯一一筆(版本不寫死;組根層之 `Chrome-bin/chrome.exe` 為啟動器,不取),單一定義於 `test/tools/chromeExe.mjs`(`getChromeExe`)。
- 理由:深層路徑不屬 w-html2png 之公開契約,上游整理即壞。實例:1.0.57 移除 `autoDownloadFiles.mjs` 後,`unit-dist`、`unit-hcResolve`、`api-WHc2pngServerSecurity` 三檔之 `before` hook 全拋 `ERR_MODULE_NOT_FOUND`,三檔之全部案例未執行(修前 0 passing / 3 failing)。
- 盤點:Grep `['"`]w-html2png/` 於 `src/ test/ toolg/` 與根目錄 `*.mjs`(0 筆為已套);已由 `test/unit-publicEntry.test.mjs` 自動盤點。
- 範圍:只含 w-html2png。`wsemi/src/*.mjs`、`w-package-tools/src/*.mjs` 之逐檔匯入(`src/` 10 處、`toolg/` 6 處)為既有慣用法,本輪未改亦未盤點其公開契約。
- 測試:`test/unit-publicEntry.test.mjs`(掃描器以 fixture 驗正反例、實際檔案 0 筆、公開入口提供 `ensureBins`、取得之 chrome.exe 為組內帶版本者);`unit-dist`、`unit-hcResolve`、`api-WHc2pngServerSecurity` 之 `before` 經 `getChromeExe`。

### R18 `whOpt` 整包轉傳至 w-html2png;`timeout`/`onTrace` 為轉傳鍵,`timeout` 不在 Server 請求端白名單(2026-11-03,Gitea #61;w-html2png 1.0.65 起)

- 規則:
  1. `WHc2png` 對 `whOpt` 不挑選、不改寫、不加預設值,除自行擴充之 `execJsHead`/`execJsPost` 外整包傳給 `WHtml2png`(單一呼叫處);故 w-html2png 新增之選項(1.0.65 起 `opt.timeout`〔每次嘗試之允許時長,毫秒〕、`opt.onTrace`〔觀察回調〕)不必改程式即生效。語意以 w-html2png 之說明為準,本套件 JSDoc/README 只轉述並指向之,不另立語意。
  2. 轉傳須有測試守住,且以「值確實到達 w-html2png」為斷言(經 `onTrace` 之 `attempt` 事件的 `timeout` 欄位),不以耗時或出圖結果推斷:`timeout: 60000` 時被轉傳與被丟棄皆正常回圖,單看結果分辨不出。未給時 `attempt.timeout` 為 `null`(不得自行加入預設時限)。
  3. Server 請求端白名單(R12)**不含** `timeout`:逾時會關閉乃至強制結束該次所用之瀏覽器,服務預設為跨 request 共用之 alive 常駐瀏覽器,關閉時並發中之其他 request 會失敗(w-html2png README〈單次出圖之允許時長〉瀏覽器層),屬行程類設定(同 `retry`、`executablePath`);若開放,請求端可給極大值取消伺服器端之時限,或給極小值使共用瀏覽器反覆被關閉。只能由伺服器端 `opt.whOpt.timeout` 提供;請求端給了被忽略並列入 `ignoredWhOpt`,雙向皆測(不得放寬亦不得收緊伺服器端之值)。`onTrace` 為函數,無法經 JSON/JSON5 傳入,亦不在白名單。
- 站點:`src/WHc2png.mjs:319`(轉傳呼叫處)、`:67-68`(JSDoc);`src/WHc2pngServer.mjs:18`(白名單,上方註解載明 `timeout` 不在列之理由)、JSDoc 兩處。
- 盤點:Grep `await WHtml2png\(` 於 `src/`(1 筆,第 5 參數為整包 `whOpt`);Grep `keysWhOptReq =` 於 `src/WHc2pngServer.mjs`(不含 `timeout`、`onTrace`)。
- 測試:`test/unit-whOptTimeout.test.mjs`(#61 第 2 節兩項、single 模式、未給時 `attempt.timeout===null`)、`test/api-WHc2pngServerSecurity.test.mjs`(請求端 `timeout` 既不能放寬〔伺服器端 1ms、請求端 60000 → 仍逾時〕也不能收緊〔伺服器端 60000、請求端 1 → 仍回圖〕,皆列入 `ignoredWhOpt`)。輔助 `test/tools/trace.mjs`(`makeTrace`:收集 `onTrace` 事件與 `wait(type, n)` 事件同步)。
- 變異(2026-11-03,於副本,全數被擊殺):轉傳前刪 `timeout`、改鍵名、乘 2、刪 `onTrace`、未給時加預設時限、Server 白名單加 `timeout`、Server 丟棄伺服器端 `timeout`。
- 依賴:`package.json` 之 `w-html2png` 須 ≥ 1.0.65(`^1.0.65`)。

## 2. 測試檔對照

| 測試檔 | 層 | 對應規則 |
|---|---|---|
| `test/unit-WHc2png.test.mjs` | unit(原 `WHc2png.test.mjs`) | R6、R10、R11 |
| `test/api-WHc2pngServer.test.mjs` | api(原 `WHc2pngServer.test.mjs`,埠 9021) | R6、R10 |
| `test/unit-dist.test.mjs` | unit | R1、R2、R3、R4、R5、R9、R17(`before` 取 chrome 路徑) |
| `test/unit-hcResolve.test.mjs` | unit | R4、R5、R17(同上) |
| `test/unit-buildScript.test.mjs` | unit | R3 |
| `test/unit-inject.test.mjs` | unit | R7、R8 |
| `test/api-WHc2pngServerSecurity.test.mjs` | api(埠 9022–9028) | R12、R13、R14、R17(`before` 取 chrome 路徑)、R18(請求端 `timeout` 不放寬亦不收緊,埠 9027、9028) |
| `test/unit-whOptTimeout.test.mjs` | unit(真 Chrome,Windows;非 Windows `skip`) | R18 |
| `test/unit-publicEntry.test.mjs` | unit | R17 |
| `test/tools/trace.mjs` | 輔助(非測試檔) | R18(`makeTrace`:`onTrace` 事件收集與事件同步) |
| `test/tools/chromeExe.mjs` | 輔助(非測試檔) | R17(`getChromeExe`) |
| `test/tools/buildCopy.mjs` | 輔助(非測試檔) | R1、R2、R3、R5(`makeBuildCopy`/`runToolg`:副本並指定 cwd 執行 toolg 腳本,dspec 規則 4) |

## 2.1 站點與判準(2026-10-14 run02 實作後)

| 規則 | 判準 | 站點 |
|---|---|---|
| R1 | 已套 | `src/WHc2png.mjs:8`(引 `w-html2png` main);`toolg/gDistRollup.mjs:19-23`(globals = fs/module/w-html2png)、`:24-28`(external) |
| R2 | 已套 | `toolg/gDistRollup.mjs:15` |
| R3 | 已套(依 dspec〈自有套件之發布與建置腳本〉規則 4) | `toolg/gDistRollup.mjs:33-36`(失敗 `process.exitCode = 1`);`toolg/cleanFolder.mjs:4-5`(直接呼叫 w-package-tools 之 `cleanFolder`) |
| R4 | 已套 | `src/WHc2png.mjs:13`(`createRequire(import.meta.url)`)、`:33-40`(延遲讀取並快取)、`:240`(首次呼叫時取得);Grep 盤點僅命中 `:12` 之註解 |
| R5、R9 | 已套 | `test/unit-dist.test.mjs` |
| R6、R10 | 已套 | `test/tools/png.mjs`、`test/tools/assertChart.mjs`;各出圖案例首行 `if (!isWindows()) { this.skip() }` |
| R7 | 已套(執行碼 0 處);刻意不套:`src/WHc2png.mjs:82` 為 JSDoc 範例之 `h.replace('{b64}', b64)`(b64 不含 `$`,屬使用者端示範碼) | — |
| R8 | 已套 | `src/WHc2png.mjs:252-257` |
| R11 | 刻意不套於 API(待 w-html2png 第 29 項);測試已斷言非空白 | — |
| R12 | 已套 | `src/WHc2pngServer.mjs:18`(白名單)、`:81-84`(伺服器端 whOpt)、`:135-148`(過濾與記錄)、`:162-165`、`:179-182`(回應 `ignoredWhOpt`) |
| R13 | 已套 | `src/WHc2pngServer.mjs:69-72`、`:198` |
| R14 | 已套 | `src/WHc2pngServer.mjs:75-78`、`:200` |
| R15 | 已套 | `README.md`〈Server security notes〉;`src/WHc2pngServer.mjs` JSDoc |
| R16 | 已套 | `package.json:16` |
| R17 | 已套(對 w-html2png 之深層匯入 0 處) | `test/tools/chromeExe.mjs`(唯一取 chrome 路徑處,`import WHtml2png from 'w-html2png'`)、`test/unit-dist.test.mjs`、`test/unit-hcResolve.test.mjs`、`test/api-WHc2pngServerSecurity.test.mjs` 之 `before`;`src/WHc2png.mjs:8` |
| R18 | 已套 | `src/WHc2png.mjs:319`(整包轉傳)、`:67-68`(JSDoc);`src/WHc2pngServer.mjs:18`(白名單不含 `timeout`) |

## 3. 已知限制(文件化)

- 只支援 Windows(w-html2png)。
- 預設 Chrome 之位置:w-html2png 1.0.57 起(未給 `whOpt.executablePath`)經 `WHtml2png.ensureBins()` 取得並快取於 `<w-html2png 套件根>/bin-cache/`(或 `W_BIN_CACHE`),與 cwd 無關;實測(2026-10-31):空 cwd 不給 `executablePath` 以 src 出圖成功、cwd 內未產生任何檔案(`tmp/hc2png/probe-cwd.mjs`,已清)。舊版(≤1.0.56)依 cwd 定位之限制已不存在。仍可明給 `whOpt.executablePath`(Server 則由伺服器端 `opt.whOpt` 提供)。
- 頁面端繪圖失敗以空白圖 resolve(R11):w-html2png 1.0.57 README 載有 `opt.rejectOnPageError`(頁面拋錯時 reject,預設仍回圖),可評估由 WHc2png 啟用以套 R11;本輪未做、未實測,待主控裁示。
- w-html2png 1.0.57 README 載明內容逐字填入(含 `$&`、`$'`、`$$`);R8 之 `$` 跳脫(`$`)對頁面行為等價,未動。
- src 引用 `lodash-es` 而未宣告(由 wsemi 提供之生態系慣例),pnpm `hoist=false` 等嚴格版面下 src 用法可能失敗;dist 不受影響。

## 4. 破壞性變更紀錄

- 2026-10-31(主控排程第 182 項):相依升至 `w-html2png` ^1.0.57、`wsemi` ^1.9.33(不保留舊版相容)。w-html2png 1.0.57 之變更波及本套件:自帶 Chrome 改經 `ensureBins()` 取得並快取於 `bin-cache/`(與 cwd 無關)、移除 `W_HTML2PNG_CHROME_DIR`/`W_HTML2PNG_SKIP_DOWNLOAD`(改 `W_BIN_CACHE`/`W_BIN_MIRROR`/`W_BIN_OFFLINE`)、取不到 Chrome 時 reject `[錯誤碼] 說明`、移除深層匯入點 `src/autoDownloadFiles.mjs`(R17)。w-hc2png 之公開 API(`WHc2png`、`WHc2pngServer`)未變;已寫入 README〈Breaking changes〉。
- 2026-10-14(run02):Server 請求端 `whOpt` 改白名單(R12);Server 預設只綁本機(R13);highcharts 改用本套件宣告之版本(不再讀 cwd 根目錄之 highcharts,R4);同行程與使用者自引之 w-html2png(main)共用常駐瀏覽器(R1/R9)。
