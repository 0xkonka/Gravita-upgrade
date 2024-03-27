import { expect } from "chai";

export default function shouldBehaveLikeGetRedemptionFeeWithDecay(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const assetDraw = 100n;

    expect(
      await this.contracts.trenBoxManager.getRedemptionFeeWithDecay(wETH.address, assetDraw)
    ).to.be.equal(0);
  });
}
