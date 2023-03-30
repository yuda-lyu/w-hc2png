import fs from 'fs'
import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'


describe(`WHc2png`, function() {

    async function test1() {

        let ds = [1, 2, 4, 8, 16, 32, 64, 128, 256, 512]
        for (let i = 0; i < ds.length; i++) {
            ds[i] = Math.sin(ds[i]/360*Math.PI)
        }

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
                    data: ds,
                    pointStart: 1
                }]

            }
        }

        let ans = fs.readFileSync('./test/test.b64', 'utf8')

        let ret = await WHc2png(st.width, st.height, st.scale, st.opt)

        return {
            ans,
            ret,
        }
    }
    it(`should return (base64) when run test1 `, async function() {
        let t = await test1()
        let r = t.ret.length
        let rr = t.ans.length
        assert.strict.deepStrictEqual(r, rr)
    })

})
