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
    
        pointer: 0x0000,
        zeropage: 0x0000,
        registers: {
            accumulator: 0x0002,
            hi: 0x0003,
            lo: 0x0004
        },
        flags: {
            halt: 0x0008
        },
        io: 0x0010,
        stack_pointer: 0x0100,//stack pointer
        stack: 0x0101, //stack start
        mem_start: 0x0200, //maybe?
        char_rom: 0xe00,

    }
    acc_ptr = this.memory_map.flags.accumulator
    //memory=null

    constructor(params) {
        this.memory = params.memory
        this.instructions = this.init_instructions()
        this.op_counter = 0
        this.clock = 10
    }

    clear_interrupt(int_addr) {
        this.memory[int_addr] = 0x00
    }

    interrupt(int_addr) { // TODO: How do
        this.memory[int_addr] = 0x01
    }

    // use list index for bytecount
    opcode_types = [
        "halt", "nop", "jmp", "mov", "add", "copy", "jeq", "jne"
    ]

    get_instruction(opcode) {
        let type = opcode & 0x0f //max 16
        let length = (opcode & 0xf0) >> 4
        //console.log(this.op_counter, hexify(this.memory.pointer, 4), "opc", opcode, "t", type, this.opcode_types[type], length)
        return { asm: this.opcode_types[type], length: length }
    }

    // instruction index == how many bytes an instruction reads
    init_instructions() {
        let memory = this.memory
        let acc_ptr = this.acc_ptr
        let instructions = {
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

    process_opcode(instruction) {
        const asm = instruction.asm
        const length = instruction.length
        let memory = this.memory
        // generate message
        var bytes = []
        if (length > 0) {
            bytes = Array.from(memory.slice(memory.pointer, memory.pointer+length))
        }
        //console.log("bytes", bytes.map(b=>hexify(b)), asm, length)
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

        let instruction_func = this.instructions[asm][length]
        instruction_func()
        
        return [asm].concat(msg).join(" ")
    }

    step() {
        let memory = this.memory
        if (this.memory[this.memory_map.flags.halt]) { 
            console.log("halted on " + hexify(memory.pointer))
            return this.opcode_types.indexOf("halt") 
        }
        let cur_ptr = memory.pointer
        let op = memory.step()
        let instruction = this.get_instruction(op)
        //console.log(instruction, hexify(memory.slice(cur_ptr, cur_ptr + instruction.length + 1)), op, "current address:", hexify(cur_ptr, 4))
        let msg = this.process_opcode(instruction)
        println(hexify(cur_ptr, 4) + ": " + msg)
        this.op_counter++
        return op
    }
}
// return CPU
// })()

