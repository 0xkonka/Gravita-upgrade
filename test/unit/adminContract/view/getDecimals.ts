import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetDecimals(): void {
  context("for active collateral", function () {
    it("should return correct decimals amount", async function () {
      const { wETH } = this.collaterals.active;

      const decimals = await this.contracts.adminContract.getDecimals(wETH.address);

      expect(decimals).to.be.equal(wETH.decimals);
    });
  });

  context("for inactive collateral", function () {
    it("should return correct decimals amount", async function () {
      const { dai } = this.collaterals.inactive;

      const decimals = await this.contracts.adminContract.getDecimals(dai.address);

      expect(decimals).to.be.equal(dai.decimals);
    });
  });

  context("for non-existent collateral", function () {
    it("should revert", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      await expect(
        this.contracts.adminContract.getDecimals(nonExistentCollateral)
      ).to.be.revertedWith("collateral does not exist");
    });
  });
}
