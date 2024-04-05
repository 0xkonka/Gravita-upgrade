import { shouldBehaveLikeTrenMathTesterContract } from "./TrenMathTester.behavior";

export function testTrenMathTester(): void {
  describe("TrenMathTester", function () {
    beforeEach(async function () {});

    shouldBehaveLikeTrenMathTesterContract();
  });
}
