/// <reference path="../../typedefinitions/node.d.ts" />

class NodeUtilities {
    static argvWithoutProcessName() {
        return process.argv.slice(2);
    }
}
