import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanUpdateSystemSnapshots_excludeCollRemainder(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.activePool = activePool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.impostor,
        activePool: this.redeployedContracts.activePool,
      });

      const addressesForSetAddresses2 = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses2);

      await this.redeployedContracts.activePool
        .connect(this.impostor)
        .receivedERC20(this.collaterals.active.wETH.address, 20n);
    });

    it("executes updateSystemSnapshots_excludeCollRemainder and emit SystemSnapshotsUpdated", async function () {
      const { wETH } = this.collaterals.active;
      const collRemainder = 5n;

      const tx = await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
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
        .connect(this.impostor)
        .updateSystemSnapshots_excludeCollRemainder(wETH.address, collRemainder)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxManager, "TrenBoxManager__OnlyTrenBoxManagerOperations");
    });
  });
}
