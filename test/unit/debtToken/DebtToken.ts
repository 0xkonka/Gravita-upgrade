import { shouldBehaveLikeDebtTokenContract } from "./DebtToken.behavior";

export function testDebtToken(): void {
  describe("DebtToken", function () {
    beforeEach(async function () {});

    shouldBehaveLikeDebtTokenContract();
  });
}
