// Memory = (function(){
import rom from "./rom.js"
import { println, hexify, assert } from "./util.js"
import ROM from "./rom.js"
export default class Memory extends Uint8Array {

    petsciirom_base64 = ROM.petsciirom_base64.join("")

    get pointer() {
        // console.log("get", hexify((this[0]<<8) + this[1]))
        return (this[0]<<8) + this[1]
    }

    set pointer(pointer) {
        if (pointer) {
            
            this[0] = pointer >> 8
            this[1] = pointer & 0xff
            assert(pointer == (this[0] << 8)+this[1])
            
            /*
            console.log("hex", hexify(this[0]), hexify(this[1]), hexify(pointer))
            console.log("set", pointer, (this[0] << 8) + this[1])
            */      
        }
    }

    test_rom(col_bits) { //Only works in 160w mode correctly
        if (!col_bits) col_bits = 8
        const rom = this.petsciirom_base64
        let max_bits = 8 / col_bits
        const num_per_row = 20 * max_bits
        const max_rows = 12 / max_bits
        const vals = Uint8Array.from(this.slice(0xe000, 0xe000 + 8 * num_per_row * max_rows))
        this.pointer = 0xa000
        const color = (col_bits == 8 ? 255 : 2);
        let i = 0

        while (8 * i + 8 <= vals.length) {
            i++
            if (i == max_rows * num_per_row + 1) break;
            for (let b of vals.slice(8 * (i - 1), 8 * i)) {
                this[this.pointer] = 0
                let bitstring = b.toString(2).padStart(8, "0")
                //this[this.pointer] = 0

                for (let bitstring_pos = 0; bitstring_pos < bitstring.length; bitstring_pos += max_bits) {
                    let bits = bitstring.slice(bitstring_pos, bitstring_pos + max_bits)
                    if (max_bits == 1) {
                        this[this.pointer] = (bits[0] == "1" ? color : 0)
                    } else {
                        this[this.pointer] = (bits[0] == "1" ? color << 4 : 0)
                        this[this.pointer] += (bits[1] == "1" ? color : 0)
                    }

                    this.pointer++
                    this[this.pointer] = 0
                }
                this.pointer = this.pointer + 160 - col_bits //depends on vidrom width
            }


            if (i % num_per_row) {
                this.pointer = this.pointer + col_bits - 8 * 160
            } else {
                this.pointer = this.pointer + col_bits - col_bits * num_per_row
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
