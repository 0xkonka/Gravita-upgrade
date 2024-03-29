import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendAsset(): void {
  beforeEach(async function () {
    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const defaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await defaultPool.waitForDeployment();
    await defaultPool.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    this.redeployedContracts.defaultPool = defaultPool;
    this.redeployedContracts.activePool = activePool;

    this.trenBoxManagerImpostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(this.redeployedContracts.defaultPool, 100n);
    await erc20.transfer(this.redeployedContracts.activePool, 100n);
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManager: this.trenBoxManagerImpostor,
        borrowerOperations: this.borrowerOperationsImpostor,
        activePool: this.redeployedContracts.activePool,
        defaultPool: this.redeployedContracts.defaultPool,
      });
    });

    it("should return because of zero amount's value", async function () {
      const { defaultPool } = this.redeployedContracts;
      const { erc20 } = this.testContracts;

      const assetAmount = 0n;
      const balanceBefore = await erc20.balanceOf(this.trenBoxManagerImpostor.address);
      const defaultPoolBalanceBefore = await erc20.balanceOf(defaultPool);

      await defaultPool
        .connect(this.trenBoxManagerImpostor)
        .sendAssetToActivePool(erc20, assetAmount);
      const balanceAfter = await erc20.balanceOf(this.trenBoxManagerImpostor.address);
      const defaultPoolBalanceAfter = await erc20.balanceOf(defaultPool);

      expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
      expect(defaultPoolBalanceAfter).to.be.equal(defaultPoolBalanceBefore - assetAmount);
    });

    it("should emit DefaultPoolAssetBalanceUpdated and AssetSent", async function () {
      const { defaultPool } = this.redeployedContracts;
      const { erc20 } = this.testContracts;
      const sendAmount = 50n;
      const assetAmount = 15n;

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .receivedERC20(erc20, sendAmount);
      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .sendAsset(erc20, this.redeployedContracts.defaultPool, sendAmount);

      const sendAssetTx = await defaultPool
        .connect(this.trenBoxManagerImpostor)
        .sendAssetToActivePool(erc20, assetAmount);

      await expect(sendAssetTx)
        .to.emit(defaultPool, "DefaultPoolAssetBalanceUpdated")
        .withArgs(erc20, sendAmount - assetAmount);

      await expect(sendAssetTx)
        .to.emit(defaultPool, "AssetSent")
        .withArgs(this.redeployedContracts.activePool, erc20, assetAmount);
    });
  });

  context("when caller is not tren box manager", function () {
    it("reverts", async function () {
      const { wETH } = this.collaterals.active;
      const assetAmount = 2n;

      await expect(
        this.contracts.defaultPool
          .connect(this.trenBoxManagerImpostor)
          .sendAssetToActivePool(wETH.address, assetAmount)
      ).to.be.revertedWith("DefaultPool: Caller is not the TrenBoxManager");
    });
  });
}
