/// <reference path="../core/Crisp8.ts" />
/// <reference path="NodeUtilities.ts" />

const fs = require("fs");

function crisp8main() {
    let optionCallback = function(option: string, value: string) {
        if (option === "--help") {
            printUsageAndExit(0);
        } else {
            console.error("Unrecognized option " + option);
            printUsageAndExit(1);
        }
    };

    let errorCallback = function(errorString: string) {
        console.error(errorString);
        printUsageAndExit(1);
    };

    let remainingArguments = NodeUtilities.parseArguments([], optionCallback, errorCallback);
    if (remainingArguments.length === 0) {
        printUsageAndExit(1);
    }

    // TODO: Friendly error reporting for file problems, rom too large, etc.
    let romPath = remainingArguments[0];
    let rom = fs.readFileSync(romPath);

    let crisp8 = new Crisp8();
    crisp8.loadROM(rom);
    console.log(crisp8.debugString());
}

function printUsageAndExit(status: number) {
    console.log("CRISP-8: A CHIP-8 emulator.");
    console.log("  Command line CRISP-8 runner.");
    console.log("Usage: crisp8 romfile");
    process.exit(status);
}

crisp8main();
