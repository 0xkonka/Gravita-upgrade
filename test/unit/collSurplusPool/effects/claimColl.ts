import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanClaimColl(): void {
  beforeEach(async function () {
    const CollSurplusPoolFactory = await ethers.getContractFactory("CollSurplusPool");
    const redeployedCollSurplusPool = await CollSurplusPoolFactory.connect(this.signers.deployer).deploy();
    await redeployedCollSurplusPool.waitForDeployment();
    await redeployedCollSurplusPool.initialize();

    this.redeployedContracts.collSurplusPool = redeployedCollSurplusPool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is active pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.collSurplusPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanClaimCollCorrectly();
  });


  context("when caller is not active pool", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;

      const user = this.signers.accounts[1]

      await expect(
        this.contracts.collSurplusPool.connect(this.impostor).claimColl(wETH.address, user)
      ).to.be.revertedWith("CollSurplusPool: Caller is not Borrower Operations");
    });
  });
}

function shouldBehaveLikeCanClaimCollCorrectly() {

  it("reverts custom error", async function () {
    const { wETH } = this.collaterals.active;
    const user = this.signers.accounts[1]

    await expect(this.redeployedContracts.collSurplusPool.connect(this.impostor).claimColl(wETH.address, user)).to.be.revertedWith("CollSurplusPool: No collateral available to claim")

  });

  // it("receives asset token and increase balance", async function () {
  //   const { wETH } = this.collaterals.active;
  //   const assetAmount = 0n;
  //   const user = this.signers.accounts[1]

  //   const assetBalanceBefore = await this.redeployedContracts.collSurplusPool.getCollateral(
  //     wETH.address, user
  //   );

  //   await this.redeployedContracts.collSurplusPool
  //     .connect(this.impostor)
  //     .claimColl(wETH.address, user);
  //   const assetBalanceAfter = await this.redeployedContracts.collSurplusPool.getCollateral(
  //     wETH.address, user
  //   );

  //   expect(assetBalanceAfter).to.be.equal(assetBalanceBefore - assetAmount);
  // });

  // it("should emit CollBalanceUpdated", async function () {
  //   const { wETH } = this.collaterals.active;
  //   const assetAmount = 50n;
  //   const user = this.signers.accounts[1]

  //   const claimCollTx = await this.redeployedContracts.collSurplusPool
  //     .connect(this.impostor)
  //     .claimColl(wETH.address, user);

  //   await expect(claimCollTx)
  //     .to.emit(this.redeployedContracts.collSurplusPool, "CollBalanceUpdated")
  //     .withArgs(user, assetAmount);
  // });

}
