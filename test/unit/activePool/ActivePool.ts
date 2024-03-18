import { shouldBehaveLikeActivePoolContract } from "./ActivePool.behavior";

export function testActivePool(): void {
  describe("ActivePool", function () {
    beforeEach(async function () {});

    shouldBehaveLikeActivePoolContract();
  });
}
