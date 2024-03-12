import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetCCR(): void {
  context("for active collateral", function () {
    it("should return correct critical collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      const collateralMcr = await this.contracts.adminContract.getCcr(wETH.address);

      expect(collateralMcr).to.be.equal(wETH.CCR);
    });
  });

  context("for inactive collateral", function () {
    it("should return CCR_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;
      const expectedDefaultMcr = await this.contracts.adminContract.CCR_DEFAULT();

      const collateralMcr = await this.contracts.adminContract.getCcr(dai.address);

      expect(collateralMcr).to.be.equal(expectedDefaultMcr);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const collateralMcr = await this.contracts.adminContract.getCcr(nonExistentCollateral);

      expect(collateralMcr).to.be.equal(0n);
    });
  });
}
