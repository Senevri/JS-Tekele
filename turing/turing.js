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
            println(arr)
            arr.forEach((e)=>{
                if (e>255){
                    this.push(Math.floor(e/256))
                    this.push(e % 256)
                } else {
                    this.push(e)
                }

            })
        }
        step(){
            return this[this.pointer++]
        }

        w_step(){
            var word = this.step()*256
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

    var registers = {
        "ax":0xfe
    }


    let asm = {
        "nop": 0x01,
        "halt": 0x00,
        "jmp": 0x02,
        "mov": 0x03,
        "add": 0x04,
        "copy": 0x05
    }

    let opcodes = Object.keys(asm).reduce((obj, key)=>{obj[asm[key]] = key; return obj}, {})

    let instructions = {
        "nop": function() {
            //println("")
        },
        "jmplong": function() {
            target_address = read_address()
            memory.pointer = target_address
            return " " + hexify(target_address, 4)
        },
        "mov": function() {
            value = memory.step()
            address = read_address()
            memory[address] = value
            return " " + value + " to " + address
        },
        "add": function() {
            value = memory.step()
            address = read_address()
            memory[address] += value
            return " " + value + " to " + address
        },
        "copy": function() {
            // Normally this would require registers but we can cheat
            addr1 = read_address()
            addr2 = read_address()
            value = memory[addr1]
            memory[addr2] = value
            return " " + value + " from  " + addr1 + " to " + addr2
        }

    }

    let ops = {
        [asm.nop]: instructions.nop,
        [asm.jmp]: instructions.jmplong,
        [asm.mov]: instructions.mov,
        [asm.add]: instructions.add,
        [asm.copy]: instructions.copy,
    }

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
        max_lines = 40
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

    var ctx
    function update_screen(){
        var canvas = document.getElementById("screen")
        ctx = canvas.getContext('2d')
        var monochrome = false
        var start_address = 0xa000
        var end_address = 0xde80
        var old_value = 0

        var style = null

        var imageData = ctx.createImageData(canvas.width, canvas.height)
        for (i=0; i!=160*100;i++){
            var value = memory[start_address+i]
            if (monochrome) {
                var r = value
                var g = r
                var b = r
            } else {
                color = value
                var r = (color % 4) * 64
                var g = ((color >> 2) % 8) * 32
                var b = ((color >> 5) % 8) * 32
            }
            var x = i % 160
            var y = Math.floor(i/160)
            for (zi=0;zi<3;zi++) {
                for (j=0;j<3;j++) {
                    position = ((x*3)+(3*(y*canvas.width)))*4
                    position = position + ((zi+j*canvas.width)*4)
                    imageData.data[position] = r
                    imageData.data[position+1] = g
                    imageData.data[position+2] = b
                    imageData.data[position+3] = 255
                }
            }

        }
        ctx.putImageData(imageData,0,0)
    }



    memory.append([
        asm.jmp, 0x01, 0x00, //leave the first 255 bytes for data
        asm.nop,
        asm.nop,
        asm.nop,
    ])
    memory.pointer = 0x0100
    memory.append([
        asm.mov, 13, 0x00, 0x20,
        asm.jmp, 0xff, 0x11
    ])
    memory.pointer = 0xff11
    memory.append([
        asm.mov, 0x00, 0xa000,
        asm.mov, 0x00, 0xa000+160,
        asm.mov, 0x00, 0xa000+320,
        asm.mov, 0x00, 0xa000+480,
        //asm.add, 0x05, 0xBE9D,
        //asm.add, 0x05, 0xBE9E,
        //asm.add, 0x01, 0xff, 0x13,
        asm.add, 0x01, 0xff14,
        asm.add, 0x01, 0xff12,
        asm.add, 0x01, 0xff14+0x04,
        asm.add, 0x02, 0xff12+0x04,
        asm.add, 0x01, 0xff14+0x08,
        asm.add, 0x03, 0xff12+0x08,
        asm.add, 0x01, 0xff14+0x0c,
        asm.add, 0x04, 0xff12+0x0c,
        asm.copy, 0xff14, 0x00, 0x01, //need to pad input
        //asm.jmp, 0xff, 0x2d, //jump past data bytes
        //100, 100,
        //asm.mov, 0xff, 0xa0 ,0x00,
        asm.jmp, 0x0100
    ])

    memory.pointer = 0xa000 + 50 * 160 + 80 - 2
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
        println(row)
        num_arr = row.split('').map((val)=>{
            return val == "#" ? 0xff: 0x00
        })

        memory.write(addr + 160*i, num_arr)
    })

    var op_counter = 0

    function step() {
        let cur_ptr = memory.pointer
        op = memory.step()
        //print(cur_ptr.toString(16).padStart(4, "0") + ": " + opcodes[op])
        msg = ops[op]()
        //println(cur_ptr.toString(16).padStart(4, "0") + ": " + opcodes[op] + msg)
        op_counter++
        return op
    }

    function delay(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
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
            cmd = opcodes[code]
            //println([pointer, code, cmd])


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
            output = [hexify(pointer,4),
                cmd,
                hexify(value , 2),
                hexify(address,4),
                hexify(addr1, 4),
                hexify(addr2, 4)]
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

    async function run() {
    //function run() {
        memory.pointer = 0
        max_loops = 160*100
        cur_loop = 0;
        while (asm.halt != step()) {
            update_ui()
            update_screen()
            cur_loop++
            if (cur_loop == max_loops) break
            await delay(0)
            //dump_memory(0xff11, 16)
        }
    }
    run()

    println("hellurei")
    println("end")

})();
