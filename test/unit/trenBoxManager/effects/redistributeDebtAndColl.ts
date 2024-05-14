import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanRedistributeDebtAndColl(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.trenBoxStorage = trenBoxStorage;
    this.redeployedContracts.stabilityPool = stabilityPool;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.borrowerOperationsImpostor,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
        stabilityPool: this.redeployedContracts.stabilityPool,
        borrowerOperations: this.borrowerOperationsImpostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
      });

      await this.redeployedContracts.trenBoxStorage
        .connect(this.borrowerOperationsImpostor)
        .increaseActiveDebt(this.collaterals.active.wETH.address, 50n);
    });

    it("executes redistributeDebtAndColl and emit LTermsUpdated", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .increaseTrenBoxColl(wETH.address, borrower, 50n);
      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .updateStakeAndTotalStakes(wETH.address, borrower);

      const tx = await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .redistributeDebtAndColl(wETH.address, 20n, 0, 0, 0);

      await expect(tx)
        .to.emit(this.redeployedContracts.trenBoxManager, "LTermsUpdated")
        .withArgs(wETH.address, 0, 400000000000000000n);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.borrowerOperationsImpostor)
          .redistributeDebtAndColl(wETH.address, 20n, 0, 0, 0)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
