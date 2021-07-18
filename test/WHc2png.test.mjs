import fs from 'fs'
import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'


describe(`WHc2png`, function() {

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
        let ans = fs.readFileSync('./test1.b64', 'utf8')
        let ret = await WHc2png(st.width, st.height, st.scale, st.opt)
        return {
            ans,
            ret,
        }
    }
    it(`should return (base64) when run test1 `, async function() {
        let t = test1()
        let r = t.ret
        let rr = t.ans
        assert.strict.deepStrictEqual(r, rr)
    })

})
