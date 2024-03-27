import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceivedERC20(): void {
  beforeEach(async function () {
    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const redeployedDefaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await redeployedDefaultPool.waitForDeployment();
    await redeployedDefaultPool.initialize();

    this.redeployedContracts.defaultPool = redeployedDefaultPool;

    this.activePoolImpostor = this.signers.accounts[1];
  });

  context("when caller is Active Pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        activePool: this.activePoolImpostor,
      });

      this.impostor = this.activePoolImpostor;

      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context("when caller is not Active pool", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[2];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.contracts.defaultPool.connect(impostor).receivedERC20(wETH.address, debtAmount)
      ).to.be.revertedWith("DefaultPool: Caller is not the ActivePool");
    });
  });
}

function shouldBehaveLikeCanReceivedERC20Correctly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;

    const assetBalanceBefore = await this.redeployedContracts.defaultPool.getAssetBalance(
      wETH.address
    );

    await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .receivedERC20(wETH.address, assetAmount);
    const assetBalanceAfter = await this.redeployedContracts.defaultPool.getAssetBalance(
      wETH.address
    );

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });

  it("should emit DefaultPoolAssetBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 20n;

    const balanceBefore = await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .getAssetBalance(wETH.address);

    const decreaseDebtTx = await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .receivedERC20(wETH.address, assetAmount);

    await expect(decreaseDebtTx)
      .to.emit(this.redeployedContracts.defaultPool, "DefaultPoolAssetBalanceUpdated")
      .withArgs(wETH.address, balanceBefore + assetAmount);
  });
}
