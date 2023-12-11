import {get_lo_hi} from "./util.js"

const old_instructionset = {
    memory: null,
    get_instruction(opcode) {

        let type = opcode & 0x0f //max 16
        let length = (opcode & 0xf0) >> 4
        //console.log(this.op_counter, hexify(this.memory.pointer, 4), "opc", opcode, "t", type, this.opcode_types[type], length)
        console.log({ asm: this.opcode_types[type], length: length})
        return { asm: this.opcode_types[type], length: length }
    },

    opcode_types: [
        "halt", "nop", "jmp", "mov", "add", "copy", "jeq", "jne"
    ],

    get_instructionset(memory, memory_map) {
        this.memory = memory
        this.memory_map = memory_map
        const instructions = {
            halt: {
                0: () => { this.memory[this.memory_map.flags.halt] = 0x01 }
            },
            nop: [
                () => { } // 0
            ],
            jmp: {
                0: () => { },
                1: () => {
                    let value = this.memory.step()
                    this.memory.pointer += value
                },
                2: () => {
                    let address = this.memory.w_step()
                    this.memory.pointer = address
                    //console.log("jump to", hexify(address,4), hexify(memory.pointer, 4))
                }
            },
            mov: {
                0: null,
                1: () => {
                    let value = this.memory.step()
                    this.memory[acc_ptr] = value
                },
                2: () => {
                    let addr = this.memory.w_step()
                    this.memory[acc_ptr] = this.memory[addr]
                },
                3: () => { //3
                    let value = memory.step()
                    let address = memory.w_step()
                    this.memory[address] = value
                },
                4: () => { //4 // should this be copy or mov?
                    let value = memory.w_step()
                    let address = memory.w_step()
                    this.memory[address] = value
                }

            },
            add: {
                0: () => memory[acc_ptr] += 1,
                1: () => {
                    console.log("add to acc")
                    let value = memory.step()
                    memory[acc_ptr] += value
                },
                2: () => {
                    console.log("add value in memory address to acc")
                    let addr = memory.w_step()
                    memory[acc_ptr] += memory[addr]
                },
                3: () => { // add byte to target
                    //console.log("add byte")
                    let value = memory.step()
                    let address = memory.w_step()
                    memory[address] += value
                },
                4: () => { //add word to target
                    //console.log("add word")
                    let value = memory.w_step()
                    let address = memory.w_step()
                    let bytes = get_lo_hi(value)
                    //console.log(value, hexify(address, 4), bytes)
                    //handle overflow
                    if (memory[address + 1] + bytes[0] > 0xff) {
                        bytes[1] = bytes[1] + 1
                    }
                    memory[address + 1] += bytes[0]
                    memory[address] += bytes[1]
                }
            },
            copy: [
                ,
                ,
                ,
                ,
                () => {
                    let addr1 = memory.w_step()
                    let addr2 = memory.w_step()
                    //console.log("copy", hexify(addr1), hexify(addr2))
                    memory[addr2] = memory[addr1]
                }
            ],
            jeq: [
                ,
                ,
                ,
                () => {
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
                    //console.log("jeq 5", hexify(value), hexify(memory[addr1]), hexify(addr1), hexify(addr2))
                }
            ],
            jne: {
                0: null,
                1: null,
                2: () => {
                    let value = memory.step()
                    let relative_step = memory_step()
                    memory.pointer = memory[acc_ptr] == value ? memory_pointer + relative_step : memory_pointer
                },
                3: () => {
                    let value = memory.step()
                    let address = memory.w_step()
                    memory.pointer = memory[acc_ptr] == value ? address : memory.pointer
                },
                4: () => {
                    let value = memory.step()
                    let value2 = memory.step()
                    let address = memory.w_step()
                    memory.pointer = value2 == value ? address : memory.pointer
                }
            }
        }
        return instructions
    }
}


export {
    old_instructionset
}