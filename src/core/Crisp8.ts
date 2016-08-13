/// <reference path="Crisp8Error.ts" />
/// <reference path="Formatter.ts" />
/// <reference path="JSUtilities.ts" />

const Crisp8MemorySize = 0x1000;
const Crisp8ROMOffset = 0x0200;
const Crisp8RegisterCount = 16;
const Crisp8StackSize = 16;

const Crisp8LineLength = 16;

const Crisp8ReservedMemoryRegions = [
    {"start": 0x0000, "end": 0x01FF, "region": "Reserved for interpreter"},
    {"start": 0x0EA0, "end": 0x0EFF, "region": "Reserved for callstack and other runtime variables"},
    {"start": 0x0F00, "end": 0x0FFF, "region": "Reserved for display"},
];

class Crisp8 {
    private _memory: Uint8Array;
    private _registers: Uint8Array;
    private _indexRegister: number;
    public programCounter: number;

    private _stack: Uint8Array;
    private _stackIndex: number;

    constructor() {
        this.reset();
    }

    reset() {
        this._memory = new Uint8Array(Crisp8MemorySize);
        this._registers = new Uint8Array(Crisp8RegisterCount);
        this._indexRegister = 0;
        this.programCounter = Crisp8ROMOffset;

        this._stack = new Uint8Array(Crisp8StackSize);
        this._stackIndex = -1;
    }

    loadROM(rom: Uint8Array) {
        this._memory.set(rom, Crisp8ROMOffset);
    }

    private _nibblesForWord(word: number) {
        if (!Number.isInteger(word) || word < 0) {
            throw new Crisp8InternalError("Cannot break word " + word.toString() + " into nibbles. Doesn't appear to be a word.");
        }
        let nibbles = new Array<number>();
        while (word > 0) {
            nibbles.unshift(word & 0xF);
            word >>= 4;
        }
        return nibbles;
    }

    private _validateMemoryAddress(address: number) {
        if (!Number.isInteger(address)) {
            throw new Crisp8InternalError("Address " + address.toString() + " is not an integer.");
        }
        if (address < 0) {
            throw new Crisp8InternalError("Address " + Formatter.hexAddress(address) + " is negative.");
        }
        if (address >= Crisp8MemorySize) {
            throw new Crisp8Error("Cannot access address " + Formatter.hexAddress(address) + ". Memory out of bounds.");
        }
        for (let reservedMemoryRegion of Crisp8ReservedMemoryRegions) {
            if (address >= reservedMemoryRegion.start && address <= reservedMemoryRegion.end) {
                throw new Crisp8Error("Cannot access address " + Formatter.hexAddress(address) + ". " + reservedMemoryRegion.region + ".");
            }
        }
        return true;
    }

    writeMemory(address: number, value: number) {
        if (value < 0 || value >= 0x100) {
            throw new Crisp8InternalError("Cannot write value " + value + " to address " + Formatter.hexAddress(address) + ". Value is not an 8-bit unsigned value.");
        }
        if (this._validateMemoryAddress(address)) {
            this._memory[address] = value;
        }
    }

    readMemory(address: number) {
        if (this._validateMemoryAddress(address)) {
            return this._memory[address];
        }
    }

