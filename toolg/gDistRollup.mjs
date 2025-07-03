// import path from 'path'
import rollupFiles from 'w-package-tools/src/rollupFiles.mjs'


let fdSrc = './src'
let fdTar = './dist'


async function rp() {

    await rollupFiles({ //rollupFiles預設會clean folder
        fns: 'WHc2png.mjs',
        fdSrc,
        fdTar,
        nameDistType: 'kebabCase',
        // bNodePolyfill: true,
        // bMinify: false,
        globals: {
            'path': 'path',
            'fs': 'fs',
            'stream': 'stream',

            'child_process': 'child_process',
            'archiver': 'archiver',
            'archiver-zip-encrypted': 'archiver-zip-encrypted',
            'unzipper': 'unzipper',

            'puppeteer': 'puppeteer',
            'tree-kill': 'tree-kill',

        },
        external: [
            'path',
            'fs',
            'stream',

            'child_process',
            'archiver',
            'archiver-zip-encrypted',
            'unzipper',

            'puppeteer',
            'tree-kill',

        ],
    })
        .catch((err) => {
            console.log(err)
        })

}
rp()
    .catch((err) => {
        console.log(err)
    })

