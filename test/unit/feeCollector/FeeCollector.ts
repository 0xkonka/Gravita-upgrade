import { shouldBehaveLikeFeeCollectorContract } from "./FeeCollector.behavior";

export function testFeeCollector(): void {
  describe("FeeCollector", function () {
    beforeEach(async function () { });

    shouldBehaveLikeFeeCollectorContract();
  });
}
