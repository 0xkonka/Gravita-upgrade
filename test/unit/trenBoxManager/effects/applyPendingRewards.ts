import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanApplyPendingRewards(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.impostor,
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeApplyPendingRewardsCorrectly();
  });

  context("when caller is borrowerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeApplyPendingRewardsCorrectly();
  });

  context("when caller is not trenBoxManagerOperations or borrowerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];

      await expect(
        this.contracts.trenBoxManager.connect(this.impostor)
        .applyPendingRewards(wETH.address, borrower)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxManager, "TrenBoxManager__OnlyTrenBoxManagerOperationsOrBorrowerOperations");
    });
  });

  function shouldBehaveLikeApplyPendingRewardsCorrectly() {
    it("should not be reverted", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[2];

      await this.redeployedContracts.trenBoxManager.connect(this.impostor).setTrenBoxStatus(wETH.address, borrower, 1n);
  
      const tx = await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .applyPendingRewards(wETH.address, borrower);
  
      await expect(tx).to.not.be.reverted;
    });
  }
}
