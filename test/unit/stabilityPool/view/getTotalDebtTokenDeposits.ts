import { expect } from "chai";

export default function shouldBehaveLikeGetTotalDebtTokenDeposits(): void {
  context("get token debt token deposits", function () {
    it("should return totalDebTokenDeposits", async function () {
      const totalDebtTokenDeposits = await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

      expect(totalDebtTokenDeposits).to.equal(0n);
    });
  });
}
