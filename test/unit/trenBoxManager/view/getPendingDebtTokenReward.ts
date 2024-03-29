import { expect } from "chai";

export default function shouldBehaveLikeGetPendingDebtTokenReward(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];

    expect(
      await this.contracts.trenBoxManager.getPendingDebtTokenReward(wETH.address, borrower)
    ).to.be.equal(0);
  });
}
