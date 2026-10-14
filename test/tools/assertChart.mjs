import assert from 'assert'
import { pngInfo, decodePng, nonWhitePixels, comparePng } from './png.mjs'


//assertChartPng, 出圖之語意斷言(帳本R6): PNG簽章、尺寸=寬高×scale、非空白; 給baseline時再以容差比對(不重產基準圖, 裁示D-8)
function assertChartPng(buf, opt = {}) {
    let { width, height, minNonWhite = 20000, baseline = null, name = 'chart', maxDiffPixels = 1000 } = opt

    //R6: 回傳為PNG
    let info = pngInfo(buf)
    assert.strict.equal(info.sig, true, `${name}: not a png`)

    //R6: 尺寸=寬高×scale
    assert.strict.equal(info.width, width, `${name}: width`)
    assert.strict.equal(info.height, height, `${name}: height`)

    //R6/R11: 非空白(頁面端繪圖失敗時w-html2png會回傳全白圖)
    let nonWhite = nonWhitePixels(decodePng(buf))
    assert.ok(nonWhite >= minNonWhite, `${name}: nonWhite[${nonWhite}] < ${minNonWhite}`)

    //R6: 與基準/參考圖之容差比對, 超出容差時三聯組證據落./testPending/
    let cmp = null
    if (baseline) {
        cmp = comparePng(buf, baseline, { name, maxDiffPixels })
        assert.ok(cmp.ok, `${name}: diffPixels[${cmp.diffPixels}] > ${maxDiffPixels}, evidence[${cmp.evidence}]`)
    }

    return { nonWhite, cmp }
}


export {
    assertChartPng
}
