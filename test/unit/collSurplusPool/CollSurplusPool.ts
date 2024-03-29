import { shouldBehaveLikeCollSurplusPoolPoolContract } from "./CollSurplusPool.behavior";

export function testCollSurplusPool(): void {
  describe("CollSurplusPoolPool", function () {
    beforeEach(async function () {});

    shouldBehaveLikeCollSurplusPoolPoolContract();
  });
}
