import { expect } from "chai";

export default function shouldBehaveLikeGetClaimableCollateralBalance(): void {
  context("for active collateral", function () {
    it("should return ZERO", async function () {
      const { wETH } = this.collaterals.active;

      const assetBalance = await this.contracts.trenBoxStorage.getClaimableCollateralBalance(
        wETH.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return ZERO", async function () {
      const { dai } = this.collaterals.inactive;

      const assetBalance = await this.contracts.trenBoxStorage.getClaimableCollateralBalance(
        dai.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });
}
