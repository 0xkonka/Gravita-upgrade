import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanSetMintCap(): void {
  context("when modifying mint cap on active collateral", function () {
    it("setting mint cap should match value", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const mintCap = ethers.parseEther("10000");

      await this.contracts.adminContract.setMintCap(collateralAddress, mintCap);

      expect(await this.contracts.adminContract.getMintCap(collateralAddress)).to.be.equal(mintCap);
    });

    it("should emit MintCapChanged event", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const oldMintCap = await this.contracts.adminContract.getMintCap(collateralAddress);

      const mintCap = ethers.parseEther("10000");

      await expect(this.contracts.adminContract.setMintCap(collateralAddress, mintCap))
        .to.emit(this.contracts.adminContract, "MintCapChanged")
        .withArgs(oldMintCap, mintCap);
    });

    it("only owner can set mint cap", async function () {
      const collateralAddress = this.collaterals.wETH.address;
      const mintCap = ethers.parseEther("10000");

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract.connect(anotherAccount).setMintCap(collateralAddress, mintCap)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying mint cap on inactive collateral", function () {
    it.skip("should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const mintCap = ethers.parseEther("10000");

      await expect(
        this.contracts.adminContract.setMintCap(collateralAddress, mintCap)
      ).to.be.revertedWith("Collateral is not configured, use setCollateralParameters");
    });
  });
}
