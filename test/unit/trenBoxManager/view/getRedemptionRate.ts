import { expect } from "chai";

export default function shouldBehaveLikeGetRedemptionRate(): void {
  it("should return correct redemption rate", async function () {
    const { wETH } = this.collaterals.active;

    const redemptionRate = await this.contracts.adminContract.getRedemptionFeeFloor(wETH.address);
    expect(await this.contracts.trenBoxManager.getRedemptionRate(wETH.address))
      .to.be.equal(redemptionRate);
  });
}
