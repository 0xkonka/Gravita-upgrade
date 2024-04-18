import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetTrenBoxStatus(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is borrowerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    it("executes setTrenBoxStatus and then return correct status", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const status = 2n;

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .setTrenBoxStatus(wETH.address, borrower, status);

      const statusAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxStatus(
        wETH.address,
        borrower
      );

      expect(statusAfter).to.be.equal(status);
    });
  });

  context("when caller is not borrowerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[2];
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const status = 2n;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(impostor)
          .setTrenBoxStatus(wETH.address, borrower, status)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyBorrowerOperations"
      );
    });
  });
}
