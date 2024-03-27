import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanMovePendingTrenBoxRewardsToActivePool(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const defaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await defaultPool.waitForDeployment();
    await defaultPool.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.defaultPool = defaultPool;
    this.redeployedContracts.activePool = activePool;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        defaultPool: this.redeployedContracts.defaultPool,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        activePool: this.redeployedContracts.activePool,
      });
    });

    it("executes movePendingTrenBoxRewardsToActivePool and returns zero", async function () {
      const { wETH } = this.collaterals.active;

      const res = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .movePendingTrenBoxRewardsToActivePool(wETH.address, 0, 0);

      expect(res).to.not.be.equal(0);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[2];
      const { wETH } = this.collaterals.active;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(impostor)
          .movePendingTrenBoxRewardsToActivePool(wETH.address, 100n, 50n)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
