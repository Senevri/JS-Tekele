Virtual CPU type stuff
- Todo:
  x Character ROM http://www.6502.org/users/sjgray/computer/cbmchr/cbmchr.html
  . Arbitrary memory view
  . Assembler/monitor active on web page
  . bitmap screen modes
  x in-memory palette
  . Keyboard IO
  . Audio
  . Sprites
  x Split to separate files, getting kinda clunky here

For the next step, consider the following for minimal instruction set:

(opcode, mnemonic, size, type)

(00, NOP, 1, no-operation)
(01, LDA, 2, load accumulator)
(02, STA, 3, store accumulator - 16-bit address)
(03, ADD, 2, add to accumulator)
(04, SUB, 2, subtract from accumulator)
(05, AND, 2, logical AND with accumulator)
(06, OR, 2, logical OR with accumulator)
(07, XOR, 2, exclusive OR with accumulator)
(08, JMP, 3, jump)
(09, BEQ, 2, branch if equal)
(0A, BNE, 2, branch if not equal)
(0B, CMP, 2, compare)
(0C, INC, 2, increment)
(0D, DEC, 2, decrement)
(0E, JSR, 3, jump to subroutine)
(0F, RTS, 1, return from subroutine)

It's all about zeropage layout, then.
