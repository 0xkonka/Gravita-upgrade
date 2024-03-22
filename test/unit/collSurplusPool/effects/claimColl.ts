import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanClaimColl(): void {
  beforeEach(async function () {
    const CollSurplusPoolFactory = await ethers.getContractFactory("CollSurplusPool");
    const collSurplusPool = await CollSurplusPoolFactory.connect(this.signers.deployer).deploy();
    await collSurplusPool.waitForDeployment();
    await collSurplusPool.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.collSurplusPool = collSurplusPool;
    this.redeployedContracts.activePool = activePool;
    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.redeployedContracts.collSurplusPool, 1000n);
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses1 = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
        activePool: this.impostor,
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.collSurplusPool.setAddresses(addressesForSetAddresses1);
    });

    it("reverts custom error", async function () {
      const { erc20 } = this.testContracts;
      const user = this.signers.accounts[1];

      await expect(
        this.redeployedContracts.collSurplusPool.connect(this.impostor).claimColl(erc20, user)
      ).to.be.revertedWith("CollSurplusPool: No collateral available to claim");
    });

    it("should claim Collateral", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = BigInt(10);
      const user = this.signers.accounts[1];

      const userAssetBalanceBefore = await this.redeployedContracts.collSurplusPool.getCollateral(
        erc20,
        user.address
      );

      const accountSurplusTx = await this.redeployedContracts.collSurplusPool
        .connect(this.impostor)
        .accountSurplus(erc20, user.address, assetAmount);

      await expect(accountSurplusTx)
        .to.emit(this.redeployedContracts.collSurplusPool, "CollBalanceUpdated")
        .withArgs(user, assetAmount);

      const userAssetBalanceAfter = await this.redeployedContracts.collSurplusPool.getCollateral(
        erc20,
        user.address
      );

      expect(assetAmount).to.be.equal(userAssetBalanceAfter - userAssetBalanceBefore);

      const assetBalanceBefore =
        await this.redeployedContracts.collSurplusPool.getAssetBalance(erc20);

      await this.redeployedContracts.collSurplusPool
        .connect(this.impostor)
        .receivedERC20(erc20, assetAmount);

      const assetBalanceAfter =
        await this.redeployedContracts.collSurplusPool.getAssetBalance(erc20);

      expect(assetAmount).to.be.equal(assetBalanceAfter - assetBalanceBefore);

      const claimCollTx = await this.redeployedContracts.collSurplusPool
        .connect(this.impostor)
        .claimColl(erc20, user.address);

      await expect(claimCollTx)
        .to.emit(this.redeployedContracts.collSurplusPool, "CollBalanceUpdated")
        .withArgs(user, 0);
    });
  });

  context("when caller is not borrower operations", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { erc20 } = this.testContracts;

      const user = this.signers.accounts[1];

      await expect(
        this.contracts.collSurplusPool.connect(this.impostor).claimColl(erc20, user)
      ).to.be.revertedWith("CollSurplusPool: Caller is not Borrower Operations");
    });
  });
}