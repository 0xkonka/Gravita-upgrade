import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeGetCollateral(): void {
  context("for active collateral", function () {
    it("should return correct borrowing fee", async function () {
      const { wETH } = this.collaterals.active;

      const user = this.signers.accounts[1];

      const assetBalance = await this.contracts.collSurplusPool.getCollateral(wETH.address, user);

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return BORROWING_FEE_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const user = this.signers.accounts[1];

      const assetBalance = await this.contracts.collSurplusPool.getCollateral(dai.address, user);

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const user = this.signers.accounts[1];

      const assetBalance = await this.contracts.collSurplusPool.getCollateral(nonExistentCollateral, user.address);

      expect(assetBalance).to.be.equal(0n);
    });
  });
}
