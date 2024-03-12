import { time } from "@nomicfoundation/hardhat-network-helpers";

import { shouldBehaveLikeLockContract } from "./Lock.behavior";

export function testLock(): void {
  describe("Lock", function () {
    beforeEach(async function () {
      const ONE_YEAR_IN_SECS = time.duration.years(1);
      const ONE_GWEI = 1_000_000_000;

      const lockedAmount = ONE_GWEI;
      const unlockTime = (await time.latest()) + ONE_YEAR_IN_SECS;

      this.unlockTime = unlockTime;
      this.lockedAmount = lockedAmount;
    });

    shouldBehaveLikeLockContract();
  });
}
