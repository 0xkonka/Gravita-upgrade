import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetMCR(): void {
  context("for active collateral", function () {
    it("should return correct minimal collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      await time.increase(time.duration.weeks(1));
      const collateralMcr = await this.contracts.adminContract.getMcr(wETH.address);

      expect(collateralMcr).to.be.equal(wETH.MCR);
    });
  });

  context("for inactive collateral", function () {
    it("should return MCR_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;
      const expectedDefaultMcr = await this.contracts.adminContract.MCR_DEFAULT();

      const collateralMcr = await this.contracts.adminContract.getMcr(dai.address);

      expect(collateralMcr).to.be.equal(expectedDefaultMcr);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const collateralMcr = await this.contracts.adminContract.getMcr(nonExistentCollateral);

      expect(collateralMcr).to.be.equal(0n);
    });
  });
}
