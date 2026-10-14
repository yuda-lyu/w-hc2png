import path from 'path'
import { spawn, execSync } from 'child_process'


//child: 測試用子行程工具, 以明確之cwd啟動node, 收集輸出與RESULT行(JSON), 逾時以taskkill /T(Windows)連同子行程終止


let fdRepo = path.resolve('.')


function isWindows() {
    return process.platform === 'win32'
}


//runNode, args為node之參數陣列; 回傳{ code, out, result, killed, ms }
function runNode(args, opt = {}) {
    let { cwd = fdRepo, env = {}, timeoutMs = 170 * 1000 } = opt
    return new Promise((resolve) => {
        let t0 = Date.now()
        let cp = spawn(process.execPath, args, { cwd, env: { ...process.env, ...env } })
        let out = ''
        cp.stdout.on('data', (d) => {
            out += d
        })
        cp.stderr.on('data', (d) => {
            out += d
        })
        let killed = false
        let timer = setTimeout(() => {
            killed = true
            try {
                if (isWindows()) {
                    execSync(`taskkill /F /T /PID ${cp.pid}`, { stdio: 'ignore' })
                }
                else {
                    cp.kill('SIGKILL')
                }
            }
            catch (err) {}
        }, timeoutMs)
        cp.on('exit', (code) => {
            clearTimeout(timer)
            let m = out.match(/^RESULT (\{.*\})\s*$/m)
            let result = null
            if (m) {
                try {
                    result = JSON.parse(m[1])
                }
                catch (err) {}
            }
            resolve({ code, out, result, killed, ms: Date.now() - t0 })
        })
    })
}


//countChildChrome, 指定父行程之子chrome.exe數(Windows), 供檢查常駐瀏覽器實例數
function countChildChrome(pid) {
    let cmd = `powershell -NoProfile -Command "(Get-CimInstance Win32_Process -Filter \\"name='chrome.exe'\\" | Where-Object { $_.ParentProcessId -eq ${pid} } | Measure-Object).Count"`
    return Number(String(execSync(cmd)).trim())
}


export {
    fdRepo,
    isWindows,
    runNode,
    countChildChrome
}
