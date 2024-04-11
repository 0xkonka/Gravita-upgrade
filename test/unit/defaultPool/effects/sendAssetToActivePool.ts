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

    const { erc20, erc20_with_6_decimals } = this.testContracts;
    await erc20.mint(this.signers.deployer, ethers.parseEther("1000"));
    await erc20.transfer(this.redeployedContracts.defaultPool, ethers.parseEther("100"));
    await erc20.transfer(this.redeployedContracts.activePool, ethers.parseEther("100"));

    await erc20_with_6_decimals.mint(this.signers.deployer, ethers.parseUnits("1000", 6));
    await erc20_with_6_decimals.transfer(
      this.redeployedContracts.defaultPool,
      ethers.parseUnits("100", 6)
    );
    await erc20_with_6_decimals.transfer(
      this.redeployedContracts.activePool,
      ethers.parseUnits("100", 6)
    );
  });

  context("when caller is tren box manager", function () {
    context("when collateral decimal is 18", function () {
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

    context("when collateral has less than 18 decimals", function () {
      beforeEach(async function () {
        await this.utils.connectRedeployedContracts({
          trenBoxManager: this.trenBoxManagerImpostor,
          borrowerOperations: this.borrowerOperationsImpostor,
          activePool: this.redeployedContracts.activePool,
          defaultPool: this.redeployedContracts.defaultPool,
        });

        const { erc20_with_6_decimals } = this.testContracts;
        const sendAmount = ethers.parseEther("100");

        await this.redeployedContracts.activePool
          .connect(this.borrowerOperationsImpostor)
          .receivedERC20(erc20_with_6_decimals, sendAmount);
        await this.redeployedContracts.activePool
          .connect(this.borrowerOperationsImpostor)
          .sendAsset(erc20_with_6_decimals, this.redeployedContracts.defaultPool, sendAmount);
      });

      it("should send asset to ActivePool", async function () {
        const { activePool, defaultPool } = this.redeployedContracts;
        const { erc20_with_6_decimals } = this.testContracts;
        const decimal = await erc20_with_6_decimals.decimals();

        const sendAmount = ethers.parseEther("100");
        // const assetAmount = ethers.parseEther("100");

        const activePoolBalanceBefore = await erc20_with_6_decimals.balanceOf(activePool);
        const defaultPoolBalanceBefore = await erc20_with_6_decimals.balanceOf(defaultPool);

        await defaultPool
          .connect(this.trenBoxManagerImpostor)
          .sendAssetToActivePool(erc20_with_6_decimals, sendAmount);

        const activePoolBalanceAfter = await erc20_with_6_decimals.balanceOf(activePool);
        const defaultPoolBalanceAfter = await erc20_with_6_decimals.balanceOf(defaultPool);

        expect(activePoolBalanceAfter).to.be.equal(
          activePoolBalanceBefore + sendAmount / BigInt(10 ** (18 - Number(decimal)))
        );
        expect(defaultPoolBalanceAfter).to.be.equal(
          defaultPoolBalanceBefore - sendAmount / BigInt(10 ** (18 - Number(decimal)))
        );
      });

      it("should emit DefaultPoolAssetBalanceUpdated and AssetSent", async function () {
        const { defaultPool } = this.redeployedContracts;
        const { erc20_with_6_decimals } = this.testContracts;
        const decimal = await erc20_with_6_decimals.decimals();
        const sendAmount = ethers.parseEther("100");
        const assetAmount = ethers.parseEther("50");

        const sendAssetTx = await defaultPool
          .connect(this.trenBoxManagerImpostor)
          .sendAssetToActivePool(erc20_with_6_decimals, assetAmount);

        await expect(sendAssetTx)
          .to.emit(defaultPool, "DefaultPoolAssetBalanceUpdated")
          .withArgs(erc20_with_6_decimals, sendAmount - assetAmount);

        await expect(sendAssetTx)
          .to.emit(defaultPool, "AssetSent")
          .withArgs(
            this.redeployedContracts.activePool,
            erc20_with_6_decimals,
            assetAmount / BigInt(10 ** (18 - Number(decimal)))
          );
      });
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
