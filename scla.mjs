// import fs from 'fs'
import WHc2png from './src/WHc2png.mjs'


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
    console.log('test1', b64)

    // fs.writeFileSync('test1.b64', b64)

}
test1()

//node --experimental-modules --es-module-specifier-resolution=node scla.mjs
