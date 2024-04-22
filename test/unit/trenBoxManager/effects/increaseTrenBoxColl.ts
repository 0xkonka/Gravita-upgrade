import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseTrenBoxColl(): void {
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

    it("executes increaseTrenBoxColl and then return correct value", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const amountToIncrease = 10n;

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .increaseTrenBoxColl(wETH.address, borrower, amountToIncrease);

      const amountAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxColl(
        wETH.address,
        borrower
      );

      expect(amountAfter).to.be.equal(amountToIncrease);
    });
  });

  context("when caller is not borrowerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[2];
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const amountToIncrease = 2n;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(impostor)
          .increaseTrenBoxColl(wETH.address, borrower, amountToIncrease)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyBorrowerOperations"
      );
    });
  });
}
