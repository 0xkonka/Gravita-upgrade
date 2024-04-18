import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanAccountSurplus(): void {
  beforeEach(async function () {
    const CollSurplusPoolFactory = await ethers.getContractFactory("CollSurplusPool");
    const redeployedCollSurplusPool = await CollSurplusPoolFactory.connect(
      this.signers.deployer
    ).deploy();
    await redeployedCollSurplusPool.waitForDeployment();
    await redeployedCollSurplusPool.initialize(this.signers.deployer);

    this.redeployedContracts.collSurplusPool = redeployedCollSurplusPool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.collSurplusPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanAccountSurplusCorrectly();
  });

  context("when caller is not trenBoxManager", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const amount = 50n;

      const user = this.signers.accounts[1];

      await expect(
        this.contracts.collSurplusPool
          .connect(this.impostor)
          .accountSurplus(wETH.address, user, amount)
      ).to.be.revertedWithCustomError(
        this.contracts.collSurplusPool,
        "CollSurplusPool__NotTrenBoxManager"
      );
    });
  });
}

function shouldBehaveLikeCanAccountSurplusCorrectly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;
    const user = this.signers.accounts[1];

    const assetBalanceBefore = await this.redeployedContracts.collSurplusPool.getCollateral(
      wETH.address,
      user
    );

    await this.redeployedContracts.collSurplusPool
      .connect(this.impostor)
      .accountSurplus(wETH.address, user, assetAmount);
    const assetBalanceAfter = await this.redeployedContracts.collSurplusPool.getCollateral(
      wETH.address,
      user
    );

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });

  it("should emit CollBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;
    const user = this.signers.accounts[1];

    const userAssetBalanceBefore = await this.redeployedContracts.collSurplusPool.getCollateral(
      wETH.address,
      user.address
    );

    const accountSurplusTx = await this.redeployedContracts.collSurplusPool
      .connect(this.impostor)
      .accountSurplus(wETH.address, user, assetAmount);

    const userAssetBalanceAfter = await this.redeployedContracts.collSurplusPool.getCollateral(
      wETH.address,
      user.address
    );

    expect(assetAmount).to.be.equal(userAssetBalanceAfter - userAssetBalanceBefore);

    await expect(accountSurplusTx)
      .to.emit(this.redeployedContracts.collSurplusPool, "CollBalanceUpdated")
      .withArgs(user, assetAmount);
  });
}
