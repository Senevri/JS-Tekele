import { hexify, println, clear } from "./util.js"
import CPU from "./cpu.js"
import Memory from "./memory.js"

(function () {

    //document.getElementById("content").innerText += "asdf"

    println("Hello world")


    let memory = new Memory(65535)

    function to_word(b1, b2) {
        return b1 << 8 + b2
    }

    let cpu = new CPU({
        memory: memory
    })

    let asm = {
        "nop": 0x01,
        "halt": 0x00,
        "jmp": 0x22, // = 32+2
        "mov": 0x33,
        "add": 0x34,
        "copy": 0x45,
        "jeq": 0x56,
    }

    var opcodes = {}
    cpu.opcode_types.forEach((name, index) => {
        for (var i = 0; i < 8; i++) {
            let opcode = (i << 4) + index
            opcodes[opcode] = name
        }
    })
    console.log("sanity check")
    for (let key in asm) {
        console.assert(opcodes[asm[key]] == key)
        console.assert(cpu.get_instruction(asm[key]).length == asm[key] >> 4)
    }
    //console.log(opcodes)

    // Helpers

    function read_address() {
        return memory.w_step()
    }

    function dump_memory(start_address, length) {
        if (!start_address) start_address = 0;
        println("memory size: " + memory.length)
        let rows = []
        let row = []
        row.push(hexify(start_address, 4))
        for (let i = start_address; i < memory.length; i++) {
            let chr = memory[i]
            row.push(hexify(chr, 2))
            if (row.length == 8 + 1) {
                rows.push(row.join(" "))
                row = []
                row.push(hexify(i, 4))

            }
            if (length == i - start_address ||
                (!length && chr == asm.halt)) {
                rows.push(row.join(" "))
                break
            }
        }
        println(rows.join("\n"), "memview")
    }


    function update_ui() {
        let max_lines = 30
        document.getElementById("memory_pointer").innerText = ""
        println(memory.pointer.toString(), "memory_pointer")
        document.getElementById("opcounter").innerText = ""
        println(cpu.op_counter.toString(), "opcounter")
        let lines = document.getElementById("content").innerText.split("\n")
        if (lines.length > max_lines) {
            document.getElementById("content").innerText = lines.slice(-max_lines - 1).join("\n")
        }

        //println(memory.toString())
    }


    // "screen chip"


    function clear_screen() {
        var canvas = document.getElementById("screen")
        var ctx = canvas.getContext('2d')
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    clear_screen()

    class Vidchip {
        //ram area used by vidchip currently
        ram_start = 0xa000
        ram_end = 0xde80
        pixelwidth = 160
        pixelheight = 100
        palette = new Uint8ClampedArray(768)
        constructor(memory) {
            this.init_palette()
            this.connect_memory(memory)
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
                    var dx = 6, dy = 6
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
                }
            }
        }
        test_screen() {
            for (var pos = ram_start; pos <= this.ram_end; pos++) {
                this.memory[pos] = pos % 256
            }
            SVGFEDisplacementMapElement()
        }
    }

    let video = new Vidchip(memory)

    function clip(address, width, height, step) {
        let data = []
        memory.pointer = address
        var counter = 0
        var heightcounter = 0
        for (let i = 0; i < width * height; i++) {
            if (counter == width) {
                //memory.pointer += 480-48//(160*3-48)
                memory.pointer += step - width
                counter = 0
                heightcounter++
            }
            data.push(memory.step())
            counter++
        }
        return data
    }

    function blit(address, width, height, step, data) {
        memory.pointer = address
        var counter = 0
        var heightcounter = 0
        for (let i = 0; i < width * height; i++) {
            if (counter == width) {
                //memory.pointer += 480-48//(160*3-48)
                memory.pointer += step - width
                counter = 0
                heightcounter++
            }
            memory.push(data[i])
            counter++
        }
    }
    let range = Array.from(Array(256).keys())
    //blit palette
    blit(0x1000, 16, 16, 160, range)

    //blit and clip palette
    blit(0x2000, 8, 8, 160, clip(0x1000 + 8 + 160 * 8, 8, 8, 160))

    var ctx
    function update_screen() {
        var canvas = document.getElementById("screen")
        ctx = canvas.getContext('2d')
        var monochrome = false
        var start_address = 0x0000
        var end_address = 0xffff
        var old_value = 0

        var style = null

        const scale = canvas.width / video.pixelwidth
        const bitscale = 32 / 8

        var imageData = ctx.createImageData(canvas.width, canvas.height)
        for (let i = start_address; i != end_address; i++) {
            var value = memory[start_address + i]
            if (monochrome) {
                var r = value
                var g = r
                var b = r
            } else { //gotta be paletted anyway.
                let color = value
                // var r = (color % 4) * 64
                // var g = ((color >> 2) % 8) * 32
                // var b = ((color >> 5) % 8) * 32
                var r = video.palette[3 * color]
                var g = video.palette[3 * color + 1]
                var b = video.palette[3 * color + 2]
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
    update_screen()

    memory.pointer = 0x000
    memory.append([
        asm.jmp, 0x01, 0x00, //leave the first 255 bytes for data
        asm.nop,
        asm.nop,
        asm.nop,
    ])
    memory.pointer = 0x0100
    memory.append([
        asm.jmp, 0xff, 0x11
    ])
    memory.pointer = 0xff11
    memory.append([
        asm.mov, 0x00, 0xa0f4,
        asm.add, 0x01, 0xff14,
        asm.add, 0x01, 0xff12,
        asm.add, 0x01, 0x00, 0x01,
        asm.jeq, 0xff, 0xff14, 0xff40,
        asm.copy, 0xff14, 0x00, 0x01, //need to pad input
        asm.jmp, 0xff, 0x11
    ])
    memory.pointer = 0xff40
    memory.append([
        asm.add, 0x01, 0xff13,
        asm.jeq, 0xfe, 0xff13, 0xff60,
        asm.jmp, 0xff11,
        asm.nop
    ])
    memory.pointer = 0xff60
    memory.append([
        asm.mov, 0xa0, 0xff13,
        asm.jmp, 0xff11
    ])


    memory.pointer = video.ram_start + 50 * 160 + 80 - 2
    let addr = memory.pointer


    const arr = [
        " ###### ",
        "#      #",
        "# #  # #",
        "#      #",
        "# #  # #",
        "#  ##  #",
        "#      #",
        " ###### ",
    ]

    arr.forEach((row, i) => {
        println(row.replace(/ /g, "."))
        const num_arr = row.split('').map((val) => {
            return val == "#" ? 0xff : 0x00
        })

        memory.write(addr + 160 * i, num_arr)
    })

    // draw "screen borders for debugging".
    // Cheating in that it doesn't use memory operations.

    for (let i = 0; i < 160 * 100; i++) {
        let x = i % 160
        let y = (i - x) / 160
        if (y == 0 || y == 99 || x == 0 || x == 159) {
            memory[video.ram_start + i] = 0xff
        }
    }

    update_screen()



    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }



    function encode(asm) {

    }

    function decode(start_addr) {
        println("decode")
        if (start_addr !== null) {
            memory.pointer = start_addr
            //println(["mp", memory.pointer, start_addr])
        }
        let counter = 0
        let [cmd, value, address, addr1, addr2] = Array(5).fill(null)
        while (cmd != "halt" && counter < 30) {

            counter++
            let pointer = memory.pointer

            let code = memory.step()
            cmd = cpu.get_instruction(code).asm

            //println([pointer, code, cmd])
            //console.log(pointer, code, cmd)

            if (["mov", "add"].includes(cmd)) {
                value = memory.step()
                address = read_address()
            }
            else if (cmd == "jmp") {
                address = read_address()
            }
            else if (cmd == "copy") {
                addr1 = read_address()
                addr2 = read_address()
            }
            else {
                //nop, halt
            }
            //println([value, address, addr1, addr2])
            let output = [hexify(pointer, 4),
                cmd,
            hexify(value, 2),
            hexify(address, 4),
            hexify(addr1, 4),
            hexify(addr2, 4)]
            //return output
            println(output.join(" "))
        }

    }

    println("Dump")
    dump_memory(0x0000, 15)
    decode(0x0000)

    dump_memory(0x0100, 15)
    decode(0x0100)


    dump_memory(0xff11, 31)
    decode(0xff11)
    dump_memory(0xff40, 31)
    decode(0xff40)

    memory.pointer = 0

    async function run() {
        //function run() {
        memory.pointer = 0
        let max_loops = 160 * 100
        let cur_loop = 0;
        while (asm.halt != cpu.step()) {
            update_ui()
            update_screen()
            cur_loop++
            if (cur_loop == max_loops) break
            await delay(1)
            clear("memview")
            dump_memory(0xff11, 16)

        }
    }
    run()

    println("hellurei")
    println("end")

})();
