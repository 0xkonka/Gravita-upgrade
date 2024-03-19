import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanOpenTrenBox() {
  context("when asset is active", function () {
    beforeEach(async function () {
      const user = this.signers.accounts[0];

      this.upperHint = ethers.ZeroAddress; // TODO: What's upper hint?
      this.lowerHint = ethers.ZeroAddress;

      const { erc20 } = this.testContracts;
      const { adminContract } = this.contracts;

      await adminContract.addNewCollateral(await erc20.getAddress(), 200n, 18);
      await adminContract.setIsActive(await erc20.getAddress(), true);

      await erc20.mint(user.address, ethers.parseEther("1000"));

      this.user = user;
    });
  });
  context("when asset is not active", function () {
    it("should revert", async function () {
      const notActiveAsset = this.collaterals.inactive.dai;

      const user = this.signers.accounts[0];

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notActiveAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWith("BorrowerOperations: Asset is not active");
    });
  });

  context("when asset is not supported", function () {
    it("should revert", async function () {
      const notSupportedAsset = this.collaterals.notAdded.testCollateral;

      const user = this.signers.accounts[0];

      const upperHint = ethers.ZeroAddress;
      const lowerHint = ethers.ZeroAddress;

      await expect(
        this.contracts.borrowerOperations
          .connect(user)
          .openTrenBox(notSupportedAsset.address, 100n, 100n, upperHint, lowerHint)
      ).to.be.revertedWith("collateral does not exist");
    });
  });
}
