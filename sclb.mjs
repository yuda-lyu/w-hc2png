import fs from 'fs'
// import _ from 'lodash'
// import w from 'wsemi'
import WHc2png from './src/WHc2png.mjs'


function genPlotHtml(fp, b64) {
    let h = `
<html>
    <head></head>
    <body>
        <img style="border:1px dashed #ddd;" src="data:image/png;base64, {b64}">
    </body>
</html>
    `
    h = h.replace('{b64}', b64)
    fs.writeFileSync(fp, h, 'utf8')
}


async function test() {

    let width = 500
    let height = 400
    let scale = 3
    let cOpt = `
    let ds = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
    for (let i = 0; i < ds.length; i++) {
        ds[i] = Math.sin(ds[i]/360*Math.PI)
    }
    let opt = {

        title: {
            text: 'Logarithmic axis demo'
        },

        xAxis: {
            tickInterval: 1,
            type: 'logarithmic',
            accessibility: {
                rangeDescription: 'Range: 1 to 10'
            }
        },

        yAxis: {
            type: 'logarithmic',
            minorTickInterval: 0.1,
            accessibility: {
                rangeDescription: 'Range: 0.1 to 1000'
            }
        },

        tooltip: {
            headerFormat: '<b>{series.name}</b><br />',
            pointFormat: 'x = {point.x}, y = {point.y}'
        },

        series: [{
            data: ds,
            pointStart: 1
        }]

    }
    window.opt = opt
    `
    let whOpt = { useWindowOpt: true }

    let b64 = await WHc2png(width, height, scale, cOpt, whOpt)
    // console.log('test', b64)

    // fs.writeFileSync('./test.b64', b64)
    genPlotHtml('./test-sclb.html', b64)

    console.log('finish')
}
test()


//node --experimental-modules --es-module-specifier-resolution=node sclb.mjs
