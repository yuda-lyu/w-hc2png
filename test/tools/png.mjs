import fs from 'fs'
import path from 'path'
import zlib from 'zlib'


//PNG工具(測試用, 不新增相依): 以zlib自解/自編8-bit RGB/RGBA非交錯PNG(Chromium截圖之格式), 提供語意斷言與容差比對


let SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])


//crcTable, PNG chunk之CRC32
let crcTable = (() => {
    let t = new Uint32Array(256)
    for (let n = 0; n < 256; n++) {
        let c = n
        for (let k = 0; k < 8; k++) {
            c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1)
        }
        t[n] = c >>> 0
    }
    return t
})()


function crc32(buf) {
    let c = 0xffffffff
    for (let i = 0; i < buf.length; i++) {
        c = crcTable[(c ^ buf[i]) & 0xff] ^ (c >>> 8)
    }
    return (c ^ 0xffffffff) >>> 0
}


//pngInfo, 只讀簽章與IHDR
function pngInfo(buf) {
    let sig = buf.length >= 8 && buf.subarray(0, 8).equals(SIG)
    if (!sig || buf.length < 33) {
        return { sig: false, width: 0, height: 0 }
    }
    return {
        sig: true,
        width: buf.readUInt32BE(16),
        height: buf.readUInt32BE(20),
        bitDepth: buf[24],
        colorType: buf[25],
        interlace: buf[28],
    }
}


//decodePng, 回傳{ width, height, data }, data為RGBA之Uint8Array
function decodePng(buf) {
    let info = pngInfo(buf)
    if (!info.sig) {
        throw new Error('not a png')
    }
    let { width, height, bitDepth, colorType, interlace } = info
    if (bitDepth !== 8 || (colorType !== 2 && colorType !== 6) || interlace !== 0) {
        throw new Error(`unsupported png: bitDepth[${bitDepth}] colorType[${colorType}] interlace[${interlace}]`)
    }
    let bpp = colorType === 6 ? 4 : 3

    //IDAT
    let idats = []
    let p = 8
    while (p + 8 <= buf.length) {
        let len = buf.readUInt32BE(p)
        let type = buf.toString('ascii', p + 4, p + 8)
        if (type === 'IDAT') {
            idats.push(buf.subarray(p + 8, p + 8 + len))
        }
        if (type === 'IEND') {
            break
        }
        p += 12 + len
    }
    let raw = zlib.inflateSync(Buffer.concat(idats))

    //unfilter
    let rowBytes = width * bpp
    let out = new Uint8Array(width * height * 4)
    let prev = new Uint8Array(rowBytes)
    let cur = new Uint8Array(rowBytes)
    let q = 0
    for (let y = 0; y < height; y++) {
        let ft = raw[q++]
        for (let x = 0; x < rowBytes; x++) {
            let r = raw[q++]
            let a = x >= bpp ? cur[x - bpp] : 0
            let b = prev[x]
            let c = x >= bpp ? prev[x - bpp] : 0
            let v
            if (ft === 0) {
                v = r
            }
            else if (ft === 1) {
                v = r + a
            }
            else if (ft === 2) {
                v = r + b
            }
            else if (ft === 3) {
                v = r + ((a + b) >> 1)
            }
            else if (ft === 4) {
                let pa = Math.abs(b - c)
                let pb = Math.abs(a - c)
                let pc = Math.abs(a + b - 2 * c)
                v = r + ((pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c))
            }
            else {
                throw new Error(`unknown filter type[${ft}]`)
            }
            cur[x] = v & 0xff
        }
        for (let x = 0; x < width; x++) {
            let i = (y * width + x) * 4
            let j = x * bpp
            out[i] = cur[j]
            out[i + 1] = cur[j + 1]
            out[i + 2] = cur[j + 2]
            out[i + 3] = bpp === 4 ? cur[j + 3] : 255
        }
        let t = prev
        prev = cur
        cur = t
    }
    return { width, height, data: out }
}


