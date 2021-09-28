(function() {

    //document.getElementById("content").innerText += "asdf"

    let disable_printing = false

    function print(str, element_id) {
        if (disable_printing) return
        if (!element_id) element_id = "content"
        document.getElementById(element_id).innerText += str
    }
    function println(str, element_id) {
        if (disable_printing) return
        if (!element_id) element_id = "content"
        document.getElementById(element_id).innerText += str + "\n"
    }
    println("Hello world")


    class Memory extends Uint8Array {
        pointer = 0

        push(uint8) {
            this[this.pointer] = uint8
            this.pointer++
        }

        append(arr){
            //println(arr)
            arr.forEach((e)=>{
                if (e>0xff){ // big endian
                    this.push(e >> 8)
                    this.push(e & 0xff)
                } else {
                    this.push(e)
                }
                let p=this.pointer-1
            })
        }
        step(){
            return this[this.pointer++]
        }

        w_step(){
            var word = this.step() << 8
            word += this.step()
            return word
        }

        write(address, arr) {
            arr.forEach((e, i)=> {
                this[address+i] = e
            })
        }
    };

    var memory = new Memory(65535)
    //let memory = []


// "CPU"

    function to_word(b1, b2){
        return b1 << 8 + b2
    }
    function get_lo_hi(word) {
        return [
            word & 0xff,
            word >> 8
        ]
    }

    class CPU {
// set up instructions by bytelength, with like,
// 0 x 0 1
//     ^ ^
//     | +- instruction
//     +--- instruction parameter length in bytes
// ideas:
// if length = 1,   operate with acc. Works with add, mov.
//                  jmp, however, should move forwards in program relative to
//                  program counter.
// if length = 2    jmp to address, add, mov add 2 bytes to acc.
// - note: little endian vs big endian? little-endian makes some sense...
//
        memory_map = {
            pc              : 0x0001, // equal to memory.pointer
            zeropage        : 0x0000,
            flags           : {
                accumulator : 0x0002,
                halt        : 0x0004
            },
            stack           : 0x0100, //stack pointer
            mem_start       : 0x0200, //maybe?
        }
        acc_ptr = memory_map.flags.accumulator

        //memory=null

        // constructor(memory){
        //     this.memory = memory
        // }

        // use list index for bytecount
        opcode_types = [
            "halt", "nop", "jmp", "mov", "add", "copy", "jeq", "jne"
        ]

        get_instruction(opcode) {
            let type = opcode & 0xf
            let length = (opcode & 0xf0) >> 4
            //console.log(hexify(memory.pointer, 4), opcode, type, this.opcode_types[type], length)
            return {asm: this.opcode_types[type], length: length}
        }

        instructions = {
            nop: [
                ()=>{} // 0
            ],
            halt: [
                ()=>{memory[this.memory_map.flags.halt] = 0x01}
            ],
            jmp: [
                ()=>{},
                ()=>{
                    let value = memory.step()
                    memory.pointer += value
                },
                ()=>{
                    let address = memory.w_step()
                    memory.pointer = address
                    //console.log("jump to", hexify(address,4), hexify(memory.pointer, 4))
                }
            ],
            mov: {
                0: null,
                1: ()=>{
                    let value = memory.step()
                    memory[acc_ptr] = value
                },
                2: null,
                3: ()=>{ //3
                    let value = memory.step()
                    let address = memory.w_step()
                    memory[address] = value
                },
                4: ()=>{ //4 // should this be copy or mov?
                    let value = memory.w_step()
                    let address = memory.w_step()
                    memory[address] = value
                }

            },
            add: {
                0: null,
                1: ()=>{
                    console.log("add to acc")
                    let value = memory.step()
                    memory[acc_ptr] += value
                },
                2: null,
                3: ()=>{ // add byte to target
                    let value = memory.step()
                    let address = memory.w_step()
                    memory[address] += value
                },
                4: ()=>{ //add word to target
                    console.log("add word")
                    let value = memory.w_step()
                    let address = memory.w_step()
                    let bytes = get_lo_hi(value)
                    memory[address+1] = bytes[0]
                    memory[address] = bytes[1]
                }
            },
            copy: [
                ,
                ,
                ,
                ,
                ()=>{
                    let addr1 = memory.w_step()
                    let addr2 = memory.w_step()
                    memory[addr2] = memory[addr1]
                }
            ],
            jeq: [
                ,
                ,
                ,
                ()=>{
                    console.log("jeq 3")
                    let value = memory.step()
                    let address = memory.w_step()
                    memory.pointer = memory[acc_ptr] == value ?
                    address :
                    memory.pointer;
                },
                ,
                () => {
                    //console.log("jeq 5")
                    let value = memory.step()
                    let addr1 = memory.w_step()
                    let addr2 = memory.w_step()
                    //if addr1 == value, jump to addr2
                    memory.pointer = memory[addr1] == value ? addr2 : memory.pointer
                }
            ],
            jne: {
                0: null,
                1: null,
                2: null,
                3: () => {
                    let value = memory.step()
                    let address = memory.w_step()
                    memory.pointer = address ? memory[acc_ptr] == value : memory.pointer
                },
                4: () => {
                    let value = memory.step()
                    let value2 = memory.step()
                    let address = memory.w_step()
                    memory.pointer = address ? value2 == value : memory.pointer
                }
            }
        }
        process_opcode(asm, length) {
            let pc = this.memory_map.pc
            // generate message
            var bytes = []
            if (length > 0) {
                bytes = Array.from(memory.slice(pc, length))
            }
            //console.log("bytes",bytes)
            let msg = [" "]
            while (bytes.length > 0) {
                if (bytes.length % 2 ===0) {
                    msg.push(hexify(bytes[0] + bytes[1], 4))
                    bytes.shift()
                    bytes.shift()
                } else {
                    msg.push(hexify(bytes[0], 2))
                    bytes.shift()
                }
            }
            let instruction = this.instructions[asm][length]
            //console.log(asm, length, this.instructions[asm])
            instruction()
            memory[this.memory_map.pc] = memory.pointer
            return [asm].concat(msg).join(" ")
        }



        step() {
            let cur_ptr = memory.pointer
            let op = memory.step()
            let instruction = this.get_instruction(op)
            //console.log(instruction, memory.slice(cur_ptr, cur_ptr+instruction.length+1), op, "current address:", hexify(cur_ptr,4))
            let msg = this.process_opcode(instruction.asm, instruction.length)
            println(hexify(cur_ptr,4) + ": " + msg)
            op_counter++
            return op
        }
    }

    let cpu = new CPU

    let asm = {
        "nop": 0x01,
        "halt": 0x00,
        "jmp": 0x22, // = 32+2
        "mov": 0x33,
        "add": 0x34,
        "copy": 0x45,
        "jeq":0x56,
    }

    var opcodes = {}
    cpu.opcode_types.forEach((name, index)=>{
        for (var i=0;i<8;i++) {
            opcode = (i << 4) + index
            opcodes[opcode] = name
        }
    })
    console.log("sanity check")
    for (key in asm) {
        console.assert(opcodes[asm[key]] == key)
        console.assert(cpu.get_instruction(asm[key]).length == asm[key] >> 4)
    }
    //console.log(opcodes)

// Helpers

    function read_address(){
        return memory.w_step()
    }

    function hexify(int, pad) {
        if (int == null) return null
        return int.toString(16).toUpperCase().padStart(pad, "0")
    }


    function dump_memory(start_address, length) {
        if (!start_address) start_address = 0;
        println("memory size: " +memory.length)
        let rows = []
        let row = []
        row.push(hexify(start_address,4))
        for (i = start_address; i<memory.length; i++) {
            chr = memory[i]
            row.push(hexify(chr,2))
            if (row.length == 8+1) {
                rows.push(row.join(" "))
                row = []
                row.push(hexify(i,4))

            }
            if (length == i-start_address ||
                (!length && chr==asm.halt)) {
                rows.push(row.join(" "))
                break
            }
        }
        println(rows.join("\n"))
    }


    function update_ui() {
        max_lines = 30
        document.getElementById("memory_pointer").innerText = ""
        println(memory.pointer.toString(), "memory_pointer")
        document.getElementById("opcounter").innerText = ""
        println(op_counter.toString(), "opcounter")
        lines = document.getElementById("content").innerText.split("\n")
        if (lines.length>max_lines) {
            document.getElementById("content").innerText = lines.slice(-max_lines-1).join("\n")
        }

        //println(memory.toString())
    }


// "screen chip"


    function clear_screen(){
        var canvas = document.getElementById("screen")
        var ctx = canvas.getContext('2d')
        ctx.fillStyle = "black"
        ctx.fillRect(0,0, canvas.width, canvas.height)
    }
    clear_screen()

    class Vidchip {
        //ram area used by vidchip currently
        ram_start=0xa000
        ram_end=0xde80
        pixelwidth=160
        pixelheight=100
        palette = new Uint8ClampedArray(768)
        constructor() {
            this.init_palette()
        }

        init_palette() {
            for (var i=0;i<this.palette.length+3;i+=3){
                let x = (i/3)%16
                let y = Math.floor(i/3 / 16)

                this.palette[i]= 0.8*x*1.5*y*4-(16-x)-(16-y)

                let dx = 8-Math.abs(x-8)
                let dy = 8-Math.abs(y-8)
                this.palette[i+1]=(16*y-dy*16)+x*8-((16-y)*8)
                this.palette[i+2]=(16*x-dx*16)+x*8-((y)*8)
            }
        }
    }

    let video = new Vidchip()

    function clip(address, width, height, step){
        data = []
        memory.pointer=address
        var counter=0
        var heightcounter=0
        for (i=0;i<width*height;i++) {
             if (counter==width){
                 //memory.pointer += 480-48//(160*3-48)
                 memory.pointer += step-width
                 counter=0
                 heightcounter++
            }
            data.push(memory.step())
            counter++
        }
        return data
    }

    function blit(address, width, height, step, data) {
        memory.pointer=address
        var counter=0
        var heightcounter=0
        for (i=0;i<width*height;i++) {
             if (counter==width){
                 //memory.pointer += 480-48//(160*3-48)
                 memory.pointer += step-width
                 counter=0
                 heightcounter++
            }
            memory.push(data[i])
            counter++
        }
    }
    let range = Array.from(Array(256).keys())
    //blit palette
    blit(0x1000,16,16,160,range)

    //blit and clip palette
    blit(0x2000,8,8,160,clip(0x1000+8+160*8,8,8,160))

    var ctx
    function update_screen(){
        var canvas = document.getElementById("screen")
        ctx = canvas.getContext('2d')
        var monochrome = false
        var start_address = 0x0000
        var end_address = 0xffff
        var old_value = 0

        var style = null

        scale = canvas.width/video.pixelwidth
        bitscale = 32/8

        var imageData = ctx.createImageData(canvas.width, canvas.height)
        for (i=start_address; i!=end_address;i++){
            var value = memory[start_address+i]
            if (monochrome) {
                var r = value
                var g = r
                var b = r
            } else { //gotta be paletted anyway.
                color = value
                // var r = (color % 4) * 64
                // var g = ((color >> 2) % 8) * 32
                // var b = ((color >> 5) % 8) * 32
                var r = video.palette[3*color]
                var g = video.palette[3*color+1]
                var b = video.palette[3*color+2]
            }
            var x = i % 160
            var y = Math.floor(i/160)
            for (zi=0;zi<scale;zi++) {
                for (j=0;j<scale;j++) {
                    position = ((x*scale)+(scale*(y*canvas.width)))*bitscale
                    position = position + ((zi+j*canvas.width)*bitscale)
                    imageData.data[position] = r
                    imageData.data[position+1] = g
                    imageData.data[position+2] = b
                    imageData.data[position+3] = 255
                }
            }

        }
        ctx.putImageData(imageData,0,0)
    }
    update_screen()

    memory.pointer=0x000
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
    memory.pointer =0xff60
    memory.append([
        asm.mov, 0xa0, 0xff13,
        asm.jmp, 0xff11
    ])


    memory.pointer = video.ram_start + 50 * 160 + 80 - 2
    addr = memory.pointer


    arr = [
        " ###### ",
        "#      #",
        "# #  # #",
        "#      #",
        "# #  # #",
        "#  ##  #",
        "#      #",
        " ###### ",
    ]

    arr.forEach((row, i)=>{
        println(row.replace(/ /g,"."))
        num_arr = row.split('').map((val)=>{
            return val == "#" ? 0xff: 0x00
        })

        memory.write(addr + 160*i, num_arr)
    })

    // draw "screen borders for debugging".
    // Cheating in that it doesn't use memory operations.

    for (i=0;i<160*100;i++) {
        x = i % 160
        y = (i-x)/160
        if (y==0 || y==99 || x==0 || x==159) {
            memory[video.ram_start+i] = 0xff
        }
    }

    update_screen()
    var op_counter = 0



    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }



    function encode(asm) {

    }

    function decode(start_addr){
        println("decode")
        if (start_addr!==null) {
            memory.pointer = start_addr
            //println(["mp", memory.pointer, start_addr])
        }
        var counter = 0

        while (cmd != "halt" && counter < 30) {
            var cmd = value = address = addr1 = addr2 = null
            counter++
            pointer = memory.pointer

            code = memory.step()
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
            let output = [hexify(pointer,4),
                cmd,
                hexify(value , 2),
                hexify(address,4),
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

    memory.pointer=0

    async function run() {
    //function run() {
        memory.pointer = 0
        max_loops = 160*100
        cur_loop = 0;
        while (asm.halt != cpu.step()) {
            update_ui()
            update_screen()
            cur_loop++
            if (cur_loop == max_loops) break
            await delay(1)
            //dump_memory(0xff11, 16)
        }
    }
    run()

    println("hellurei")
    println("end")

})();
