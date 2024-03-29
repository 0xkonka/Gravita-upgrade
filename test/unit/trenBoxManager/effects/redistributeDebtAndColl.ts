import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanRedistributeDebtAndColl(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const defaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await defaultPool.waitForDeployment();
    await defaultPool.initialize();

    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.activePool = activePool;
    this.redeployedContracts.defaultPool = defaultPool;
    this.redeployedContracts.stabilityPool = stabilityPool;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.borrowerOperationsImpostor,
        activePool: this.redeployedContracts.activePool,
        defaultPool: this.redeployedContracts.defaultPool,
        stabilityPool: this.redeployedContracts.stabilityPool,
        borrowerOperations: this.borrowerOperationsImpostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
      });

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.collaterals.active.wETH.address, 50n);
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
