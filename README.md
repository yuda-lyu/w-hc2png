# w-hc2png
A package for Highcharts to png.

![language](https://img.shields.io/badge/language-JavaScript-orange.svg) 
[![npm version](http://img.shields.io/npm/v/w-hc2png.svg?style=flat)](https://npmjs.org/package/w-hc2png) 
[![license](https://img.shields.io/npm/l/w-hc2png.svg?style=flat)](https://npmjs.org/package/w-hc2png) 
[![gzip file size](http://img.badgesize.io/yuda-lyu/w-hc2png/master/dist/w-hc2png.umd.js.svg?compression=gzip)](https://github.com/yuda-lyu/w-hc2png)
[![npm download](https://img.shields.io/npm/dt/w-hc2png.svg)](https://npmjs.org/package/w-hc2png) 
[![jsdelivr download](https://img.shields.io/jsdelivr/npm/hm/w-hc2png.svg)](https://www.jsdelivr.com/package/npm/w-hc2png)

## Documentation
To view documentation or get support, visit [docs](https://yuda-lyu.github.io/w-hc2png/WHc2png.html).

## Installation
### Using npm(ES6 module):
> **Note:** w-hc2png is mainly dependent on `puppeteer`, `json5` and `@hapi/hapi`.
```alias
npm i w-hc2png
```

#### Example for function:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-hc2png/blob/master/scla.mjs)]
```alias
import WHc2png from 'w-hc2png/src/WHc2png.mjs'

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

```

#### Example for Server:
> **Link:** [[dev source code](https://github.com/yuda-lyu/w-hc2png/blob/master/srv.mjs)]
```alias
import WHc2pngServer from 'w-hc2png/src/WHc2pngServer.mjs'

let opt = {
    port: 9020,
    apiName: 'api',
}
WHc2pngServer(opt)

---- Postman ----

post: localhost:9020/api

with:
    width: 500
    height: 400
    scale: 3
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

```
