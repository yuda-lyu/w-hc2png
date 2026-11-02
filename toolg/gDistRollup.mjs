import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


async function rp() {

    await rollupFiles({ //rollupFiles預設會clean folder
        fns: 'WHc2png.mjs',
        fdSrc,
        fdTar,
        hookNameDist: () => 'w-hc2png',
        runin: 'nodejs', //本套件為Node-only
        // nameDistType: 'kebabCase', //直接由hookNameDist給予
        // bNodePolyfill: true,
        // bMinify: false,
        globals: { //w-html2png以其main(CJS之dist)外部化, 不內嵌其src: 其相依playwright-core以__dirname與動態require定位自身檔案, 打包必失真, 且內嵌會造成多份常駐瀏覽器
            'fs': 'fs',
            'module': 'module',
            'w-html2png': 'w-html2png',
        },
        external: [
            'fs',
            'module',
            'w-html2png',
        ],
    })

}
rp()
    .catch((err) => {
        console.log(err)
        process.exitCode = 1 //建置失敗須以非0結束, 使發布流程得知
    })
