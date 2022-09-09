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

    constructor(memory) {
        this.memory = memory
    }

    dump_memory(start_address, length, elem_id) {
        let memory = this.memory
        if (!start_address) start_address = 0;
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
            if (length == i - start_address ||
                (!length && chr == this.asm.halt)) {
                rows.push(row.join(" "))
                break
            }
        }
        println(rows.join("\n"), elem_id || "memview")
    }

    echo(str, element_id) {
        if (["Control", "Shift", "Alt", "Escape"].includes(str)) return
        if (str == "Enter") {
            this.parse_buffer()
            str = "\n>"

        }
        if (str == "Tab") {
            str = "\t"
        }

        if (str == "ArrowUp") {
            str = ""
            let start = inputbuffer.slice(0, -1).lastIndexOf("\n>") + 1
            inputbuffer = inputbuffer.concat(inputbuffer.slice(start, -1))

        }

        if (str == "Backspace" && inputbuffer.length > 1) {
            inputbuffer.pop();
        } else {
            if (str == ' ') str = " "
            inputbuffer.push(str)
        }
        console.log(inputbuffer.join(""))

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

        const tokens = command.replace(",", " ").split(" ").filter(n => n.trim())
        const commands = {
            "dump": (params) => {
                clear("memview")
                params = params.slice(1)
                console.log(params, Number(params[0]), Number(params[1]))
                this.dump_memory(Number(params[0]), Number(params[1], "content"))
            },
            "clear": (params) => {
                clear("memview")
            },
            "poke": (params) => {
                params = params.slice(1)
                this.memory[Number(params[0])] = Number(params[1])
            }

        }
        console.log(tokens)
        if (tokens[0] in commands) {

            commands[tokens[0]](tokens)
        }

    }

}


