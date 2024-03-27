import { expect } from "chai";

export default function shouldBehaveLikeHasPendingRewards(): void {
  it("should return false", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];

    expect(
      await this.contracts.trenBoxManager.hasPendingRewards(wETH.address, borrower)
    ).to.be.equal(false);
  });
}
