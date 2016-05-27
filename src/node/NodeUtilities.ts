/// <reference path="../../typedefinitions/node.d.ts" />
/// <reference path="../core/JSUtilities.ts" />

const fs = require("fs");

class NodeUtilities {
    static argvWithoutProcessName() {
        return process.argv.slice(2);
    }

    static parseArguments(argumentsWithValues: Array<string>, optionCallback: (option: string, value: string) => void, errorCallback: (errorString: string) => void) {
        let remainingArguments = new Array<string>();

        let argv = this.argvWithoutProcessName();
        while (argv.length > 0) {
            let argument = argv.shift();
            if (argument.diplographStartsWith("-")) {
                let value: string = undefined;
                if (argumentsWithValues.indexOf(argument) !== -1) {
                    value = argv.shift();
                    if (value === undefined || value.diplographStartsWith("-")) {
                        errorCallback("Option " + argument + " expects a value.");
                        return;
                    }
                }
                optionCallback(argument, value);
            } else {
                remainingArguments.push(argument);
            }
        }

        return remainingArguments;
    }
}
