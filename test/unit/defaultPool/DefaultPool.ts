import { shouldBehaveLikeDefaultPoolContract } from "./DefaultPool.behavior";

export function testDefaultPool(): void {
  describe("DefaultPool", function () {
    beforeEach(async function () {});

    shouldBehaveLikeDefaultPoolContract();
  });
}
