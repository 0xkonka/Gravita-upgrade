import { expect } from "chai";

export default function shouldBehaveLikeGetCollateral(): void {
  context("for active collateral", function () {
    it("should return correct borrowing rate", async function () {
      const { wETH } = this.collaterals.active;

      expect(await this.contracts.stabilityPool.getCollateral(wETH.address)).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return zero", async function () {
      const { dai } = this.collaterals.inactive;

      expect(await this.contracts.stabilityPool.getCollateral(dai.address)).to.be.equal(0n);
    });
  });

  context("for non-existent collateral", function () {
    it("should return zero", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      await expect(
        this.contracts.stabilityPool.getCollateral(testCollateral.address)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });
}