    step() {
        let opcode = (this._memory[this.programCounter] << 8) | (this._memory[this.programCounter + 1]);

        // Flow Control
        if ((opcode & 0xF000) === 0x0000) {
            throw new Crisp8Error("Opcode 0NNN (jump to native routine) is not available in CRISP-8.");
        } else if ((opcode & 0xF000) === 0x1000) {
            // 1MMM: Jump to 0x0MMM
            this.programCounter = opcode & 0x0FFF;
        } else if ((opcode & 0xF000) === 0xB000) {
            // BNNN: Jump to V0 + NNN
            let baseAddress = opcode & 0x0FFF;
            let address = baseAddress + this._registers[0x0];
            this.programCounter = address;
        } else if ((opcode & 0xF000) === 0x3000 || (opcode & 0xF000) === 0x4000 || (opcode & 0xF00F) === 0x5000 || (opcode & 0xF00F) === 0x9000) {
            // 3XNN: Skip next instruction if VX == NN
            // 4XNN: Skip next instruction if VX != NN
            // 5XY0: Ship next instruction if VX == VY
            // 9XY0: Skip next instruction if VX != VY
            let leftValue: number;
            let rightValue: number;
            let testEquality: boolean;

            let nibbles = this._nibblesForWord(opcode);
            if (nibbles[0] === 3 || nibbles[0] === 4) {
                leftValue = this._registers[nibbles[1]];
                rightValue = opcode & 0x00FF;
                testEquality = nibbles[0] === 3;
            } else {
                leftValue = this._registers[nibbles[1]];
                rightValue = this._registers[nibbles[2]];
                testEquality = nibbles[0] === 5;
            }

            let skipNextInstruction: boolean;
            if (testEquality) {
                skipNextInstruction = leftValue === rightValue;
            } else {
                skipNextInstruction = leftValue !== rightValue;
            }

            if (skipNextInstruction) {
                this.programCounter += 4;
            } else {
                this.programCounter += 2;
            }
        }
        // Arithmetic and Memory
        else if ((opcode & 0xF000) === 0x6000) {
            // 6XNN: Set register VX = literal NN
            let registerIndex = (opcode & 0x0F00) >> 8;
            let literal = (opcode & 0x00FF);
            this._registers[registerIndex] = literal;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0x7000) {
            // 7XNN: Add NN to register VX
            let registerIndex = (opcode & 0x0F00) >> 8;
            let literal = (opcode & 0x00FF);
            this._registers[registerIndex] = (this._registers[registerIndex] + literal) % 256;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8000) {
            // 8XY0: Register VX = register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] = this._registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8001) {
            // 8XY1: Register VX |= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] |= this._registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8002) {
            // 8XY2: Register VX &= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] &= this._registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8003) {
            // 8XY3: Register VX ^= register VY
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] ^= this._registers[sourceRegisterIndex];
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8004) {
            // 8XY4: Register VX += register VY, set VF to overflow bit
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            let sum = this._registers[sourceRegisterIndex] + this._registers[destinationRegisterIndex];
            let overflow = sum >= 256 ? 1 : 0;
            this._registers[destinationRegisterIndex] = sum % 256;
            this._registers[0xF] = overflow;
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
                difference = this._registers[vxRegisterIndex] - this._registers[vyRegisterIndex];
            } else {
                difference = this._registers[vyRegisterIndex] - this._registers[vxRegisterIndex];
            }
            let borrow = 0;
            if (difference < 0) {
                borrow = 1;
                difference += 256;
            }

            this._registers[vxRegisterIndex] = difference;
            this._registers[0xF] = borrow;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x8006) {
            // 8XY6: Register VX = register VY >> 1
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] = this._registers[sourceRegisterIndex] >> 1;
            this.programCounter += 2;
        } else if ((opcode & 0xF00F) === 0x800E) {
            // 8XYE: Register VX = register VY << 1
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let sourceRegisterIndex = (opcode & 0x00F0) >> 4;
            this._registers[destinationRegisterIndex] = this._registers[sourceRegisterIndex] << 1;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0xC000) {
            // CXNN: Register VX = rand() & NN
            let destinationRegisterIndex = (opcode & 0x0F00) >> 8;
            let mask = opcode & 0x00FF;
            let value = Math.diplographRandomInt(0, 256) & mask;
            this._registers[destinationRegisterIndex] = value;
            this.programCounter += 2;
        } else if ((opcode & 0xF000) === 0xA000) {
            // ANNN: Register I = address NNN
            let address = opcode & 0x0FFF;
            this._indexRegister = address;
            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF01E) {
            // FX1E: Adds VX to I. Sets VF to overflow bit (undocumented, but at least one piece of software relies on this [Spaceflight 2091!])
            let registerIndex = (opcode & 0x0F00) >> 8;
            let sum = this._indexRegister += this._registers[registerIndex];
            let overflow = 0;
            if (sum >= 0x1000) {
                sum -= 0x1000;
                overflow = 1;
            }
            this._indexRegister = sum;
            this._registers[0xF] = overflow;
            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF033) {
            // FX33: Write the BCD encoding of VX to I, I+1, and I+2
            let baseAddress = this._indexRegister;

            let registerIndex = (opcode & 0x0F00) >> 8;
            let bcdDigits = Math.diplographBCD(this._registers[registerIndex], 3);

            for (let i = 0; i < 3; i++) {
                this.writeMemory(baseAddress + i, bcdDigits[i]);
            }

            this.programCounter += 2;
        } else if ((opcode & 0xF0FF) === 0xF055 || (opcode & 0xF0FF) === 0xF065) {
            // FX55: Write V0...VX (inclusive) to I...(I+X)
            // FX65: Read I...(I+X) (inclusive) to V0...VX
            let length = ((opcode & 0x0F00) >> 8) + 1;
            let readOperation = (opcode & 0x00F0) >> 4 === 6;
            let baseAddress = this._indexRegister;

            for (let i = 0; i < length; i++) {
                if (readOperation) {
                    this._registers[i] = this.readMemory(baseAddress + i);
                } else {
                    this.writeMemory(baseAddress + i, this._registers[i]);
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
        lines.push("PC: " + Formatter.hexAddress(this.programCounter) + "  I: " + Formatter.hexAddress(this._indexRegister));
        this._registers.diplographEachSubarray(8, function(subarray: Uint8Array, baseIndex: number) {
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
        this._memory.diplographEachSubarray(Crisp8LineLength, function (subarray: Uint8Array, baseIndex: number) {
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
