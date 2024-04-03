import { shouldBehaveLikeTimelockContract } from "./Timelock.behavior";

export function testTimelock(): void {
  describe("Timelock", function () {
    beforeEach(async function () {});

    shouldBehaveLikeTimelockContract();
  });
}
