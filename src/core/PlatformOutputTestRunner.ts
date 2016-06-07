/// <reference path="OutputTest.ts" />

abstract class PlatformOutputTestRunner {
    private _passedTestCount: number;
    private _failedTestCount: number;
    private _rebasedTestCount: number;

    constructor() {
        this._passedTestCount = 0;
        this._failedTestCount = 0;
        this._rebasedTestCount = 0;
    }

    run() {
        while (true) {
            let test = this.loadNextTest();
            if (test === undefined) {
                break;
            }

            this.testDidStart(test);
            let result = test.runTest();

            if (result === OutputTestResult.OutputTestResultPassed) {
                this._passedTestCount++;
                this.testDidPass(test);
            } else if (result === OutputTestResult.OutputTestResultFailedIncorrectResult && this.shouldRebaseTests()) {
                this._rebasedTestCount++;
                this.rebaseTest(test);
            } else {
                this._failedTestCount++;
                this.testDidFail(test, result);
            }
        }

        this.testingDidFinish();
    }

    passedTestCount() {
        return this._passedTestCount;
    }

    failedTestCount() {
        return this._failedTestCount;
    }

    rebasedTestCount() {
        return this._rebasedTestCount;
    }

    abstract loadNextTest(): OutputTest;
    abstract shouldRebaseTests(): boolean;
    abstract rebaseTest(test: OutputTest): void;
    abstract testDidStart(test: OutputTest): void;
    abstract testDidFail(test: OutputTest, result: OutputTestResult): void;
    abstract testDidPass(test: OutputTest): void;
    abstract testingDidFinish(): void;
}
