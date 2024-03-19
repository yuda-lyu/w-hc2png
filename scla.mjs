import fs from 'fs'
// import _ from 'lodash-es'
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


async function testa() {

    let width = 500
    let height = 400
    let scale = 3
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
            data: [1, 2, 4, 8, 16, 32, 64, 128, 256, 512],
            pointStart: 1
        }]

    }

    let b64 = await WHc2png(width, height, scale, opt)
    // console.log('b64', b64)

    fs.writeFileSync('./test-scla.b64', b64)
    genPlotHtml('./test-scla.html', b64)

    console.log('finish')
}
testa()
    .catch((err) => {
        console.log(err)
    })

//node --experimental-modules --es-module-specifier-resolution=node scla.mjs
