import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetIsActive(): void {
  context("for active collateral", function () {
    it("should return true", async function () {
      const { wETH } = this.collaterals.active;

      const isCollateralActive = await this.contracts.adminContract.getIsActive(wETH.address);

      expect(isCollateralActive).to.be.equal(true);
    });
  });

  context("for non-existent collateral", function () {
    it("should revert", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      await expect(
        this.contracts.adminContract.getIsActive(nonExistentCollateral)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });

  context("for inactive collateral", function () {
    it("should return false", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const addCollateralTx = await this.contracts.adminContract.addNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation
      );

      await addCollateralTx.wait();

      const isCollateralActive = await this.contracts.adminContract.getIsActive(
        testCollateral.address
      );

      expect(isCollateralActive).to.be.equal(false);
    });
  });
}
