interface String {
    diplographLeftPad: (prefix: string, length: number) => string;
    diplographRightPad: (prefix: string, length: number) => string;
}

String.prototype.diplographLeftPad = function(prefix: string, length: number) {
    let modifiedString = this;
    while (modifiedString.length < length) {
        modifiedString = prefix + modifiedString;
    }
    return modifiedString;
};

String.prototype.diplographRightPad = function(prefix: string, length: number) {
    let modifiedString = this;
    while (modifiedString.length < length) {
        modifiedString = modifiedString + prefix;
    }
    return modifiedString;
};

interface Uint8Array {
    diplographEachSubarray: (size: number, callback: (subarray: Uint8Array, baseIndex: number) => void) => void;
}

Uint8Array.prototype.diplographEachSubarray = function(length: number, callback: (subarray: Uint8Array, baseIndex: number) => void) {
    for (let i = 0; i < this.length; i += length) {
        callback(this.subarray(i, i + length), i);
    }
};
