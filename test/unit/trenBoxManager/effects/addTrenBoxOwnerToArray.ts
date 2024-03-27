import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanAddTrenBoxOwnerToArray(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    it("add trenBox owner to array", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[2];

      await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .addTrenBoxOwnerToArray(wETH.address, borrower);

      const ownerCount = await this.redeployedContracts.trenBoxManager.getTrenBoxOwnersCount(
        wETH.address
      );

      expect(ownerCount).to.be.equal(1n);
    });
  });

  context("when caller is not borrower operations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[2];

      await expect(
        this.contracts.trenBoxManager
          .connect(this.impostor)
          .addTrenBoxOwnerToArray(wETH.address, borrower)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyBorrowerOperations"
      );
    });
  });
}
