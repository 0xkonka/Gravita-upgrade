import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanUpdateSystemSnapshots_excludeCollRemainder(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
        borrowerOperations: this.borrowerOperationsImpostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
      });

      await this.redeployedContracts.trenBoxStorage
        .connect(this.borrowerOperationsImpostor)
        .increaseActiveCollateral(this.collaterals.active.wETH.address, 20n);
    });

    it("executes updateSystemSnapshots_excludeCollRemainder and emit SystemSnapshotsUpdated", async function () {
      const { wETH } = this.collaterals.active;
      const collRemainder = 5n;

      const tx = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .updateSystemSnapshots_excludeCollRemainder(wETH.address, collRemainder);

      await expect(tx)
        .to.emit(this.redeployedContracts.trenBoxManager, "SystemSnapshotsUpdated")
        .withArgs(wETH.address, 0, 15n);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const collRemainder = 5n;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.borrowerOperationsImpostor)
          .updateSystemSnapshots_excludeCollRemainder(wETH.address, collRemainder)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
