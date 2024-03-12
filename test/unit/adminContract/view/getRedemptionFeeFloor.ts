import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetRedemptionFeeFloor(): void {
  context("for active collateral", function () {
    it("should return correct redemption fee floor", async function () {
      const { wETH } = this.collaterals.active;

      const expectedRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();
      const redemptionFeeFloor = await this.contracts.adminContract.getRedemptionFeeFloor(
        wETH.address
      );

      expect(redemptionFeeFloor).to.be.equal(expectedRedemptionFeeFloor);
    });
  });

  context("for inactive collateral", function () {
    it("should return REDEMPTION_FEE_FLOOR_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();
      const redemptionFeeFloor = await this.contracts.adminContract.getRedemptionFeeFloor(
        dai.address
      );

      expect(redemptionFeeFloor).to.be.equal(expectedRedemptionFeeFloor);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const redemptionFeeFloor =
        await this.contracts.adminContract.getRedemptionFeeFloor(nonExistentCollateral);

      expect(redemptionFeeFloor).to.be.equal(0);
    });
  });
}
