# 狀態(現況)

本檔只記現況,不寫過程(過程見 `sgud/exp/experience.md`);規則見 `sgud/rule/rulebook.md`。最近更新:2026-11-02(主控任務 20261102075126,toolg 依 dspec 改回標準寫法)。

## 最近一次驗證

- 日期:2026-11-02,Windows。相依:`w-html2png` 1.0.57、`wsemi` 1.9.33、`w-package-tools` 1.1.21(`package.json` 之 `version` 1.1.13 未動)。
- 全套 `npm test`(`mocha --parallel "test/*.test.mjs" --timeout 180000`):**38 passing**、0 failing、0 pending(Windows)。改前同日基準為 37 passing。
- 建置實跑(`script.txt` 之 cleanFolder → jsdoc → gDistRollup,於套件根):`dist/w-hc2png.umd.js`(8897 B)與 `.map`(15008 B)和已提交者逐位元相同;`docs/` 檔案清單相同(34 檔),僅 5 個 html 各差一行 jsdoc 產生時間戳。
- 發布:未發布(發布由主控進行);`dist/`、`docs/` 於工作樹維持已提交內容。

## 功能現況

| 功能 | 狀態 | 規則 | 測試檔 |
|---|---|---|---|
| `WHc2png`(src/dist)Highcharts 轉 png,single/alive 模式 | 完成;只支援 Windows(自帶 Chrome),非 Windows 須明給 `whOpt.executablePath`,出圖案例以 skip 呈現 | R1、R4、R5、R6、R9、R10 | `unit-WHc2png`、`unit-dist`、`unit-hcResolve` |
| 注入防護(`</script>`、`$`) | 完成 | R7、R8 | `unit-inject` |
| 建置(`toolg/gDistRollup.mjs`、`toolg/cleanFolder.mjs`,依 dspec〈自有套件之發布與建置腳本〉標準寫法) | 完成;測試以副本並指定 cwd 執行 toolg 腳本(`test/tools/buildCopy.mjs`) | R1、R2、R3、R5 | `unit-buildScript`、`unit-dist`、`unit-hcResolve` |
| `WHc2pngServer`(白名單 whOpt、只綁本機、cors 可設) | 完成 | R12–R15 | `api-WHc2pngServer`、`api-WHc2pngServerSecurity` |
| 對 w-html2png 只走公開入口(取 chrome.exe 路徑經 `ensureBins`) | 完成 | R17 | `unit-publicEntry`(+ `test/tools/chromeExe.mjs`) |

## 已知缺口與待辦

- R11(繪圖失敗不得以空白圖 resolve):仍刻意不套於 API。w-html2png 1.0.57 README 載有 `opt.rejectOnPageError`,可評估啟用;**待主控裁示**,本輪未做、未實測。
- 測試現仍明給 `whOpt.executablePath`(順帶涵蓋傳遞);w-html2png 1.0.57 後預設 Chrome 與 cwd 無關,可選擇改為不明給以直接涵蓋「預設 Chrome + 他處 cwd」,屬可選強化,未做。
- `src` 引用 `lodash-es` 而未宣告(生態系慣例),嚴格版面(pnpm `hoist=false`)下 src 用法可能失敗;dist 不受影響(見帳本〈已知限制〉)。
- 新裝 `node_modules` 後首次出圖須下載 Chrome(約 31 秒,快取於 `node_modules/w-html2png/bin-cache/`)。
- `toolg/gDocsExams.mjs` 存在但 `script.txt` 未列其發布列(`script.txt` 由使用者維護,agent 不改);是否列入待使用者決定。

## 標準圖

- 本套件無 pixel baseline 標準圖(`test/pics/` 不存在);出圖斷言以尺寸、非白像素數與同機 src/dist 互比為主。本輪 0 張改變。
