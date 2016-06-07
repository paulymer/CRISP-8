/// <reference path="../../typedefinitions/node.d.ts" />
/// <reference path="../core/JSUtilities.ts" />

const fs = require("fs");
const path = require("path");

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

    static recursiveReadPathSync(currentPath: string) {
        let results = new Array<string>();

        let stat = fs.lstatSync(currentPath);
        if (stat === undefined) {
            return results;
        } else if (stat.isSymbolicLink()) {
            // Don't follow symbolic links to avoid loops.
            return results;
        } else {
            results.push(currentPath);
            if (stat.isDirectory()) {
                let children = fs.readdirSync(currentPath);
                for (let child of children) {
                    let childPath = path.join(currentPath, child);
                    results = results.concat(this.recursiveReadPathSync(childPath));
                }
            }
        }

        return results;
    }
}
