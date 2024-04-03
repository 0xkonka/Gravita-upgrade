import { shouldBehaveLikeStabilityPoolContract } from "./StabilityPool.behavior";

export function testStabilityPool(): void {
  describe("StabilityPool", function () {
    beforeEach(async function () {});

    shouldBehaveLikeStabilityPoolContract();
  });
}
