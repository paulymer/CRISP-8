/// <reference path="../core/crisp8.ts" />
/// <reference path="NodeUtilities.ts" />

const fs = require("fs");

function main() {
    let arguments = NodeUtilities.argvWithoutProcessName();
    if (arguments.length === 0) {
        printHelpAndExit();
    }

    // TODO: Friendly error reporting for file problems, rom too large, etc.
    let romPath = arguments[0];
    let rom = fs.readFileSync(romPath);

    let crisp8 = new Crisp8();
    crisp8.loadROM(rom);
    console.log(crisp8.debugString());
}

function printHelpAndExit() {
    console.log("CRISP-8: A CHIP-8 emulator.");
    console.log("  Command line CRISP-8 runner.");
    console.log("Usage: crisp8 romfile");
    process.exit();
}

main();
