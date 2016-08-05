interface String {
    diplographLeftPad: (prefix: string, length: number) => string;
    diplographRightPad: (prefix: string, length: number) => string;
    diplographStartsWith: (prefix: string) => boolean;
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

String.prototype.diplographStartsWith = function(prefix: string) {
    return this.lastIndexOf(prefix, 0) === 0;
};

interface Uint8Array {
    diplographEachSubarray: (size: number, callback: (subarray: Uint8Array, baseIndex: number) => void) => void;
}

Uint8Array.prototype.diplographEachSubarray = function(length: number, callback: (subarray: Uint8Array, baseIndex: number) => void) {
    for (let i = 0; i < this.length; i += length) {
        callback(this.subarray(i, i + length), i);
    }
};

interface Math {
    diplographBCD: (num: number, minimumDigits: number) => Array<number>;
    diplographRandomInt: (min: number, max: number) => number;
}

Math.diplographBCD = function(num: number, minimumDigits: number) {
    if (!isFinite(num)) {
        throw new Error("BCD encoding requires a finite number");
    }
    if (num < 0) {
        throw new Error("BCD encoding requires a positive number");
    }

    num = Math.floor(num);
    let digits = new Array<number>();
    while (num > 0) {
        let digit = num % 10;
        digits.unshift(digit);
        num = Math.floor(num / 10);
    }
    while (digits.length < minimumDigits) {
        digits.unshift(0);
    }
    return digits;
};

Math.diplographRandomInt = function(min: number, max: number) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min)) + min;
};
