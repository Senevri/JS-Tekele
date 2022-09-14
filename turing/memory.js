// Memory = (function(){
import rom from "./rom.js"
import { println, hexify } from "./util.js"
import ROM from "./rom.js"
export default class Memory extends Uint8Array {

    pointer = 0
    petsciirom_base64 = ROM.petsciirom_base64.join("")

    test_rom() { //Only works in 160w mode correctly
        const rom = this.petsciirom_base64
        const num_per_row = 20
        const max_rows = 12
        const vals = Uint8Array.from(this.slice(0xe000, 0xe000 + 8 * num_per_row * max_rows))
        console.log(vals)
        this.pointer = 0xa000
        let i = 0
        while (8 * i + 8 <= vals.length) {
            i++
            if (i == max_rows * num_per_row + 1) break;
            for (let b of vals.slice(8 * (i - 1), 8 * i)) {
                for (let c of b.toString(2).padStart(8, "0")) {
                    this.push([c == "1" ? 255 : 0])
                }
                this.pointer = this.pointer + 152 //depends on vidrom width
            }

            if (i % num_per_row) {
                console.log(i)
                this.pointer = this.pointer + 8 - 8 * 160
            } else {
                console.log("newline", i)
                this.pointer = this.pointer + 8 - 8 * num_per_row
                //this.pointer = this.pointer - 8 * num_per_row
            }

        }
    }

    write_rom_to_memory() {
        const rom = this.petsciirom_base64
        const vals = Uint8Array.from(atob(rom), c => c.charCodeAt(0))
        this.pointer = 0xe000
        this.append(vals.slice(0, 12 * 20 * 8))
    }

    push(uint8) {
        this[this.pointer] = uint8
        this.pointer++
    }

    clear(start, end, value) {
        if (!value) value = 0
        console.log(start, end, value)
        for (let i = start; i < end + 1; i++) {
            this[i] = value
            //assert(this[i] == value)
        }
    }

    append(arr) {
        //console.log("append input", arr.map(v => hexify(v)))
        arr.forEach((e) => {
            if (e > 0xff) { // big endian
                this.push(e >> 8)
                this.push(e & 0xff)
            } else {
                this.push(e)
            }
            let p = this.pointer - 1
        })
    }

    step() {
        return this[this.pointer++]
    }

    w_step() {
        var word = this.step() << 8
        word += this.step()
        return word
    }

    write(address, arr) {
        arr.forEach((e, i) => {
            this[address + i] = e
        })
    }
};
// return Memory
// })()
