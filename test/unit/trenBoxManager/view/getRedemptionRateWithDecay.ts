import { expect } from "chai";

export default function shouldBehaveLikeGetRedemptionRateWithDecay(): void {
  it("should return correct redemption rate with decay", async function () {
    const { wETH } = this.collaterals.active;

    const redemptionRate = await this.contracts.adminContract.getRedemptionFeeFloor(wETH.address);
    expect(
      await this.contracts.trenBoxManager.getRedemptionRateWithDecay(wETH.address)
    ).to.be.equal(redemptionRate);
  });
}
