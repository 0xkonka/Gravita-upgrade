import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetPercentDivisor(): void {
  context("for active collateral", function () {
    it("should return correct percent divisor", async function () {
      const { wETH } = this.collaterals.active;

      const expectedPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(wETH.address);

      expect(percentDivisor).to.be.equal(expectedPercentDivisor);
    });
  });

  context("for inactive collateral", function () {
    it("should return PERCENT_DIVISOR_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(dai.address);

      expect(percentDivisor).to.be.equal(expectedPercentDivisor);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const percentDivisor =
        await this.contracts.adminContract.getPercentDivisor(nonExistentCollateral);

      expect(percentDivisor).to.be.equal(0);
    });
  });
}