//encodePng, 由RGBA編成PNG(供三聯組之diff圖)
function encodePng(img) {
    let { width, height, data } = img
    let rowBytes = width * 4
    let raw = Buffer.alloc((rowBytes + 1) * height)
    for (let y = 0; y < height; y++) {
        raw[y * (rowBytes + 1)] = 0
        Buffer.from(data.buffer, data.byteOffset + y * rowBytes, rowBytes).copy(raw, y * (rowBytes + 1) + 1)
    }
    let chunk = (type, body) => {
        let len = Buffer.alloc(4)
        len.writeUInt32BE(body.length)
        let tb = Buffer.concat([Buffer.from(type, 'ascii'), body])
        let crc = Buffer.alloc(4)
        crc.writeUInt32BE(crc32(tb))
        return Buffer.concat([len, tb, crc])
    }
    let ihdr = Buffer.alloc(13)
    ihdr.writeUInt32BE(width, 0)
    ihdr.writeUInt32BE(height, 4)
    ihdr[8] = 8
    ihdr[9] = 6
    return Buffer.concat([SIG, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}


//nonWhitePixels, 任一通道 < thr 視為非白
function nonWhitePixels(img, thr = 250) {
    let n = 0
    let d = img.data
    for (let i = 0; i < d.length; i += 4) {
        if (d[i] < thr || d[i + 1] < thr || d[i + 2] < thr) {
            n++
        }
    }
    return n
}


//pixelAt, 取(x,y)之[r,g,b]
function pixelAt(img, x, y) {
    let i = (y * img.width + x) * 4
    return [img.data[i], img.data[i + 1], img.data[i + 2]]
}


//diffImages, 任一通道差 > channelTol 視為差異像素; 回傳{ sizeMismatch, diffPixels, maxChannelDiff, diffImg }
function diffImages(a, b, channelTol = 0) {
    if (a.width !== b.width || a.height !== b.height) {
        return { sizeMismatch: true, diffPixels: Infinity, maxChannelDiff: 255, diffImg: null }
    }
    let n = 0
    let maxd = 0
    let out = new Uint8Array(a.data.length)
    for (let i = 0; i < a.data.length; i += 4) {
        let d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]))
        if (d > maxd) {
            maxd = d
        }
        if (d > channelTol) {
            n++
            out[i] = 255
            out[i + 1] = 0
            out[i + 2] = 0
        }
        else {
            let g = 200 + Math.round((a.data[i] + a.data[i + 1] + a.data[i + 2]) / 3 / 255 * 55)
            out[i] = g
            out[i + 1] = g
            out[i + 2] = g
        }
        out[i + 3] = 255
    }
    return { sizeMismatch: false, diffPixels: n, maxChannelDiff: maxd, diffImg: { width: a.width, height: a.height, data: out } }
}


//comparePng, 容差比對; 超出容差時把capture/baseline/diff三聯組寫入./testPending/(ms時間戳, 不覆蓋), 回傳比對結果
function comparePng(bufActual, bufExpected, opt = {}) {
    let { name = 'cmp', maxDiffPixels = 1000, channelTol = 0 } = opt
    let a = decodePng(bufActual)
    let b = decodePng(bufExpected)
    let r = diffImages(a, b, channelTol)
    let ok = !r.sizeMismatch && r.diffPixels <= maxDiffPixels
    let evidence = null
    if (!ok) {
        let fd = path.resolve('./testPending')
        fs.mkdirSync(fd, { recursive: true })
        let ts = `${Date.now()}`
        let base = path.join(fd, `${name}-${ts}`)
        fs.writeFileSync(`${base}-capture.png`, bufActual)
        fs.writeFileSync(`${base}-baseline.png`, bufExpected)
        if (r.diffImg) {
            fs.writeFileSync(`${base}-diff.png`, encodePng(r.diffImg))
        }
        evidence = base
    }
    return { ok, diffPixels: r.diffPixels, maxChannelDiff: r.maxChannelDiff, sizeMismatch: r.sizeMismatch, evidence }
}


export {
    pngInfo,
    decodePng,
    encodePng,
    nonWhitePixels,
    pixelAt,
    diffImages,
    comparePng
}
