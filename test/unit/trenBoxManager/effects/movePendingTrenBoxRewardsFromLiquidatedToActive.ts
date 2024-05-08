import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanMovePendingTrenBoxRewardsFromLiquidatedToActive(): void {
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
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
      });
    });

    it("executes movePendingTrenBoxRewardsFromLiquidatedToActive and returns zero", async function () {
      const { wETH } = this.collaterals.active;

      const res = await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .movePendingTrenBoxRewardsFromLiquidatedToActive(wETH.address, 0, 0);

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
          .movePendingTrenBoxRewardsFromLiquidatedToActive(wETH.address, 100n, 50n)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
