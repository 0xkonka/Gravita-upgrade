import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendAsset(): void {
  beforeEach(async function () {
    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const redeployedActivePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await redeployedActivePool.waitForDeployment();
    await redeployedActivePool.initialize();

    this.redeployedContracts.activePool = redeployedActivePool;

    this.impostor = this.signers.accounts[1];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(redeployedActivePool, 5n);
    await erc20.approve(this.impostor, 2n);
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        trenBoxManagerOperations: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        stabilityPool: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context(
    "when caller is not borrower operations, nor tren box manager, nor stability pool, nor tren box manager operations",
    function () {
      it("reverts", async function () {
        const { wETH } = this.collaterals.active;
        const assetAmount = 2n;
        const recipient = this.signers.accounts[2];

        await expect(
          this.contracts.activePool
            .connect(this.impostor)
            .sendAsset(wETH.address, recipient, assetAmount)
        ).to.be.revertedWithCustomError(
          this.contracts.activePool,
          "ActivePool__NotAuthorizedContract"
        );
      });
    }
  );
}

function shouldBehaveLikeCanSendAssetCorrectly() {
  it("sends asset amount", async function () {
    const { activePool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await activePool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];
    const balanceBefore = await erc20.balanceOf(recipient.address);
    const activePoolBalanceBefore = await erc20.balanceOf(activePool);

    await activePool.connect(this.impostor).sendAsset(erc20, recipient, assetAmount);
    const balanceAfter = await erc20.balanceOf(recipient.address);
    const activePoolBalanceAfter = await erc20.balanceOf(activePool);

    expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
    expect(activePoolBalanceAfter).to.be.equal(activePoolBalanceBefore - assetAmount);
  });

  it("should emit ActivePoolAssetBalanceUpdated", async function () {
    const { activePool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await activePool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await activePool
      .connect(this.impostor)
      .sendAsset(erc20, recipient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "ActivePoolAssetBalanceUpdated")
      .withArgs(erc20, 3n);
  });

  it("should emit AssetSent", async function () {
    const { activePool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;
    await activePool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await activePool
      .connect(this.impostor)
      .sendAsset(erc20, recipient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "AssetSent")
      .withArgs(recipient, erc20, assetAmount);
  });
}
