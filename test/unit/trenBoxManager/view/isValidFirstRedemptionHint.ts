import { expect } from "chai";

export default function shouldBehaveLikeIsValidFirstRedemptionHint(): void {
  it("should return false", async function () {
    const { wETH } = this.collaterals.active;
    const firstRedemptionHint = this.signers.accounts[1];
    const price = 50n;

    expect(await this.contracts.trenBoxManager.isValidFirstRedemptionHint(wETH.address, firstRedemptionHint, price))
      .to.be.equal(false);
  });
}
