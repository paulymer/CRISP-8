class NamedErrorWithMessage extends Error {
    constructor(name: string, message: string) {
        super(undefined);
        this.name = name;
        this.message = message;
    }

    toString() {
        return this.name + ": " + this.message;
    }
}

class Crisp8Error extends NamedErrorWithMessage {
    constructor(message: string) {
        super("Crisp8Error", message);
    }
}

class Crisp8InternalError extends NamedErrorWithMessage {
    constructor(message: string) {
        super("Crisp8InternalError", message);
    }
}
