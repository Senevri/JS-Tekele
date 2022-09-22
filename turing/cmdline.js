import { println, hexify, clear } from "./util.js"

let inputbuffer = ["\n>"]

export default class Console {

    asm = {
        "nop": 0x01,
        "halt": 0x00,
        "jmp": 0x22, // = 32+2
        "mov": 0x33,
        "add": 0x34,
        "copy": 0x45,
        "jeq": 0x56,
    }

    constructor(video, cpu) {
        this.autodump_on = true
        this.cpu = cpu
        this.memory = cpu.memory
        this.video = video
        this.dump_range = { start: 0x00, end: 0x200 }
        this.delay = 1
    }

    dump_memory(start_address, length, elem_id) {
        let memory = this.memory
        if (undefined === start_address) start_address = this.dump_range.start;
        if (undefined === length) length = this.dump_range.end - this.dump_range.start
        //println("memory size: " + memory.length)
        let rows = []
        let row = []
        row.push(hexify(start_address, 4))
        for (let i = start_address; i < memory.length; i++) {
            let chr = memory[i]
            row.push(hexify(chr, 2))
            if (row.length == 8 + 1) {
                rows.push(row.join(" "))
                row = []
                row.push(hexify(i + 1, 4))

            }
            if (length == i - start_address) {
                rows.push(row.join(" "))
                break
            }
        }
        println(rows.join("\n"), elem_id || "memview")
    }

    lastArrowUp = 0    

    echo(str, element_id) {
        if (["Control", "Shift", "Alt", "Escape"].includes(str)) return
        if (str == "Enter") {
            this.lastArrowUp = 0
            console.log(inputbuffer.join(""))
            this.parse_buffer()
            str = "\n>"

        }
        if (str == "Tab") {
            str = "\t"
        }

        const getBufferLine = () => {
            let end = -1
            let start = -1
            for (let i=0; i<this.lastArrowUp; i++) {
                end = start
                start = inputbuffer.slice(0, start).lastIndexOf("\n>")
                console.log(start, end, inputbuffer.slice(start+1, end))
            }
            inputbuffer = inputbuffer.concat(inputbuffer.slice(start+1, end))   
        }
        const clearCurrentLine =  ()=> {
            if (inputbuffer[-1] != "\n>") {
                inputbuffer = inputbuffer.slice(0, inputbuffer.lastIndexOf("\n>")+1)
            }
        }

        if (str == "ArrowUp") {
            str = ""
            //clear current line
            clearCurrentLine()
            //let start = inputbuffer.slice(0, -1).lastIndexOf("\n>") + 1
            this.lastArrowUp++
            getBufferLine()

            }
        if (str == "ArrowDown") {
            console.log(this.lastArrowUp)
            
            str = ""
            clearCurrentLine()
            if (this.lastArrowUp == 0) {
              return    
            }
            this.lastArrowUp--
            getBufferLine()
        }

        if (str == "Backspace") {
            // do not put it in inputbuffer and...
             if (inputbuffer.length > 1) {
                inputbuffer.pop();
            }
        } else {
            if (str == ' ') str = " "
            inputbuffer.push(str)
        }
        //console.log(inputbuffer.join(""))

        let input = document.getElementById(element_id || "input")
        input.innerText = inputbuffer.map(k => k != "\t" ? k : "    ").join("")
        let container = document.getElementsByClassName("cmdline")[0]

        container.scrollTop = container.scrollHeight
        container.focus()
        // input.value = inputbuffer.toString()
    }


    parse_buffer() {
        const start = inputbuffer.join("").lastIndexOf("\n") + 2 // skip newline and ">"
        let command = inputbuffer.join("").slice(start)
        console.log(start, "command " + command)

        const tokens = command.replaceAll(",", " ").split(" ").filter(n => n.trim())
        const commands = {
            "autodump": (params) => {
                if (params.length == 0) {
                    this.echo("autodump_" + this.autodump_on ? "on" : "off")
                    this.echo("\n")
                } else {
                    console.log("params", params)
                    const on_off = { "on": true, "off": false }
                    if (params[0] in on_off) {
                        this.autodump_on = on_off[params[0]]
                    }
                    if (params.length == 3) {
                        this.dump_range.start = Number(params[1])
                        this.dump_range.end = Number(params[2])
                    }
                }
            },
            "dump": (params) => {
                clear("memview")
                //console.log(params, Number(params[0]), Number(params[1]))
                this.autodump_on = false
                this.dump_memory(Number(params[0]), Number(params[1], "memview"))
            },
            "clear": (params) => {
                clear("memview")
            },
            "poke": (params) => {
                const mem_start = params[0]
                const data = params.slice(1)

                for (const [i, v] of data.entries()) {
                    this.memory[Number(mem_start) + i] = Number(v)
                }

            },
            "halt": (params) => {
                this.memory[this.cpu.memory_map.flags.halt] = 0x01
            },
            "run": (params) => {
                this.memory[this.cpu.memory_map.flags.halt] = 0x00
                console.log(params, Number(params), params.length)
                if (params.lenght == 1) {

                    this.memory.pointer = Number(params[0])
                }
            },
            "delay": (params) => {
                this.delay = Number(params[0])
            },
            "cls": (params) => {
                //this.video.clear_screen()
                this.video.clear_vidram()
            },
            "cpuclock": (params) => {
                console.log("cpu clock", this.cpu.clock)
                this.cpu.clock = Number(params[0])
                console.log("cpu clock", this.cpu.clock)
            },
            "video": (params) => {
                this.video_off = false
                if (params[-1] == "off") this.video_off = true 

            } 






        }
        console.log(tokens)
        if (tokens[0] in commands) {
            commands[tokens[0]](tokens.slice(1))
        }

    }

}


