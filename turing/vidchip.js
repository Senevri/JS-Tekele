import { hexify, assert, println } from "./util.js"

// TODO: This is nothing like real hardware. Should probably halt CPU when accessing memory,

export default class Vidchip {
    //ram area used by vidchip currently
    ram_start = 0xa000
    ram_end = 0xde80
    pixelwidth = 160
    pixelheight = 100
    palette = new Uint8ClampedArray(768)
    screenmode = 0
    screenmodes = [
        { width: 160, height: 100, color_bits: 8 },
        { width: 320, height: 200, color_bits: 4 },
    ]
    //maybe use 0xde81-oxdfff for vidchip io stuff, sprites?

    constructor(memory) {
        this.init_palette()
        this.memory = memory
        this.clear_screen()
        this.test_screen()
    }

    connect_memory(memory) {
        this.memory = memory
    }

    clip(address, width, height, step) {
        let data = []
        this.memory.pointer = address
        var counter = 0
        var heightcounter = 0
        for (let i = 0; i < width * height; i++) {
            if (counter == width) {
                //memory.pointer += 480-48//(160*3-48)
                this.memory.pointer += step - width
                counter = 0
                heightcounter++
            }
            data.push(this.memory.step())
            counter++
        }
        return data
    }

    blit(address, width, height, step, data) {
        this.memory.pointer = address
        var counter = 0
        var heightcounter = 0
        for (let i = 0; i < width * height; i++) {
            if (counter == width) {
                //memory.pointer += 480-48//(160*3-48)
                this.memory.pointer += step - width
                counter = 0
                heightcounter++
            }
            this.memory.push(data[i])
            counter++
        }
    }

    clear_screen() {
        const canvas = document.getElementById("screen")
        const ctx = canvas.getContext('2d')
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }

    clear_vidram() {
        console.log("clear vidram")
        this.memory.clear(this.ram_start, this.ram_end)
    }

    set_mode(mode) {
        if (!mode) mode = this.screenmode
        this.screenmode = mode
        let _mode = this.screenmodes[mode]
        this.pixelheight = _mode.height
        this.pixelwidth = _mode.width
        if (this.screenmode == 1) {
            this.set_palette_16()
        }
        //console.log(this.screenmode, _mode)
    }

    _get_color(value, use_monochrome, modulation) {
        const monochrome = Boolean(use_monochrome)
        if (undefined == modulation) modulation = 0
        if (monochrome) {
            var r = value
            var g = value - 8 + modulation * 4
            var b = value + 16 - modulation * 8
        } else { //gotta be paletted anyway.
            let color = value
            // var r = (color % 4) * 64
            // var g = ((color >> 2) % 8) * 32
            // var b = ((color >> 5) % 8) * 32
            var r = this.palette[3 * color]
            var g = this.palette[3 * color + 1]
            var b = this.palette[3 * color + 2]
        }
        return [r, g, b]
    }

    update_screen(elem_id, start, end, use_monochrome) {
        //console.log(elem_id, start, end)
        elem_id = elem_id || "screen"
        const canvas = document.getElementById(elem_id)
        if (start || end) {
            this.set_mode(0)
        }
        //if (!start) canvas.width = 3 * this.pixelwidth
        //if (!end) canvas.height = 3 * this.pixelheight
        const ctx = canvas.getContext('2d')

        const start_address = undefined !== start ? start : this.ram_start
        const end_address = end || this.ram_end
        let old_value = 0
        const color_bits = this.screenmodes[this.screenmode].color_bits
        let times = 8 / color_bits
        //console.log(start_address, end_address)
        //console.log(times, start_address, end_address)

        let scale = canvas.width / this.pixelwidth
        const bitscale = 32 / 8

        if (!Number.isInteger(scale)) {
            scale = 2
            if (this.pixelwidth <= 360) {
                scale = 2
            }
            canvas.width = scale * this.pixelwidth
            canvas.height = scale * this.pixelheight;
        }

        const imageData = ctx.createImageData(canvas.width, canvas.height)

        for (let i = 0; i != end_address - start_address; i++) {
            let vid_byte = this.memory[start_address + i]
            let values = []
            if (this.screenmode == 1) assert(times == 2)
            if (1 == times) {
                values = [vid_byte]
            } else {
                assert(times == 2, "Times was " + times)
                for (let c = 0; c < times; c++) {
                    //values.push(17 * (vid_byte & (0xf << 4 * 0)))
                    if (c == 1) { values.push((vid_byte & 0xf0) >> 4) }
                    if (c == 0) { values.push(vid_byte & 0xf) }
                    //values.push(vid_byte & (0xf << 4 * c) >> 4 * c)
                    values.forEach((v) => assert(v < 16, "vb " + vid_byte + " val" + v))
                }
                assert(values.length == 2)
                values = values.reverse()
                if (vid_byte == 0x02) {
                    assert((values[0] == 0 && values[1] == 2), "vid_byte 0x" + hexify(vid_byte, 2) + " vaules" + values)
                }

            }


            //assert(values.length == times)
            //console.log(values); return

            //assert(times == this.screenmode + 1)
            for (let c = 0; c < times; c++) {
                //if (this.screenmode == 1) console.log(c)

                // Modulate to make differences between adjacent colors clearer
                if (this.screenmode == 1) assert(values[c] < 16, "value was " + values + " index " + c)
                let rgb = this._get_color(values[c], use_monochrome)
                //rgb = [155, 0, 155]

                const x = ((i * times) % this.pixelwidth) + c
                const y = times * Math.floor((i * times) / this.pixelwidth)
                //assert(scale == 3, "Scale was " + scale.toString() + " times was " + times)
                //console.log(x, y)
                for (let zi = 0; zi < scale; zi++) {
                    for (let j = 0; j < times * scale; j++) {
                        let position = (x * scale + y * scale * canvas.width) * 4
                        position += (zi + j * canvas.width) * 4

                        imageData.data[position] = rgb[0]
                        imageData.data[position + 1] = rgb[1]
                        imageData.data[position + 2] = rgb[2]
                        imageData.data[position + 3] = 255
                    }
                }
            }

        }
        ctx.putImageData(imageData, 0, 0)
    }

