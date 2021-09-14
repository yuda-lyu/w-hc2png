import fs from 'fs'
import _ from 'lodash'
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


async function test1() {

    let st = {
        width: 500,
        height: 400,
        scale: 3,
        opt: {

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
    }
    let b64 = await WHc2png(st.width, st.height, st.scale, st.opt)
    // console.log('test1', b64)

    // fs.writeFileSync('./test1.b64', b64)
    genPlotHtml('./test1.html', b64)

}
test1()

async function test2() {

    let st = {
        width: 190,
        height: 560,
        scale: 1,
        opt: JSON.parse(_.trim(fs.readFileSync('./opt (9).json', 'utf8'))),
    }
    let b64 = await WHc2png(st.width, st.height, st.scale, st.opt)
    // console.log('test2', b64)

    genPlotHtml('./test2.html', b64)

}
test2()


//node --experimental-modules --es-module-specifier-resolution=node scla.mjs
