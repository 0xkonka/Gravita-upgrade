import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceivedERC20(): void {
  beforeEach(async function () {
    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const redeployedActivePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await redeployedActivePool.waitForDeployment();
    await redeployedActivePool.initialize();

    this.redeployedContracts.activePool = redeployedActivePool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context("when caller is default pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        defaultPool: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context("when caller is not borrower operations, or default pool", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.contracts.activePool.connect(this.impostor).receivedERC20(wETH.address, debtAmount)
      ).to.be.revertedWith("ActivePool: Caller is not an authorized Tren contract");
    });
  });
}

function shouldBehaveLikeCanReceivedERC20Correctly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;

    const assetBalanceBefore = await this.redeployedContracts.activePool.getAssetBalance(
      wETH.address
    );

    await this.redeployedContracts.activePool
      .connect(this.impostor)
      .receivedERC20(wETH.address, assetAmount);
    const assetBalanceAfter = await this.redeployedContracts.activePool.getAssetBalance(
      wETH.address
    );

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });

  it("should emit ActivePoolAssetBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 20n;

    const balanceBefore = await this.redeployedContracts.activePool
      .connect(this.impostor)
      .getAssetBalance(wETH.address);

    const decreaseDebtTx = await this.redeployedContracts.activePool
      .connect(this.impostor)
      .receivedERC20(wETH.address, assetAmount);

    await expect(decreaseDebtTx)
      .to.emit(this.redeployedContracts.activePool, "ActivePoolAssetBalanceUpdated")
      .withArgs(wETH.address, balanceBefore + assetAmount);
  });
}
