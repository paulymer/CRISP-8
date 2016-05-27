/// <reference path="OutputTest.ts" />

abstract class PlatformOutputTestRunner {
    private _passedTestCount: number;
    private _failedTestCount: number;

    constructor() {
        this._passedTestCount = 0;
        this._failedTestCount = 0;
    }

    run() {
        while(true) {
            let test = this.loadNextTest();
            if (test === undefined) {
                break;
            }

            this.testDidStart(test);
            let result = test.runTest();

            if (result === OutputTestResult.OutputTestResultPassed) {
                this._passedTestCount++;
                this.testDidPass(test);
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

    abstract loadNextTest(): OutputTest;
    abstract testDidStart(test: OutputTest): void;
    abstract testDidFail(test: OutputTest, result: OutputTestResult): void;
    abstract testDidPass(test: OutputTest): void;
    abstract testingDidFinish(): void;
}
