import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeGetActiveCollateralBalance(): void {
  context("for active collateral", function () {
    it("should return ZERO", async function () {
      const { wETH } = this.collaterals.active;

      const assetBalance = await this.contracts.trenBoxStorage.getActiveCollateralBalance(
        wETH.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return ZERO", async function () {
      const { dai } = this.collaterals.inactive;

      const assetBalance = await this.contracts.trenBoxStorage.getActiveCollateralBalance(
        dai.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });
}
