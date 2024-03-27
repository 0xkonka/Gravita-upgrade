import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanRemoveStake(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];
    this.trenBoxManagerOperationsImpostor = this.signers.accounts[3];
  });

  context("when caller is borrowerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);

      this.impostor = this.borrowerOperationsImpostor;
    });

    shouldBehaveLikeRemoveStakeCorrectly();
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);

      this.impostor = this.trenBoxManagerOperationsImpostor;
    });

    shouldBehaveLikeRemoveStakeCorrectly();
  });

  context("when caller is not borrowerOperations or trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.impostor)
          .removeStake(wETH.address, borrower)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperationsOrBorrowerOperations"
      );
    });
  });

  function shouldBehaveLikeRemoveStakeCorrectly() {
    it("executes removeStake and returns zero", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];

      await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .removeStake(wETH.address, borrower);

      expect(
        await this.redeployedContracts.trenBoxManager.getTrenBoxStake(wETH.address, borrower)
      ).to.be.equal(0);
    });
  }
}
