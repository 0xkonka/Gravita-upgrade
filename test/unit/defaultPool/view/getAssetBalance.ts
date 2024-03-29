import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeGetAssetBalance(): void {
  context("for active collateral", function () {
    it("should return correct borrowing fee", async function () {
      const { wETH } = this.collaterals.active;

      const assetBalance = await this.contracts.defaultPool.getAssetBalance(wETH.address);

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return BORROWING_FEE_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const assetBalance = await this.contracts.defaultPool.getAssetBalance(dai.address);

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const assetBalance = await this.contracts.defaultPool.getAssetBalance(nonExistentCollateral);

      expect(assetBalance).to.be.equal(0);
    });
  });
}