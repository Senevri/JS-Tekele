import { hexify, println } from "./util.js"
// CPU = (function () {

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

    constructor(params) {
        this.memory = params.memory
        this.memory_map = params.memory_map
        this.instructionset = params.instructionset
        this.instructions = this.init_instructions()
        this.acc_ptr = this.memory_map.flags.accumulator
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


    get_instruction(opcode) {
        return this.instructionset.get_instruction(opcode)
    }

    // instruction index == how many bytes an instruction reads
    init_instructions() {
        let memory = this.memory
        let acc_ptr = this.acc_ptr
        this.opcode_types = this.instructionset.opcode_types
        let instructions = this.instructionset.get_instructionset(memory, this.memory_map)
        instructions.memory = this.memory
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
        //console.log("bytes", bytes)
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
        console.log(asm, length, this.instructions[asm], msg)
        let instruction = this.instructions[asm][length]

        instruction()
        memory[this.memory_map.pc] = memory.pointer
        return [asm].concat(msg).join(" ")
    }

    step() {
        if (this.memory[this.memory_map.flags.halt]) { return this.opcode_types.indexOf("halt") }
        let memory = this.memory
        let cur_ptr = memory.pointer
        let op = memory.step()
        let instruction = this.get_instruction(op)
        console.log(instruction, hexify(memory.slice(cur_ptr, cur_ptr + instruction.length + 1)), op, "current address:", hexify(cur_ptr, 4))
        let msg = this.process_opcode(instruction.asm, instruction.length)
        //println(hexify(cur_ptr, 4) + ": " + msg)
        this.op_counter++
        return op
    }
}
// return CPU
// })()
