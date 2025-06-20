import fs from 'fs'
import assert from 'assert'
import WHc2png from '../src/WHc2png.mjs'


function isWindows() {
    return process.platform === 'win32'
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

    let ans = fs.readFileSync('./test/test-scla.b64', 'utf8')

    let ret = await WHc2png(width, height, scale, opt)

    return {
        ans,
        ret,
    }
}


async function testb() {

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
    `
    let whOpt = {}

    let ans = fs.readFileSync('./test/test-sclb.b64', 'utf8')

    let ret = await WHc2png(width, height, scale, cOpt, whOpt)
    // console.log('test', b64)

    return {
        ans,
        ret,
    }
}


describe(`WHc2png`, function() {

    it(`should return (base64) when run testa `, async function() {
        let rr = null
        let rt = null
        if (isWindows()) {
            let t = await testa()
            rr = t.ret
            rt = t.ans
        }
        else {
            rr = 1
            rt = 1
        }
        assert.strict.deepStrictEqual(rr, rt)
    })

    it(`should return (base64) when run testb `, async function() {
        let rr = null
        let rt = null
        if (isWindows()) {
            let t = await testb()
            rr = t.ret
            rt = t.ans
        }
        else {
            rr = 1
            rt = 1
        }
        assert.strict.deepStrictEqual(rr, rt)
    })

})
