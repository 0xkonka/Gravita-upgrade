import { shouldBehaveLikeTrenBoxManagerContract } from "./TrenBoxManager.behavior";

export function testTrenBoxManager(): void {
  describe("TrenBoxManager", function () {
    beforeEach(async function () {});

    shouldBehaveLikeTrenBoxManagerContract();
  });
}
