import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetRedemptionBlockTimestamp(): void {
  context("for active collateral", function () {
    it("should return correct redemption block timestamp", async function () {
      const { wETH } = this.collaterals.active;

      const expectedRedemptionBlockTimestamp =
        await this.contracts.adminContract.REDEMPTION_BLOCK_TIMESTAMP_DEFAULT();
      const redemptionBlockTimestamp =
        await this.contracts.adminContract.getRedemptionBlockTimestamp(wETH.address);

      expect(redemptionBlockTimestamp).to.be.equal(expectedRedemptionBlockTimestamp);
    });
  });

  context("for inactive collateral", function () {
    it("should return REDEMPTION_BLOCK_TIMESTAMP_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedRedemptionBlockTimestamp =
        await this.contracts.adminContract.REDEMPTION_BLOCK_TIMESTAMP_DEFAULT();
      const redemptionBlockTimestamp =
        await this.contracts.adminContract.getRedemptionBlockTimestamp(dai.address);

      expect(redemptionBlockTimestamp).to.be.equal(expectedRedemptionBlockTimestamp);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const redemptionBlockTimestamp =
        await this.contracts.adminContract.getRedemptionBlockTimestamp(nonExistentCollateral);

      expect(redemptionBlockTimestamp).to.be.equal(0);
    });
  });
}
