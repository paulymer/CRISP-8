/// <reference path="JSUtilities.ts" />
/// <reference path="Crisp8Error.ts" />

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
        }
        // Unrecognized Opcode
        else {
            throw new Crisp8Error("Unrecognized opcode " + opcode.toString(16) + " at address 0x" + this.programCounter.toString(16));
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
        this.registers.diplographEachSubarray(8, function(subarray: Uint8Array, baseIndex: number) {
            let items = new Array<string>();
            for (let i = 0; i < subarray.length; i++) {
                items.push("V" + (i + baseIndex).toString(16) + ": " + subarray[i]);
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
