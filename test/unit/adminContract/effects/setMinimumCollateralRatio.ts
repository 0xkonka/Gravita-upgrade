import { expect } from "chai";
import { ethers } from "ethers";

const MIN_MCR = ethers.parseEther("1.01");
const MAX_MCR = ethers.parseEther("10");

export default function shouldBehaveLikeCanSetMinimumCollateralRatio(): void {
  context("when modifying MCR on active collateral", function () {
    it("set MCR should match value", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const mcr = "1500000000000000000";

      await this.contracts.adminContract.setMCR(collateralAddress, mcr);

      expect(await this.contracts.adminContract.getMcr(collateralAddress)).to.be.equal(mcr);
    });

    it("should emit MCRChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const oldMCR = await this.contracts.adminContract.getMcr(collateralAddress);

      const newMCR = "1500000000000000000";

      await expect(this.contracts.adminContract.setMCR(collateralAddress, newMCR))
        .to.emit(this.contracts.adminContract, "MCRChanged")
        .withArgs(oldMCR, newMCR);
    });

    it("setting MCR too high should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newMCR = MAX_MCR + 1n;

      await expect(this.contracts.adminContract.setMCR(collateralAddress, newMCR))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("MCR", newMCR, MIN_MCR, MAX_MCR);
    });

    it("setting MCR too low should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newMCR = MIN_MCR - 1n;

      await expect(this.contracts.adminContract.setMCR(collateralAddress, newMCR))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("MCR", newMCR, MIN_MCR, MAX_MCR);
    });

    it("only owner can set MCR", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const newMCR = "1500000000000000000";

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract.connect(anotherAccount).setMCR(collateralAddress, newMCR)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying MCR on inactive collateral", function () {
    it("set MCR should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const mcr = "1500000000000000000";

      await expect(this.contracts.adminContract.setMCR(collateralAddress, mcr)).to.be.revertedWith(
        "Collateral is not configured, use setCollateralParameters"
      );
    });
  });
}
