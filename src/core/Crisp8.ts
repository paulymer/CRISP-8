/// <reference path="Crisp8Error.ts" />
/// <reference path="Formatter.ts" />
/// <reference path="JSUtilities.ts" />

const Crisp8MemorySize = 0x1000;
const Crisp8ROMOffset = 0x0200;
const Crisp8RegisterCount = 16;
const Crisp8StackSize = 16;

const Crisp8LineLength = 16;

class Crisp8 {
    private memory: Uint8Array;
    private registers: Uint8Array;
    private indexRegister: number;
    public programCounter: number;

    private stack: Uint8Array;
    private stackIndex: number;

    constructor() {
        this.reset();
    }

    reset() {
        this.memory = new Uint8Array(Crisp8MemorySize);
        this.registers = new Uint8Array(Crisp8RegisterCount);
        this.indexRegister = 0;
        this.programCounter = Crisp8ROMOffset;

        this.stack = new Uint8Array(Crisp8StackSize);
        this.stackIndex = -1;
    }

    loadROM(rom: Uint8Array) {
        this.memory.set(rom, Crisp8ROMOffset);
    }

    step() {
        let opcode = (this.memory[this.programCounter] << 8) | (this.memory[this.programCounter + 1]);

        // Flow Control
        if ((opcode & 0xF000) === 0x1000) {
            // 1MMM: Jump to 0x0MMM
            this.programCounter = opcode & 0xFFF;
        }
        // Arithmetic and Memory
        else if ((opcode & 0xF000) === 0x6000) {
            // 6XNN: Set register VX = literal NN
            let registerIndex = (opcode & 0x0F00) >> 8;
            let literal = (opcode & 0x00FF);
            this.registers[registerIndex] = literal;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0x7000) {
            // 7XNN: Add NN to register VX
            let registerIndex = (opcode & 0x0F00) >> 8;
            let literal = (opcode & 0x00FF);
            this.registers[registerIndex] = (this.registers[registerIndex] + literal) % 256;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8000) {
            // 8XY0: Register VX = register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] = this.registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8001) {
            // 8XY1: Register VX |= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] |= this.registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8002) {
            // 8XY2: Register VX &= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] &= this.registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8003) {
            // 8XY3: Register VX ^= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] ^= this.registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8004) {
            // 8XY4: Register VX += register VY, set VF to overflow bit
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            let sum = this.registers[sourceRegisterIndex] + this.registers[destinationRegisterIndex];
            let overflow = sum >= 256 ? 1 : 0;
            this.registers[destinationRegisterIndex] = sum % 256;
            this.registers[0xF] = overflow;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8005 || (opcode & 0xF00F) === 0x8007) {
            // 8XY5: VX = VX - VY
            // 8XY7: VX = VY - VX
            // Both set VF to 1 if a borrow occurs, 0 otherwise.
            let vyIsSubtrahend = (opcode & 0x000F) === 5;
            let vxRegisterIndex = (opcode & 0x0F00) >> 8;
            let vyRegisterIndex = (opcode & 0x00F0) >> 4;

            let difference: number;
            if (vyIsSubtrahend) {
                difference = this.registers[vxRegisterIndex] - this.registers[vyRegisterIndex];
            } else {
                difference = this.registers[vyRegisterIndex] - this.registers[vxRegisterIndex];
            }
            let borrow = 0;
            if (difference < 0) {
                borrow = 1;
                difference += 256;
            }

            this.registers[vxRegisterIndex] = difference;
            this.registers[0xF] = borrow;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8006) {
            // 8XY6: Register VX = register VY >> 1
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] = this.registers[sourceRegisterIndex] >> 1;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x800E) {
            // 8XYE: Register VX = register VY << 1
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this.registers[destinationRegisterIndex] = this.registers[sourceRegisterIndex] << 1;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0xC000) {
            // CXNN: Register VX = rand() & NN
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let mask = opcode & 0x00FF;
            let value = Math.diplographRandomInt(0, 256) & mask;
            this.registers[destinationRegisterIndex] = value;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0xA000) {
            // ANNN: Register I = address NNN
            let address = opcode & 0x0FFF;
            this.indexRegister = address;
            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF01E) {
            // FX1E: Adds VX to I. Sets VF to overflow bit (undocumented, but at least one piece of software relies on this [Spaceflight 2091!])
            let registerIndex = (opcode & 0x0F00) >> 8;
            let sum = this.indexRegister += this.registers[registerIndex];
            let overflow = 0;
            if (sum >= 0x1000) {
                sum -= 0x1000;
                overflow = 1;
            }
            this.indexRegister = sum;
            this.registers[0xF] = overflow;
            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF033) {
            // FX33: Write the BCD encoding of VX to I, I+1, and I+2
            let baseAddress = this.indexRegister;

            if (this.indexRegister >= 0x0FFE) {
                throw new Crisp8Error("Cannot write BCD encoding of register to address " + Formatter.hexAddress(baseAddress) + ". Memory out of bounds.");
            }

            let registerIndex = (opcode & 0x0F00) >> 8;
            let bcdDigits = Math.diplographBCD(this.registers[registerIndex], 3);

            for (let i = 0; i < 3; i++) {
                this.memory[baseAddress + i] = bcdDigits[i];
            }

            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF055 || (opcode & 0xF0FF) === 0xF065) {
            // FX55: Write V0...VX (inclusive) to I...(I+X)
            // FX65: Read I...(I+X) (inclusive) to V0...VX
            let length = ((opcode & 0x0F00) >> 8) + 1;
            let readOperation = (opcode & 0x00F0) >> 4 === 6;
            let baseAddress = this.indexRegister;

            if (baseAddress + length > 0x1000) {
                throw new Crisp8Error("Cannot " + (readOperation ? "read" : "write") + " register values with base address " + Formatter.hexAddress(baseAddress) + ". Memory out of bounds.");
            }

            for (let i = 0; i < length; i++) {
                if (readOperation) {
                    this.registers[i] = this.memory[baseAddress + i];
                } else {
                    this.memory[baseAddress + i] = this.registers[i];
                }
            }

            this.programCounter += 2;
        }
        // Unrecognized Opcode
        else {
            throw new Crisp8Error("Unrecognized opcode " + opcode.toString(16) + " at address " + Formatter.hexAddress(this.programCounter));
        }
    }

    debugString() {
        let debugString = "";
        debugString += this.debugRegistersString() + "\n";
        debugString += this.debugMemoryString();
        return debugString;
    }

    debugRegistersString() {
        let lines = new Array<string>();
        lines.push("PC: " + Formatter.hexAddress(this.programCounter) + "  I: " + Formatter.hexAddress(this.indexRegister));
        this.registers.diplographEachSubarray(8, function(subarray: Uint8Array, baseIndex: number) {
            let items = new Array<string>();
            for (let i = 0; i < subarray.length; i++) {
                items.push("V" + (i + baseIndex).toString(16) + ": " + subarray[i].toString().diplographLeftPad(" ", 3));
            }
            lines.push(items.join("  "));
        });
        return lines.join("\n");
    }

    debugMemoryString() {
        let lines = new Array<string>();
        this.memory.diplographEachSubarray(Crisp8LineLength, function (subarray: Uint8Array, baseIndex: number) {
            if (Crisp8.Uint8ArayIsZeroed(subarray)) {
                return;
            }

            let words = new Array<string>();
            for (let i = 0; i < Crisp8LineLength; i += 2) {
                let word = subarray[i].toString(16).diplographLeftPad("0", 2);
                word += subarray[i + 1].toString(16).diplographLeftPad("0", 2);
                words.push(word);
            }

            lines.push(baseIndex.toString(16).diplographLeftPad("0", 4) + ": " + words.join(" "));
        });

        return lines.join("\n");
    }

    private static Uint8ArayIsZeroed(array: Uint8Array) {
        for (let i = 0; i < array.length; i++) {
            if (array[i] !== 0) {
                return false;
            }
        }
        return true;
    }
}
