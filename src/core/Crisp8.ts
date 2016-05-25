const Crisp8ROMOffset = 0x0200;

class Crisp8 {
    private memory: Uint8Array;
    private registers: Uint8Array;
    private indexRegister: number;
    private programCounter: number;

    private stack: Uint8Array;
    private stackIndex: number;

    constructor() {
        this.reset();
    }

    reset() {
        this.memory = new Uint8Array(4096);
        this.registers = new Uint8Array(16);
        this.indexRegister = 0;
        this.programCounter = Crisp8ROMOffset;

        this.stack = new Uint8Array(16);
        this.stackIndex = -1;
    }

    loadROM(rom: Uint8Array) {
        this.memory.set(rom, Crisp8ROMOffset);
    }

    step() {

    }
}
