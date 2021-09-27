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
        "copy": 0x05,
        "jmeq":0x06,
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
        },
        "jmeq": function() {
            // Jump if memory equals; cheat...
            value = memory.step()
            addr1 = read_address()
            addr2 = read_address()
            //if addr1 == value, jump to addr2
            memory.pointer = memory[addr1] == value ? addr2 : memory.pointer
            return " " + value + " in " + addr1 + " jmp " + addr2
        }

    }

    let ops = {
        [asm.nop]: instructions.nop,
        [asm.jmp]: instructions.jmplong,
        [asm.mov]: instructions.mov,
        [asm.add]: instructions.add,
        [asm.copy]: instructions.copy,
        [asm.jmeq]: instructions.jmeq,
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
            //set red
            for (var i=0;i<this.palette.length+3;i+=3){
                let x = (i/3)%16
                let y = Math.floor(i/3 / 16)

                this.palette[i]= 0.8*x*1.5*y*4-(16-x)-(16-y)

                let dx = 8-Math.abs(x-8)
                let dy = 8-Math.abs(y-8)
                this.palette[i+1]=(16*y-dy*16)+x*8-((16-y)*8)
                this.palette[i+2]=(16*x-dx*16)+x*8-((y)*8)

                //console.log(i,x,y,Math.floor(i/3))
            }
            for (var i=0;i<this.palette.length/(3);i++){
                let x=i % 16
                let y=Math.floor(i / 16)
                //this.palette[i*3] = r//r
                //this.palette[1+i*3] = g//g
                //this.palette[2+i*3] = (x*y)
            }
            //this.palette[15*3+48*15]=255
            //this.palette[3]=255
            //this.palette[15+48*15+1]=255
            //this.palette[15+48*15+1]=255
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

    dump_memory(0x1000,768)


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
        asm.mov, 13, 0x00, 0x20,
        asm.jmp, 0xff, 0x11
    ])
    memory.pointer = 0xff11
    memory.append([
        asm.mov, 0x00, 0xa0f4,
        // asm.mov, 0x00, 0xa0a1+160,
        // asm.mov, 0x00, 0xa0a1+320,
        // asm.mov, 0x00, 0xa0a1+480,
        //asm.add, 0x05, 0xBE9D,
        //asm.add, 0x05, 0xBE9E,
        //asm.add, 0x01, 0xff, 0x13,
        asm.add, 0x01, 0xff14,
        asm.add, 0x01, 0xff12,
        asm.add, 0x01, 0x00, 0x01,
        asm.jmeq, 0xff, 0xff14, 0xff40,
        // asm.add, 0x01, 0xff14+0x04,
        // asm.add, 0x01, 0xff12+0x04,
        // asm.add, 0x01, 0xff14+0x08,
        // asm.add, 0x01, 0xff12+0x08,
        // asm.add, 0x01, 0xff14+0x0c,
        // asm.add, 0x01, 0xff12+0x0c,
        asm.copy, 0xff14, 0x00, 0x01, //need to pad input
        //asm.jmp, 0xff, 0x2d, //jump past data bytes
        //100, 100,
        //asm.mov, 0xff, 0xa0 ,0x00,
        asm.jmp, 0xff, 0x11
    ])
    memory.pointer = 0xff40
    memory.append([
        asm.add, 0x01, 0xff13,
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
        println(row)
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

    var op_counter = 0

    function step() {
        let cur_ptr = memory.pointer
        op = memory.step()
        //print(cur_ptr.toString(16).padStart(4, "0") + ": " + opcodes[op])
        msg = ops[op]()
        println(cur_ptr.toString(16).padStart(4, "0") + ": " + opcodes[op] + msg)
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
    dump_memory(0xff40, 31)
    decode(0xff40)

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
