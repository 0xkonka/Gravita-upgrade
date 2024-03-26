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

    this.impostor = this.signers.accounts[1];
    this.impostor2 = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.impostor,
        activePool: this.redeployedContracts.activePool,
        defaultPool: this.redeployedContracts.defaultPool,
        stabilityPool: this.redeployedContracts.stabilityPool,
        borrowerOperations: this.impostor2
      });

      const addressesForSetAddresses2 = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        borrowerOperations: this.impostor
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses2);
      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses2);
      await this.redeployedContracts.stabilityPool.setAddresses(addressesForSetAddresses2);

      await this.redeployedContracts.activePool.connect(this.impostor).increaseDebt(this.collaterals.active.wETH.address, 50n);
    });

    it("executes redistributeDebtAndColl and emit LTermsUpdated", async function () {
        const { wETH } = this.collaterals.active;
        const borrower = this.signers.accounts[4];

        await this.redeployedContracts.trenBoxManager.connect(this.impostor2)
          .increaseTrenBoxColl(wETH.address, borrower, 50n);
        await this.redeployedContracts.trenBoxManager.connect(this.impostor2)
          .updateStakeAndTotalStakes(wETH.address, borrower);
  
        const tx = await this.redeployedContracts.trenBoxManager
          .connect(this.impostor)
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
        .connect(this.impostor)
        .redistributeDebtAndColl(wETH.address, 20n, 0, 0, 0)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxManager, "TrenBoxManager__OnlyTrenBoxManagerOperations");
    });
  });
}
