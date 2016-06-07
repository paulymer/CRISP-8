/// <reference path="Crisp8.ts" />

enum OutputTestResult {
    OutputTestResultUnknown,
    OutputTestResultPassed,
    OutputTestResultFailedIncorrectResult,
    OutputTestResultFailedTimeout,
    OutputTestResultFailedThrewError,
}

interface OutputTestConstructor {
    new (input: Uint8Array, expectedOutput: string): OutputTest;
}

abstract class OutputTest {
    private _input: Uint8Array;
    private _expectedOutput: string;
    private _actualOutput: string;
    private _result: OutputTestResult;
    private _error: any;

    public testRunnerContext: any;

    constructor(input: Uint8Array, expectedOutput: string) {
        this._input = input;
        this._expectedOutput = expectedOutput;
        this._result = OutputTestResult.OutputTestResultUnknown;
    }

    runTest() {
        try {
            this._actualOutput = this.generateActualOutput();
        } catch (error) {
            if (this.shouldCatchError(error)) {
                this._actualOutput = error.toString();
            } else {
                this._error = error;
                this._result = OutputTestResult.OutputTestResultFailedThrewError;
            }
        }

        if (this._result === OutputTestResult.OutputTestResultUnknown) {
            this._result = (this._actualOutput === this._expectedOutput) ? OutputTestResult.OutputTestResultPassed : OutputTestResult.OutputTestResultFailedIncorrectResult;
        }
        return this._result;
    }

    abstract generateActualOutput(): string;
    abstract shouldCatchError(error: any): boolean;

    protected testTimedOut() {
        this._result = OutputTestResult.OutputTestResultFailedTimeout;
    }

    protected input() {
        return this._input;
    }

    actualOutput() {
        return this._actualOutput;
    }

    expectedOutput() {
        return this._expectedOutput;
    }

    result() {
        return this._result;
    }

    error() {
        return this._error;
    }
}
