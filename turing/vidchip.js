import { println } from "./util.js"

// TODO: This is nothing like real hardware. Should probably halt CPU when accessing memory,

export default class Vidchip {
    //ram area used by vidchip currently
    ram_start = 0xa000
    ram_end = 0xde80
    pixelwidth = 160
    pixelheight = 100
    palette = new Uint8ClampedArray(768)

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

    update_screen(elem_id, start, end, use_monochrome) {
        //console.log(elem_id, start, end)
        elem_id = elem_id || "screen"
        const canvas = document.getElementById(elem_id)
        const ctx = canvas.getContext('2d')
        const monochrome = Boolean(use_monochrome)
        const start_address = undefined !== start ? start : this.ram_start
        const end_address = end || this.ram_end
        let old_value = 0
        //console.log(start_address, end_address)

        const scale = canvas.width / this.pixelwidth
        const bitscale = 32 / 8

        var imageData = ctx.createImageData(canvas.width, canvas.height)
        for (let i = 0; i != end_address - start_address; i++) {
            var value = this.memory[start_address + i]
            // Modulate to make differences between adjacent colors clearer
            if (monochrome) {
                var r = value
                var g = value - 8 + (i % 2) * 4
                var b = value + 16 - (i % 2) * 8
            } else { //gotta be paletted anyway.
                let color = value
                // var r = (color % 4) * 64
                // var g = ((color >> 2) % 8) * 32
                // var b = ((color >> 5) % 8) * 32
                var r = this.palette[3 * color]
                var g = this.palette[3 * color + 1]
                var b = this.palette[3 * color + 2]
            }
            var x = i % 160
            var y = Math.floor(i / 160)
            for (let zi = 0; zi < scale; zi++) {
                for (let j = 0; j < scale; j++) {
                    let position = ((x * scale) + (scale * (y * canvas.width))) * bitscale
                    position = position + ((zi + j * canvas.width) * bitscale)
                    imageData.data[position] = r
                    imageData.data[position + 1] = g
                    imageData.data[position + 2] = b
                    imageData.data[position + 3] = 255
                }
            }

        }
        ctx.putImageData(imageData, 0, 0)
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
            let p = Math.floor(16 * x / this.pixelwidth) + 16 * Math.floor(16 * y / this.pixelheight)
            this.memory[this.ram_start + pos] = p
        }
    }
}

