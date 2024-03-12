import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetMintCap(): void {
  context("for active collateral", function () {
    it("should return correct mint cap", async function () {
      const { wETH } = this.collaterals.active;

      const mintCap = await this.contracts.adminContract.getMintCap(wETH.address);

      expect(mintCap).to.be.equal(wETH.mintCap);
    });
  });

  context("for inactive collateral", function () {
    it("should return MINT_CAP_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedMintCap = await this.contracts.adminContract.MINT_CAP_DEFAULT();
      const mintCap = await this.contracts.adminContract.getMintCap(dai.address);

      expect(mintCap).to.be.equal(expectedMintCap);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const mintCap = await this.contracts.adminContract.getMintCap(nonExistentCollateral);

      expect(mintCap).to.be.equal(0);
    });
  });
}
