import { expect } from "chai";

export default function shouldBehaveLikeGetCurrentICR(): void {
  it("should return correct ICR", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];
    const price = 10n;

    expect(
      await this.contracts.trenBoxManager.getCurrentICR(wETH.address, borrower, price)
    ).to.not.be.equal(0);
  });
}
