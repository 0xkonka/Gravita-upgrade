import { expect } from "chai";
import { ethers } from "hardhat";

import { TRENToken, TRENToken__factory } from ".../../../types";

let erc20token: TRENToken;

export default function shouldBehaveLikeCanSendAsset(): void {
  beforeEach(async function () {
    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const redeployedActivePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await redeployedActivePool.waitForDeployment();
    await redeployedActivePool.initialize();

    this.redeployedContracts.activePool = redeployedActivePool;

    this.impostor = this.signers.accounts[1];

    const ERC20Token: TRENToken__factory = await ethers.getContractFactory("TRENToken");
    erc20token = await ERC20Token.connect(this.signers.deployer).deploy(this.signers.deployer);
    await erc20token.waitForDeployment();

    await erc20token.transfer(redeployedActivePool, 5n);
    await erc20token.approve(this.impostor, 2n);
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
        ).to.be.revertedWith("ActivePool: Caller is not an authorized Tren contract");
      });
    }
  );
}

function shouldBehaveLikeCanSendAssetCorrectly() {
  it("sends asset amount", async function () {
    const { activePool } = this.redeployedContracts;

    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];
    const balanceBefore = await erc20token.balanceOf(recipient.address);
    const activePoolBalanceBefore = await erc20token.balanceOf(activePool);

    await activePool.connect(this.impostor).sendAsset(erc20token, recipient, assetAmount);
    const balanceAfter = await erc20token.balanceOf(recipient.address);
    const activePoolBalanceAfter = await erc20token.balanceOf(activePool);

    expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
    expect(activePoolBalanceAfter).to.be.equal(activePoolBalanceBefore - assetAmount);
  });

  it("should emit ActivePoolAssetBalanceUpdated", async function () {
    const { activePool } = this.redeployedContracts;

    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await activePool
      .connect(this.impostor)
      .sendAsset(erc20token, recipient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "ActivePoolAssetBalanceUpdated")
      .withArgs(erc20token, 3n);
  });

  it("should emit AssetSent", async function () {
    const { activePool } = this.redeployedContracts;
    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await activePool
      .connect(this.impostor)
      .sendAsset(erc20token, recipient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "AssetSent")
      .withArgs(recipient, erc20token, assetAmount);
  });
}
