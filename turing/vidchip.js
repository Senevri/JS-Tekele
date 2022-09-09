import { println } from "./util.js"
export default class Vidchip {
    //ram area used by vidchip currently
    ram_start = 0xa000
    ram_end = 0xde80
    pixelwidth = 160
    pixelheight = 100
    palette = new Uint8ClampedArray(768)
    constructor(memory) {
        this.init_palette()
        this.connect_memory(memory)
        this.test_screen()
    }

    connect_memory(memory) {
        this.memory = memory
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

