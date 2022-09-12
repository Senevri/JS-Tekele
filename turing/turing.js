import { hexify, println, clear } from "./util.js"
import Console from "./cmdline.js"
import CPU from "./cpu.js"
import Memory from "./memory.js"
import Vidchip from "./vidchip.js"
(function () {

    //document.getElementById("content").innerText += "asdf"

    println("Hello world")




    let memory = new Memory(65535)

    let cmdline = new Console(memory)

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



    let video = new Vidchip(memory)

    let range = Array.from(Array(256).keys())
    //video.video.blit palette
    let b_width = 16; let b_height = 16

    let c_width = 12; let c_height = 12;
    let offset_x = 0; let offset_y = 2;
    video.blit(0x1000, b_width, b_height, 160, range)


    //video.blit and clip palette
    video.blit(0x2000, c_width, c_height, 159, video.clip(0x1000 + offset_x + 160 * offset_y, 12, 12, 160))

    var ctx
    function update_screen(elem_id, start, end, monochrome) {
        //console.log(elem_id, start, end)
        elem_id = elem_id || "screen"
        var canvas = document.getElementById(elem_id)
        ctx = canvas.getContext('2d')
        var monochrome = Boolean(monochrome)
        var start_address = undefined !== start ? start : video.ram_start
        var end_address = end || video.ram_end
        var old_value = 0
        //console.log(start_address, end_address)

        var style = null

        const scale = canvas.width / video.pixelwidth
        const bitscale = 32 / 8

        var imageData = ctx.createImageData(canvas.width, canvas.height)
        for (let i = 0; i != end_address - start_address; i++) {
            var value = memory[start_address + i]
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
    //update_screen()

    memory.pointer = 0x000
    memory.append([
        asm.jmp, 0x0200, //leave the first 255 bytes for data

    ])
    memory.pointer = cpu.memory_map.flags.halt
    // memory.append([
    //     0x01
    // ])

    memory.pointer = cpu.memory_map.mem_start //start of memory
    memory.append([
        asm.jmp, 0xff11
    ])
    memory.pointer = 0xff11
    memory.append([
        asm.mov, 0x00, 0xa0a1, //vidram + 161, keep border whole
        asm.add, 0x01, 0xff14, //increment position
        asm.add, 0x01, 0xff12, //increment value
        asm.add, 0x01, 0x00, 0x01, //not parsed correctly if word. This is why need actual asm
        asm.jeq, 0xff, 0xff14, 0xff40, //jump to 0xff40 if value = ff
        asm.copy, 0xff14, 0x00, 0x01, //need to pad input
        asm.jmp, 0xff11
    ])
    memory.pointer = 0xff40
    memory.append([
        asm.add, 0x01, 0xff13, //increment top byte of position
        asm.jeq, 0xfe, 0xff13, 0xff60, //if maxes out,
        asm.jmp, 0xff11,
        asm.nop
    ])
    memory.pointer = 0xff60
    memory.append([
        asm.mov, 0xa0, 0xff13, //reset top byte to start of vidram
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

    let image_bytes = arr.join("").split("").map(val => val == "#" ? 0xff : 0x00)
    memory.write(cpu.memory_map.mem_start + 3, image_bytes)
    video.blit(addr, 8, 8, 160, image_bytes)
    // arr.forEach((row, i) => {
    //     println(row.replace(/ /g, "."))
    //     const num_arr = row.split('').map((val) => {
    //         return val == "#" ? 0xff : 0x00
    //     })
    //     console.log(num_arr)
    //     memory.write(addr + 160 * i, num_arr)

    // })

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
    update_screen("memscreen", 0, memory.length, /*"monochrome"*/)


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
    // dump_memory(0x0000, 15)
    // decode(0x0000)

    // dump_memory(0x0100, 15)
    // decode(0x0100)


    // dump_memory(0xff11, 31)
    // decode(0xff11)
    // dump_memory(0xff40, 31)
    // decode(0xff40)
    println(hexify(video.ram_start))

    //dump_memory(0xa000, 16000)

    memory.pointer = 0

    async function run() {
        //function run() {
        //memory.pointer = 0
        let max_loops = 160 * 100
        let cur_loop = 0;
        while (true) {
            cpu.step()
            update_ui()
            update_screen()
            //update_screen("memscreen", 0, memory.length)
            cur_loop++
            if (cur_loop == max_loops) break
            await delay(1)
            clear("memview")
            cmdline.dump_memory(0x0000, 0x200)

        }
    }
    run()

    class InputDevice {

        constructor(address, length_in_bytes) {
            this.address = address
            this.length = length_in_bytes
        }

        write(byte_array) {
            //console.log("write")
            if (byte_array.length > this.length) {
                console.log(byte_array, this.length)
                println("Error: Length of array " + byte_array.toString() + "was longer than device length of " + this.length)
            }
            for (const [index, value] of byte_array.entries()) {
                memory[this.address + index] = value
            }
        }
        read() {
            //console.log("read")
            output = new Uint8Array(this.length)
            for (i = 0; i < this.length; i++) {
                output += memory[this.address + i]
            }
            return output

        }

    }
    let kbdDevice = new InputDevice(cpu.memory_map.io, 3)
    kbdDevice.keyCodes = ["-1"]

    kbdDevice.keyCodes = kbdDevice.keyCodes.concat(
        `0123456789abcdefghijklmnopqurstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!"#$%&/()=?+-\\*_,.;:`
            .split(""))
    kbdDevice.keyCodes = kbdDevice.keyCodes.concat([
        "Enter",
        "Escape",
        "Space",
        "Backspace"
    ])


    function readkbd() {
        document.addEventListener('keydown', function (event) {
            if (["Space", "ShiftLeft", "AltLeft", "ControlLeft", "Tab"].includes(event.code) &&
                event.target === document.body) {
                event.preventDefault()
            }

            let input = new Uint8ClampedArray(3)
            let flags = [event.ctrlKey, event.altKey, event.shiftKey]
            let flagbytes = flags[0] + (flags[1] << 1) + (flags[2] << 2)
            let key = event.key
            if (event.key == "¤") key = "$"
            cmdline.echo(key)
            input = [0, kbdDevice.keyCodes.indexOf(key), flagbytes]
            //console.log(hexify(input[1]), hexify(input[2]))

            kbdDevice.write(input)
            //console.log(event)
            //clear("memview")
            //cmdline.dump_memory(cpu.memory_map.io, 3)
        })
    }
    readkbd()


    println("hellurei")
    println("end")

})();
