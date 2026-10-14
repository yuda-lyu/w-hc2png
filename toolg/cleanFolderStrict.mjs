import cleanFolder from 'w-package-tools/src/cleanFolder.mjs'


/**
 * 清空資料夾(不存在則建立), 失敗即拋錯, 使呼叫之腳本以非0結束(帳本R3)
 *
 * w-package-tools之cleanFolder成功回傳{ success }, 失敗回傳{ error }或Error物件而不拋錯, 故於此檢查回傳
 *
 * @param {String} fd 輸入資料夾路徑字串
 * @returns {Object} 回傳cleanFolder之成功結果物件
 */
function cleanFolderStrict(fd) {
    let r = cleanFolder(fd)
    if (r instanceof Error) {
        throw r
    }
    if (!r || typeof r !== 'object' || !r.success) {
        throw new Error(`cleanFolder failed[${fd}]: ${r && r.error ? r.error : String(r)}`)
    }
    return r
}


export default cleanFolderStrict
