import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetDebtTokenGasCompensation(): void {
  context("for active collateral", function () {
    it("should return correct debt token gas compensation", async function () {
      const { wETH } = this.collaterals.active;

      const gasCompensation = await this.contracts.adminContract.getDebtTokenGasCompensation(
        wETH.address
      );

      expect(gasCompensation).to.be.equal(wETH.gasCompensation);
    });
  });

  context("for inactive collateral", function () {
    it("should return correct debt token gas compensation", async function () {
      const { dai } = this.collaterals.inactive;

      const gasCompensation = await this.contracts.adminContract.getDebtTokenGasCompensation(
        dai.address
      );

      expect(gasCompensation).to.be.equal(dai.gasCompensation);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const gasCompensation =
        await this.contracts.adminContract.getDebtTokenGasCompensation(nonExistentCollateral);

      expect(gasCompensation).to.be.equal(0n);
    });
  });
}
