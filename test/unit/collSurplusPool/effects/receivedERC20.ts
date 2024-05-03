import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceivedERC20(): void {
  beforeEach(async function () {
    const CollSurplusPoolFactory = await ethers.getContractFactory("CollSurplusPool");
    const redeployedCollSurplusPool = await CollSurplusPoolFactory.connect(
      this.signers.deployer
    ).deploy();
    await redeployedCollSurplusPool.waitForDeployment();
    await redeployedCollSurplusPool.initialize(this.signers.deployer);

    this.redeployedContracts.collSurplusPool = redeployedCollSurplusPool;

    this.trenBoxStorageImpostor = this.signers.accounts[1];
  });

  context("when caller is TrenBoxStorage", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxStorage: this.trenBoxStorageImpostor,
      });

      await this.redeployedContracts.collSurplusPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context("when caller is not TrenBoxStorage", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.contracts.collSurplusPool.connect(impostor).receivedERC20(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.contracts.collSurplusPool,
        "CollSurplusPool__NotTrenBoxStorage"
      );
    });
  });
}

function shouldBehaveLikeCanReceivedERC20Correctly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;

    const assetBalanceBefore = await this.redeployedContracts.collSurplusPool.getAssetBalance(
      wETH.address
    );

    await this.redeployedContracts.collSurplusPool
      .connect(this.trenBoxStorageImpostor)
      .receivedERC20(wETH.address, assetAmount);
    const assetBalanceAfter = await this.redeployedContracts.collSurplusPool.getAssetBalance(
      wETH.address
    );

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });
}