    set_palette_16() {

        const arne_palette = [
            0, 0, 0,
            157, 157, 157,
            255, 255, 255,
            190, 38, 51,
            224, 111, 139,
            73, 60, 43,
            164, 100, 34,
            235, 137, 49,
            247, 226, 107,
            47, 72, 78,
            68, 137, 26,
            163, 206, 39,
            27, 38, 50,
            0, 87, 132,
            49, 162, 242,
            178, 220, 239
        ]
        for (let i = 0; i < 16; i++) {
            this.set_palette(i, arne_palette.slice(i * 3, i * 3 + 3))
        }
        for (let i = 16; i < 256; i++) {
            this.set_palette[i, [i, 0, 0]]
        }
        //console.log(this.palette.slice(0, 16 * 3))
        //assert(false)
    }

    set_palette(index, rgb) {
        assert(index < 256)
        assert(rgb.length = 3)
        //console.log(rgb)
        for (const [i, rgb_value] of rgb.entries()) {
            //console.log(index, rgb_value, i)
            this.palette[3 * index + i] = rgb_value
        }
    }

    init_palette() {
        // for (var i=0;i<this.palette.length+3;i+=3){
        //     let x = (i/3)%16
        //     let y = Math.floor(i/3 / 16)

        //     this.palette[i]= 0.8*x*1.5*y*4-(16-x)-(16-y)

        //     let dx = 8-Math.abs(x-8)
        //     let dy = 8-Math.abs(y-8)
        //     this.palette[i+1]=(16*y-dy*16)+x*8-((16-y)*8)
        //     this.palette[i+2]=(16*x-dx*16)+x*8-((y)*8)
        // }
        //interpolate colors between coordinates?
        //16,0 = blue, 0,16=green, 8,8 = red
        for (var y = 0; y < 16; y++) {
            for (var x = 0; x < 16; x++) {
                let w = (1 + x * y) - 1
                var dx = 7, dy = 7
                let r = 255 - ((1 + (dx + Math.abs(x - dx))) * (dy + Math.abs(y - dy))) - 1
                this.palette[(y * 16 + x) * 3] = (w + r * 1.2) - ((16 - x) * (16 - y))
                dx = 0, dy = 16
                let g = 255 - ((1 + (dx + Math.abs(x - dx))) * (dy + Math.abs(y - dy))) - 1
                this.palette[(y * 16 + x) * 3 + 1] = (w + g) - ((16 - x) * (16 - y))
                dx = 14; dy = 0
                let b = 255 - ((1 + (dx + Math.abs(x - dx))) * (dy + Math.abs(y - dy))) - 1
                this.palette[(y * 16 + x) * 3 + 2] = (w + b) - ((16 - x) * (16 - y))
                dx = 0; dy = 16
                //let b2 = 255-((1+(dx+Math.abs(x-dx)))*(dy+Math.abs(y-dy)))-1
                this.palette[(y * 16 + x) * 3 + 2] = w / 8 + this.palette[(y * 16 + x) * 3 + 2]
                // this.palette[(y * 16 + x) * 3] = y * 16
                // this.palette[(y * 16 + x) * 3 + 1] = x * 16
                // this.palette[(y * 16 + x) * 3 + 2] = (x * y)
            }
        }
        // let color = 0x000000
        // for (let i = 0; i < 768; i += 3) {
        //     this.palette[i] = color & 0x0000ff
        //     this.palette[i + 1] = color & 0x00ff00
        //     this.palette[i + 2] = color & 0xff0000
        //     color = color + i / 768 + (((i - 255) / 512) << 8) + (((i - 511) / 256) << 16)

        // }
        // for (let i = 0; i < 256; i++) {
        //     this.palette[i * 3] = color & 0x0000ff
        //     color = color + 0x01
        //     this.palette[i * 3 + 1] = (color & 0x00ff00) >> 8
        //     color = color + 0x100
        //     this.palette[i * 3 + 2] = (color & 0xff0000) >> 16
        //     color = color + 0x10000
        // }

        this.palette[767] = 0xff
        this.palette[766] = 0xff
        this.palette[765] = 0xff

    }
    test_screen() {
        println(this.ram_start)
        for (let pos = 0; pos < 16000; pos++) {
            let x = pos % this.pixelwidth
            let y = (pos - x) / this.pixelwidth//(pos / 160) % 100
            let p = (Math.floor((16 + 16 * this.screenmode) * x / this.pixelwidth) +
                16 * Math.floor((16 + this.screenmode * 48) * (y) / this.pixelheight))
            //let p = pos % 256
            this.memory[this.ram_start + pos] = p
        }
    }
}

