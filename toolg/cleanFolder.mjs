import cleanFolderStrict from './cleanFolderStrict.mjs'


//cleanFolderStrict, 清空失敗即拋錯, 使本腳本以非0結束(帳本R3)
cleanFolderStrict('dist')
cleanFolderStrict('docs')
