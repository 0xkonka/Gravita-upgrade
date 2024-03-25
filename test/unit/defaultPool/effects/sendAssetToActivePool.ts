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

    this.impostor = this.signers.accounts[1];
    this.impostor2 = this.signers.accounts[2];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(this.redeployedContracts.defaultPool, 100n);
    await erc20.transfer(this.redeployedContracts.activePool, 100n);
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
        activePool: this.redeployedContracts.activePool
      });

      const addressesForSetAddresses2 = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
        borrowerOperations: this.impostor2,
        defaultPool: this.redeployedContracts.defaultPool,
      });

      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses);
      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses2);
    });

    it("should return because of zero amount's value", async function () {
      const { defaultPool } = this.redeployedContracts;
      const { erc20 } = this.testContracts;
  
      const assetAmount = 0n;
      const balanceBefore = await erc20.balanceOf(this.impostor.address);
      const defaultPoolBalanceBefore = await erc20.balanceOf(defaultPool);
  
      await defaultPool.connect(this.impostor).sendAssetToActivePool(erc20, assetAmount);
      const balanceAfter = await erc20.balanceOf(this.impostor.address);
      const defaultPoolBalanceAfter = await erc20.balanceOf(defaultPool);
  
      expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
      expect(defaultPoolBalanceAfter).to.be.equal(defaultPoolBalanceBefore - assetAmount);
    });
  
    it("should emit DefaultPoolAssetBalanceUpdated and AssetSent", async function () {
      const { defaultPool } = this.redeployedContracts;
      const { erc20 } = this.testContracts;
      const sendAmount = 50n;
      const assetAmount = 15n;

      await this.redeployedContracts.activePool.connect(this.impostor2)
        .receivedERC20(erc20, sendAmount);
      await this.redeployedContracts.activePool.connect(this.impostor2)
        .sendAsset(erc20, this.redeployedContracts.defaultPool, sendAmount);

      const sendAssetTx = await defaultPool
        .connect(this.impostor)
        .sendAssetToActivePool(erc20, assetAmount);

      await expect(sendAssetTx)
        .to.emit(defaultPool, "DefaultPoolAssetBalanceUpdated")
        .withArgs(erc20, sendAmount - assetAmount);

      await expect(sendAssetTx)
        .to.emit(defaultPool, "AssetSent")
        .withArgs(this.redeployedContracts.activePool, erc20, assetAmount);
    });
  });

  context(
    "when caller is not tren box manager",
    function () {
      it("reverts", async function () {
        const { wETH } = this.collaterals.active;
        const assetAmount = 2n;

        await expect(
          this.contracts.defaultPool
            .connect(this.impostor)
            .sendAssetToActivePool(wETH.address, assetAmount)
        ).to.be.revertedWith("DefaultPool: Caller is not the TrenBoxManager");
      });
    }
  );
}
