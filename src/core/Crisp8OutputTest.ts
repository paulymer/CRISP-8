/// <reference path="OutputTest.ts" />
/// <reference path="Crisp8.ts" />

const Crisp8OutputTestCycleLimit = 10000;

class Crisp8OutputTest extends OutputTest {
    generateActualOutput() {
        let crisp8 = new Crisp8();
        crisp8.loadROM(this.input());

        let testCompleted = false;
        for (let cycleCount = 0; cycleCount < Crisp8OutputTestCycleLimit; cycleCount++) {
            crisp8.step();
            if (crisp8.programCounter === 0x111) {
                testCompleted = true;
                break;
            }
        }

        if (!testCompleted) {
            this.testTimedOut();
        }

        return crisp8.debugString();
    }

    shouldCatchError(error: any) {
        return (error instanceof Crisp8Error);
    }
}

