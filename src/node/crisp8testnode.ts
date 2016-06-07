/// <reference path="NodeUtilities.ts" />
/// <reference path="NodeOutputTestRunner.ts" />
/// <reference path="../core/Crisp8OutputTest.ts" />

function crisp8testmain() {
    let options = new NodeOutputTestRunnerOptions();

    let optionCallback = function(option: string, value: string) {
        if (option === "--help") {
            printUsageAndExit(0);
        } else if (option === "--rebase") {
            options.rebase = true;
        } else if (option === "--verbose") {
            options.verbose = true;
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
    let testRunner = new NodeOutputTestRunner(Crisp8OutputTest, remainingArguments, options);
    testRunner.run();
}

function printUsageAndExit(status: number) {
    console.log("CRISP-8: A CHIP-8 emulator.");
    console.log("  Command line test runner.");
    console.log("Usage: node crisp8test.js [--rebase] tests...");
    console.log("");
    console.log("Looks for files with a \".test\" extension and runs them in the CRISP-8 emulator.");
    console.log("The test continues until the program jumps to 0x0111.");
    console.log("The internal machine state is compared to the contents of the sibling file with a \".expected\" extension.");
    console.log("");
    console.log("Options: ");
    console.log("  --rebase: Saves the actual internal machine state to the .expected file.");
    console.log("  --verbose: Enable additional logging.");
    process.exit(status);
}

crisp8testmain();
