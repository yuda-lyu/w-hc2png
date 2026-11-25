# 狀態(現況)

本檔只記現況,不寫過程(過程見 `sgud/exp/experience.md`);規則見 `sgud/rule/rulebook.md`。最近更新:2026-11-25(主控排程第 632 項:測試端集中取得內附 Chrome、時限對齊下載預算、跨程序只下載一次,帳本 R19)。

## 最近一次驗證

- 日期:2026-11-25,Windows。相依:`w-html2png` 1.0.94(`package.json` 為 `^1.0.94`)、`wsemi` 1.9.75(`package.json` 升為 `^1.9.75`,node_modules 內單一提升之副本)、`w-package-tools` ^1.1.30(`package.json` 之 `version` 1.1.45 未動)。
- 全套 `npm test`(`mocha --parallel "test/*.test.mjs" --timeout 180000`):**73 passing**、0 failing、0 pending(清空 `node_modules/w-html2png/bin-cache` 後約 50 秒、快取命中約 35 秒);改前基準 44 passing(新增 `unit-chromeAcquire` 29 案)。發布包解開之目錄(`npm pack`、自建 `node_modules`、解析守門)同樣 73 passing。
- 清空快取後平行全套之事件驗收(`test/tools/chromeTrace.mjs`):1 個行程下載 8 檔(各 1 次)、`publish` placed 1 次、6 個行程 `lock-wait` 皆 `end hit:true`;單檔執行(`unit-inject`〔隱式取得〕、`unit-hcResolve`〔明給〕)各自清空快取後通過且只下載一次。修前紅:舊測試於清空快取後 `--timeout 60000` 為 20 passing / 7 failing,修後同指令 0 failing。
- 新測試之變異 27 項全數被擊殺(帳本 R19);eslint(`test`、`src`、`toolg`)0 問題;private-guard CLEAN。
- 上一輪(2026-11-03)驗證:全套 44 passing;R18 新測試修前紅(w-html2png 1.0.64)、7 個變異全數被擊殺。
- 建置實跑(2026-11-02):`dist/w-hc2png.umd.js`(8897 B)與 `.map`(15008 B)和已提交者逐位元相同;`docs/` 僅 jsdoc 產生時間戳差異。本輪未重跑(只改 JSDoc 註解與 Server 註解;`unit-dist` 以副本實跑建置通過)。
- 發布:未發布(發布由主控進行);`dist/`、`docs/` 於工作樹維持已提交內容(JSDoc 新增之 `whOpt.timeout`/`whOpt.onTrace` 待發布時重建 `dist/`、`docs/`)。

## 功能現況

| 功能 | 狀態 | 規則 | 測試檔 |
|---|---|---|---|
| `WHc2png`(src/dist)Highcharts 轉 png,single/alive 模式 | 完成;只支援 Windows(自帶 Chrome),非 Windows 須明給 `whOpt.executablePath`,出圖案例以 skip 呈現 | R1、R4、R5、R6、R9、R10 | `unit-WHc2png`、`unit-dist`、`unit-hcResolve` |
| 注入防護(`</script>`、`$`) | 完成 | R7、R8 | `unit-inject` |
| 建置(`toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs`,依 dspec〈自有套件之發布與建置腳本〉標準寫法) | 完成;測試以副本並指定 cwd 執行 toolg 腳本(`test/tools/buildCopy.mjs`) | R1、R2、R3、R5 | `unit-buildScript`、`unit-dist`、`unit-hcResolve` |
| `WHc2pngServer`(白名單 whOpt、只綁本機、cors 可設) | 完成;請求端 `whOpt.timeout` 不在白名單(被忽略並列入 `ignoredWhOpt`),只能由伺服器端 `opt.whOpt.timeout` 提供 | R12–R15、R18 | `api-WHc2pngServer`、`api-WHc2pngServerSecurity` |
| `whOpt.timeout`(單次出圖允許時長)、`whOpt.onTrace`(觀察回調):整包轉傳至 w-html2png,語意以其說明為準;JSDoc/README 已列 | 完成;未給時行為不變(不加預設時限) | R18 | `unit-whOptTimeout`、`api-WHc2pngServerSecurity` |
| 對 w-html2png 只走公開入口(取 chrome.exe 路徑經 `ensureBins`) | 完成 | R17 | `unit-publicEntry`(+ `test/tools/chromeExe.mjs`) |
| 測試取得內附 Chrome:集中於 `test/tools/chromeExe.mjs`(`getChromeExe(this)`/`getChromeInfo(this)`,8 個使用 Chrome 之測試檔於 `before` 呼叫,含隱式取得者)、取得處時限 `CHROME_BUDGET_MS`(3,375,000 ms)、跨程序只下載一次(seed 以本套件 wsemi 1.9.75 之跨程序鎖,再經公開入口取路徑)、事件驗收(`W_HC2PNG_CHROME_TRACE` + `test/tools/chromeTrace.mjs`) | 完成;`package.json` 之 `scripts.test` 不改 | R19 | `unit-chromeAcquire`(29 案)與 8 個使用 Chrome 之測試檔 |

## 已知缺口與待辦

- R19 之 seed 步驟(`ensureChromeBins` 先以本套件 wsemi 取得)為補足 w-html2png 1.0.94 之 `dist` 內嵌舊版取得函式(無跨程序鎖)而設;w-html2png 改以 wsemi ≥ 1.9.75 建置發布後可移除(回饋已記於 `sgud/feedback/feedback.md`,待主控裁示通報);其餘 R19 限制見帳本 R19〈已知限制〉。非 Windows(CI 為 Linux)未實跑本輪新測試之全套:`getChromeInfo` 之非 Windows 分支僅驗 ctx 後回傳空值,該分支以單元案覆蓋「漏傳 this 即拋錯」,未於 Linux 實跑。

- R11(繪圖失敗不得以空白圖 resolve):仍刻意不套於 API。w-html2png 1.0.57 README 載有 `opt.rejectOnPageError`,可評估啟用;**待主控裁示**,本輪未做、未實測。
- 測試現仍明給 `whOpt.executablePath`(順帶涵蓋傳遞);w-html2png 1.0.57 後預設 Chrome 與 cwd 無關,可選擇改為不明給以直接涵蓋「預設 Chrome + 他處 cwd」,屬可選強化,未做。
- `src` 引用 `lodash-es` 而未宣告(生態系慣例),嚴格版面(pnpm `hoist=false`)下 src 用法可能失敗;dist 不受影響(見帳本〈已知限制〉)。
- 新裝 `node_modules` 後首次出圖須下載 Chrome(約 31 秒,快取於 `node_modules/w-html2png/bin-cache/`)。
- `toolg/gDocsExams.mjs` 存在但 `script.txt` 未列其發布列(`script.txt` 由使用者維護,agent 不改);是否列入待使用者決定。

## 標準圖

- 本套件無 pixel baseline 標準圖(`test/pics/` 不存在);出圖斷言以尺寸、非白像素數與同機 src/dist 互比為主。本輪 0 張改變。
