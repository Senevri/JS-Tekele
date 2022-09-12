import { hexify, println } from "./util.js"

// CPU = (function () {

function get_lo_hi(word) {
    return [
        word & 0xff,
        word >> 8
    ]
}

export default class CPU {
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
        pc: 0x0000, // equal to memory.pointer
        zeropage: 0x0000,
        flags: {
            accumulator: 0x0002,
            halt: 0x0004
        },
        io: 0x0010,
        stack: 0x0100, //stack pointer
        mem_start: 0x0200, //maybe?
    }
    acc_ptr = this.memory_map.flags.accumulator

    //memory=null

    constructor(params) {
        this.memory = params.memory
        this.instructions = this.init_instructions()
        this.op_counter = 0
    }

    interrupt() { // TODO: How do
        this.instructions.halt()
    }

    // use list index for bytecount
    opcode_types = [
        "halt", "nop", "jmp", "mov", "add", "copy", "jeq", "jne"
    ]

    get_instruction(opcode) {
        let type = opcode & 0xf //max 16
        let length = (opcode & 0xf0) >> 4
        //console.log(hexify(memory.pointer, 4), opcode, type, this.opcode_types[type], length)
        return { asm: this.opcode_types[type], length: length }
    }

    // instruction index == how many bytes an instruction reads
    init_instructions() {
        let memory = this.memory
        let instructions = {
            halt: [
                () => { this.memory[this.memory_map.flags.halt] = 0x01 }
            ],
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
                2: null,
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
                0: null,
                1: () => {
                    console.log("add to acc")
                    let value = memory.step()
                    memory[acc_ptr] += value
                },
                2: null,
                3: () => { // add byte to target
                    let value = memory.step()
                    let address = memory.w_step()
                    memory[address] += value
                },
                4: () => { //add word to target
                    console.log("add word")
                    let value = memory.w_step()
                    let address = memory.w_step()
                    let bytes = get_lo_hi(value)
                    memory[address + 1] = bytes[0]
                    memory[address] = bytes[1]
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
        return instructions
    }

    process_opcode(asm, length) {
        let memory = this.memory
        let pc = this.memory_map.pc
        // generate message
        var bytes = []
        if (length > 0) {
            bytes = Array.from(memory.slice(pc, length))
        }
        //console.log("bytes",bytes)
        let msg = [" "]
        while (bytes.length > 0) {
            if (bytes.length % 2 === 0) {
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
        let memory = this.memory
        if (this.memory[this.memory_map.flags.halt]) { return this.opcode_types.indexOf("halt") }
        let cur_ptr = memory.pointer
        let op = memory.step()
        let instruction = this.get_instruction(op)
        //console.log(instruction, memory.slice(cur_ptr, cur_ptr+instruction.length+1), op, "current address:", hexify(cur_ptr,4))
        let msg = this.process_opcode(instruction.asm, instruction.length)
        println(hexify(cur_ptr, 4) + ": " + msg)
        this.op_counter++
        return op
    }
}
// return CPU
// })()

