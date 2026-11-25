# 回饋(提案紀錄)

本檔只增不改:任務中發現之自有套件、全域技能、全域設定之調整與抽提提案;處置結果(已通報、已修、不採納)另記一列並寫明承接哪一列。紀錄與提案不等於自行修改,實際修改走全域設定之通報管道。

| 日期 | 類別 | 對象 | 內容 | 依據 |
|---|---|---|---|---|
| 2026-11-25 | 自有套件 | w-html2png(1.0.94) | `dist/w-html2png.umd.js` 內嵌打包舊版 wsemi `fsEnsureBins`(無跨程序鎖),本套件升 wsemi ≥ 1.9.75 並不使其內部取得帶鎖;平行測試(`mocha --parallel`,9 檔)清空 `bin-cache` 後,6 個行程各自下載 8 個分割檔(共 48 次),全套卻仍全綠(下載夠快),只有事件看得出。建議:以 wsemi ≥ 1.9.75 重新建置並發布,使「同一快取只下載一次」由其內部提供;發布後本套件 `test/tools/chromeExe.mjs` 之 seed 步驟(帳本 R19 規則 4)成為冗餘,可移除。本套件現以 seed 補足,不依賴其修正。 | `node_modules/w-html2png/dist/w-html2png.umd.js` 內 `lock-wait` 0 處;`npm view w-html2png version` = 1.0.94 = 已裝版本;清空快取平行跑之 `onTrace` 事件:下載行程 6 個、`download` 事件 48 次、`lock-wait` 0 次 |
| 2026-11-25 | 自有套件 | wsemi(`fsEnsureBins`) | 呼叫端(測試之 hook 時限)須自行推算跨程序鎖之持有/等候上限,目前只能複製 `lockBudget` 之公式並假設內部常數(`KILL_WAIT_MS` 5 秒、`ARGS_CAP` 6000 字元分批);內部值改變時呼叫端靜默低估。建議:匯出 `lockBudget`(或讓結果/事件提供該單位之預算毫秒),供測試端對齊 `this.timeout()`。本套件現以常數加對照清單之守門案(`unit-chromeAcquire`)提醒重估。 | `node_modules/wsemi/src/fsEnsureBinsCore.mjs` 之 `lockBudget`、`KILL_WAIT_MS`、`ARGS_CAP`;`test/tools/chromeExe.mjs` 之 `chromeBudgetMs` |
| 2026-11-25 | 全域技能 | role-coder-for-test(§5.3) | 派工所引之 §5.3(取得集中於共用工具、取得處時限對齊下載預算、跨程序只下載一次)於本機技能副本中不存在(`SKILL.md` 只到 §5.1,疑尚未同步至本機);已依派工書所述要點執行。建議該節補兩點實證:①依賴套件之 `dist` 若內嵌舊版取得函式,升上游之 wsemi 不足以使鎖生效,驗收須以 `onTrace` 事件確認只下載一次,不以全綠判定;②取得之時限預算常數須有對照清單之守門案,清單變動即轉紅。 | 本機技能副本 role-coder-for-test 之 `SKILL.md` 章節標題 grep 無 §5.3;本檔第一列之事件證據 |
