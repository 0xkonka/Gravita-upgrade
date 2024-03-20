import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendAsset(): void {
  beforeEach(async function () {
    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const redeployedDefaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await redeployedDefaultPool.waitForDeployment();
    await redeployedDefaultPool.initialize();

    this.redeployedContracts.defaultPool = redeployedDefaultPool;

    this.impostor = this.signers.accounts[1];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(redeployedDefaultPool, 5n);
    await erc20.approve(this.impostor, 2n);
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context(
    "when caller is not tren box manager",
    function () {
      it("reverts", async function () {
        const { wETH } = this.collaterals.active;
        const assetAmount = 2n;
        const recipient = this.signers.accounts[2];

        await expect(
          this.contracts.defaultPool
            .connect(this.impostor)
            .sendAssetToActivePool(wETH.address, assetAmount)
        ).to.be.revertedWith("DefaultPool: Caller is not the TrenBoxManager");
      });
    }
  );
}

function shouldBehaveLikeCanSendAssetCorrectly() {
  it("sends asset amount", async function () {
    const { defaultPool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await defaultPool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];
    const balanceBefore = await erc20.balanceOf(recipient.address);
    const defaultPoolBalanceBefore = await erc20.balanceOf(defaultPool);

    await defaultPool.connect(this.impostor).sendAssetToActivePool(erc20, assetAmount);
    const balanceAfter = await erc20.balanceOf(recipient.address);
    const defaultPoolBalanceAfter = await erc20.balanceOf(defaultPool);

    expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
    expect(defaultPoolBalanceAfter).to.be.equal(defaultPoolBalanceBefore - assetAmount);
  });

  it("should emit DefaultPoolAssetBalanceUpdated", async function () {
    const { defaultPool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;

    await defaultPool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await defaultPool
      .connect(this.impostor)
      .sendAssetToActivePool(erc20, assetAmount);
    await expect(sendAssetTx)
      .to.emit(defaultPool, "DefaultPoolAssetBalanceUpdated")
      .withArgs(erc20, 3n);
  });

  it("should emit AssetSent", async function () {
    const { defaultPool } = this.redeployedContracts;
    const { erc20 } = this.testContracts;
    await defaultPool.connect(this.impostor).receivedERC20(erc20, 5n);

    const assetAmount = 2n;
    const recipient = this.signers.accounts[2];

    const sendAssetTx = await defaultPool
      .connect(this.impostor)
      .sendAssetToActivePool(erc20, assetAmount);
    await expect(sendAssetTx)
      .to.emit(defaultPool, "AssetSent")
      .withArgs(recipient, erc20, assetAmount);
  });
}
