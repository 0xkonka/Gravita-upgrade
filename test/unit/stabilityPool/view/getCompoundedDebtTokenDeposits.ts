import { expect } from "chai";

export default function shouldBehaveLikeGetCompoundedDebtTokenDeposits(): void {
  context("get compound debt token deposits", function () {
    it("should return compounded Debt Token Deposits", async function () {
      const user = this.signers.accounts[1];

      const compoundedDebtTokenDeposits =
        await this.contracts.stabilityPool.getCompoundedDebtTokenDeposits(user);

      expect(compoundedDebtTokenDeposits).to.equal(0n);
    });
  });
}
