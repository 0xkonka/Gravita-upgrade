import { shouldBehaveLikeFlashLoanContract } from "./FlashLoan.behavior";

export function testFlashLoan(): void {
  describe("FlashLoan", function () {
    beforeEach(async function () {});

    shouldBehaveLikeFlashLoanContract();
  });
}
