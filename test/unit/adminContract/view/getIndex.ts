import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetIndex(): void {
  context("for active collateral", function () {
    it("should return correct collateral index", async function () {
      const { wETH } = this.collaterals.active;

      const collateralIndex = await this.contracts.adminContract.getIndex(wETH.address);

      expect(collateralIndex).to.be.equal(0);
    });
  });

  context("for inactive collateral", function () {
    it("should return correct collateral index", async function () {
      const { dai } = this.collaterals.inactive;

      const collateralIndex = await this.contracts.adminContract.getIndex(dai.address);

      expect(collateralIndex).to.be.equal(1);
    });
  });

  context("for non-existent collateral", function () {
    it("should revert", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      await expect(
        this.contracts.adminContract.getIndex(nonExistentCollateral)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });
}
