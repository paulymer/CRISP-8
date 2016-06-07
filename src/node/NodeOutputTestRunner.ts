/// <reference path="../core/PlatformOutputTestRunner.ts" />
/// <reference path="PathParts.ts" />

class NodeOutputTestRunnerOptions {
    public verbose: boolean;
    public rebase: boolean;

    constructor() {
        this.verbose = false;
        this.rebase = false;
    }
}

class NodeOutputTestRunnerContext {
    public testPath: string;
    public expectedPath: string;
}

class NodeOutputTestRunner extends PlatformOutputTestRunner {
    private _testClass: OutputTestConstructor;
    private _options: NodeOutputTestRunnerOptions;

    private _testPaths: Array<string>;

    constructor(testClass: OutputTestConstructor, searchPaths: Array<string>, options: NodeOutputTestRunnerOptions) {
        super();
        this._testClass = testClass;
        this._options = options;

        this._testPaths = new Array<string>();
        for (let searchPath of searchPaths) {
            for (let candidatePath of NodeUtilities.recursiveReadPathSync(searchPath)) {
                if (path.extname(candidatePath) === ".test") {
                    this._testPaths.push(candidatePath);
                }
            }
        }
    }

    loadNextTest() {
        let testPath = this._testPaths.shift();
        if (testPath === undefined) {
            return undefined;
        }

        let expectedPathParts = new PathParts(testPath);
        expectedPathParts.extname = ".expected";
        let expectedPath = expectedPathParts.toString();

        let context = new NodeOutputTestRunnerContext;
        context.testPath = testPath;
        context.expectedPath = expectedPath;

        let input = fs.readFileSync(testPath);

        let expected: string = undefined;
        try {
            expected = fs.readFileSync(expectedPath, { "encoding": "utf8" });
        } catch (error) {
            console.log("Couldn't read expected output for test " + testPath + ": " + error);
            expected = "";
        }

        let test = new this._testClass(input, expected);
        test.testRunnerContext = context;
        return test;
    }

    testDidStart(test: OutputTest) {
        let context = test.testRunnerContext as NodeOutputTestRunnerContext;
        if (this._options.verbose) {
            console.log("Starting test " + context.testPath);
        }
    }

    testDidFail(test: OutputTest, result: OutputTestResult) {
        let context = test.testRunnerContext as NodeOutputTestRunnerContext;
        console.log("Test " + context.testPath + " failed.");
        if (result === OutputTestResult.OutputTestResultFailedTimeout) {
            console.log("Timed out.");
        } else if (result === OutputTestResult.OutputTestResultFailedIncorrectResult) {
            console.log("Expected result is:");
            console.log(test.expectedOutput());
            console.log("Actual result was:");
            console.log(test.actualOutput());
        } else if (result === OutputTestResult.OutputTestResultFailedThrewError) {
            console.log("Test threw error: " + test.error());
        }
    }

    testDidPass(test: OutputTest) {
        let context = test.testRunnerContext as NodeOutputTestRunnerContext;
        if (this._options.verbose) {
            console.log("Test " + context.testPath + " passed.");
        }
    }

    testingDidFinish() {
        console.log("Testing finished. " + this.passedTestCount() + " passed / " + this.failedTestCount() + " failed.");
    }
}

