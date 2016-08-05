class Formatter {
    static hexAddress(address: number) {
        return "0x" + address.toString(16).toUpperCase().diplographLeftPad("0", 4);
    }
}
