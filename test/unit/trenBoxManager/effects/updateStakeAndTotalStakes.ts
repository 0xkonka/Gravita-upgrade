import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanUpdateStakeAndTotalStakes(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is borrowerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    it("executes updateTrenBoxRewardSnapshots and emit TotalStakesUpdated", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];

      const tx = await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .updateStakeAndTotalStakes(wETH.address, borrower);

      await expect(tx)
        .to.emit(this.redeployedContracts.trenBoxManager, "TotalStakesUpdated")
        .withArgs(wETH.address, 0);
    });
  });

  context("when caller is not borrowerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[3];

      await expect(
        this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .updateStakeAndTotalStakes(wETH.address, borrower)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxManager, "TrenBoxManager__OnlyBorrowerOperations");
    });
  });
}
