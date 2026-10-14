# w-hc2png
A package for Highcharts to png by chromium.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-hc2png.svg?style=flat)](https://npmjs.org/package/w-hc2png) 
[![license](https://img.shields.io/npm/l/w-hc2png.svg?style=flat)](https://npmjs.org/package/w-hc2png) 
[![npm download](https://img.shields.io/npm/dt/w-hc2png.svg)](https://npmjs.org/package/w-hc2png) 
[![npm download](https://img.shields.io/npm/dm/w-hc2png.svg)](https://npmjs.org/package/w-hc2png) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-hc2png.svg)](https://www.jsdelivr.com/package/npm/w-hc2png)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-hc2png/WHc2png.html).

## Installation

### Using npm(ES6 module):
```alias
npm i w-hc2png
```

#### Example for function:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-hc2png/blob/master/scla.mjs)]
```alias
import fs from 'fs'
import WHc2png from 'w-hc2png'

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

    let b64 = await WHc2png(width, height, scale, cOpt, whOpt)
    // console.log('b64', b64)

    fs.writeFileSync('./test-sclb.b64', b64)
    genPlotHtml('./test-sclb.html', b64)

    console.log('finish')
}
testb()
    .catch((err) => {
        console.log(err)
    })

```

#### Example for Server:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-hc2png/blob/master/srv.mjs)]
```alias
import WHc2pngServer from 'w-hc2png/src/WHc2pngServer.mjs'

let opt = {
    port: 9020,
    apiName: 'api',
    // host: 'localhost', //default 'localhost' (loopback only); use '0.0.0.0' to accept remote connections
    // cors: true, //default true (any web page may call the API cross-origin); set false or a Hapi cors object to restrict
    // whOpt: { executablePath: '...', retry: 3, writeError: false, fdErr: './_convertTemp' }, //server-side drawing options
}
WHc2pngServer(opt)

------------------------

[POST] http://localhost:9020/api

{
    width: 500,
    height: 400,
    scale: 3,
    whOpt: {}, //optional, only keys mode, scriptsHead, stylesHead, execJsHead, execJsPost are accepted
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

------------------------

response: { b64: 'data:image/png;base64, ...' } or { err: '...' },
plus ignoredWhOpt: [...] when the request whOpt contains keys that are not accepted
```

#### Server security notes:
- The server binds to `localhost` by default. Exposing it (`host: '0.0.0.0'`) is only recommended behind a gateway/reverse proxy that restricts who can call it.
- `opt` given as a string, and `whOpt.execJsHead` / `whOpt.execJsPost`, are JavaScript executed in a Chrome launched with `--no-sandbox`. This is inherent to the feature: anyone who can call the API can run arbitrary JavaScript in that browser.
- `cors` defaults to `true`, so any web page opened by a user on the same machine/network can call the API from the browser. Set `cors: false` (or a Hapi cors object with specific origins) when cross-origin calls are not needed.
- From the request, `whOpt` only accepts `mode`, `scriptsHead`, `stylesHead`, `execJsHead`, `execJsPost`. Settings that involve paths, processes or file writes (such as `executablePath`, `modeHeadless`, `retry`, `writeError`, `fdHtml`, `fdErr`) are ignored and listed in the response field `ignoredWhOpt`; provide them on the server side via `WHc2pngServer({ whOpt })`.
