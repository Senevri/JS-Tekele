import { hexify, println, clear } from "./util.js"
import Console from "./cmdline.js"
import CPU from "./cpu.js"
import Memory from "./memory.js"
import Vidchip from "./vidchip.js"

(function () {

    println("Hello world")

    let memory = new Memory(65535)

    function to_word(b1, b2) {
        return b1 << 8 + b2
    }

    let cpu = new CPU({
        memory: memory
    })

    let asm = {
        "halt": 0x00,
        "nop": 0x01,

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
    //add sugar
    asm.sta = 0x13

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

    let video = new Vidchip(memory)
    let cmdline = new Console(video, cpu)

    function test_video() {
        let range = Array.from(Array(256).keys())
        //video.video.blit palette
        let b_width = 16; let b_height = 16

        let c_width = 12; let c_height = 12;
        let offset_x = 0; let offset_y = 2;
        video.blit(0x1000, b_width, b_height, 160, range)


        //video.blit and clip palette
        video.blit(0x2000, c_width, c_height, 159, video.clip(0x1000 + offset_x + 160 * offset_y, 12, 12, 160))
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

    //let's create a program to write the image below to screen.

    memory.pointer = cpu.memory_map.mem_start + 0x100 //0x300
    const code_block = memory.pointer
    const vid_start_pos = video.ram_start + 50 * 160 + 80 - 2
    console.log(hexify(code_block, 4), hexify(vid_start_pos, 4))

    function copy_image_to_screen() {
        memory.append([
            0x00, //row
            0x00, //column
            //asm.jmp, 0xff11, //skip non-working code for now.
            asm.jeq, 8, code_block, 0xff11, //if row 8, exit
            //asm.jeq, 8, code_block, 0x370, //if row 8, loop
            asm.copy, cpu.memory_map.mem_start + 3, vid_start_pos,
            asm.nop,
            asm.nop,
            asm.add, 1, code_block + 1,
            asm.add, 1, code_block + 10,
            asm.add, 1, code_block + 12,
            asm.jeq, 8, code_block + 1, code_block + 0x30, //if column 8,
            asm.jmp, code_block + 2 //jump to copying
        ])

        memory.pointer = code_block + 0x30
        memory.append([
            asm.mov, 0x00, code_block + 1,
            asm.add, 0x01, code_block,
            0x44, 0, 152, code_block + 11,
            asm.nop,
            asm.jmp, 0x321//code_block + 2
        ])

        memory.pointer = code_block + 0x70
        memory.append([
            asm.halt,
            asm.mov, 0x00, code_block + 1,
            asm.mov, 0x00, code_block,
            asm.mov, 0x02, code_block + 10,
            asm.mov, 0x03, code_block + 11,
            asm.mov, 0xbf, code_block + 12,
            asm.mov, 0x8e, code_block + 13,
            0x23, code_block + 13, //move value to acc
            0x24, code_block + 0x100, //add value to acc
            0x44, 0x00, 0x02, code_block + 13, //update value
            asm.halt
            //asm.jmp, 0x302
        ])

        memory.pointer = code_block + 0x100
        memory.append([0, 0])
    }

    memory.pointer = cpu.memory_map.mem_start //start of memory
    memory.append([
        0x00,
        asm.jmp, 0x0302 // skip the row data, which is also "halt" code
        //asm.jmp, 0xff11
    ])
    memory.pointer = 0xff11
    memory.append([
        asm.mov, 0x00, 0xa0a1, //vidram + 161, keep border whole
        asm.add, 0x01, 0xff14, //increment position
        asm.add, 0x01, 0xff12, //increment value
        //asm.add, 0x01, 0x00, 0x01, //not parsed correctly if word. This is why need actual asm
        asm.jeq, 0xff, 0xff14, 0xff40, //jump to 0xff40 if 0xff14 value = ff
        asm.jeq, 0xde, 0xff13, 0xff60, //if big byte maxes out,
        //asm.copy, 0xff14, 0x00, 0x01, //need to pad input
        asm.jmp, 0xff11
    ])
    memory.pointer = 0xff40
    memory.append([
        asm.add, 0x01, 0xff13, //increment top byte of position
        //asm.mov, 0x00, 0xff14 //clear low byte
        asm.jmp, 0xff11,
        asm.nop
    ])
    memory.pointer = 0xff60
    memory.append([
        asm.jeq, 0x80, 0xff14, 0xff70, //if little byte maxes out
        asm.nop,
        asm.jmp, 0xff11

    ])
    memory.pointer = 0xff70
    memory.append([ //big and little byte maxed out
        asm.halt,
        asm.mov, 0xa0, 0xff13, //reset top byte to start of vidram
        asm.mov, 0xa1, 0xff14,
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
    //video.blit(addr, 8, 8, 160, image_bytes)
    // copy bytes from written memory
    //video.blit(addr, 8, 8, 160, memory.slice(cpu.memory_map.mem_start + 3, cpu.memory_map.mem_start + 3 + 64))

    // draw "screen borders for debugging".
    // Cheating in that it doesn't use memory operations.

    for (let i = 0; i < 160 * 100; i++) {
        let x = i % 160
        let y = (i - x) / 160
        if (y == 0 || y == 99 || x == 0 || x == 159) {
            memory[video.ram_start + i] = 0xff
        }
    }

    video.update_screen()
    video.update_screen("memscreen", 0, memory.length, /*"monochrome"*/)


    function delay(ms) {
        if (delay == -1) return
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


    memory.write_rom_to_memory()
    memory.test_rom()

    update_ui()
    video.update_screen()

    async function run_system() {
        memory.pointer = 0 //clear pointer
        const video_fps = 30
        cmdline.delay = 1000 / video_fps
        let max_loops = video_fps * cpu.clock // max_loops == fps == 1khz
        while (true) {
            update_ui()
            video.update_screen()
            video.update_screen("memscreen", 0, memory.length)
            await delay(cmdline.delay) //min 4 ms

            //for (let cur_loop = 0; cur_loop < max_loops; cur_loop++) {
            //    cpu.step() //run max_loops steps per screen update
            //}

            if (cmdline.autodump_on) {
                clear("memview")
                cmdline.dump_memory()
            }
            max_loops = video_fps * cpu.clock
        }
    }
    run_system()

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

