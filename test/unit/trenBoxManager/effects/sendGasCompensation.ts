import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendGasCompensation(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.activePool = activePool;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.redeployedContracts.activePool, 1000n);
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        activePool: this.redeployedContracts.activePool,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        borrowerOperations: this.borrowerOperationsImpostor,
        debtToken: this.contracts.debtToken,
      });

      const gasPool = this.contracts.gasPool.getAddress();
      await this.contracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.testContracts.erc20, gasPool, 50n);
    });

    it("executes sendGasCompensation if we have all values", async function () {
      const { erc20 } = this.testContracts;
      const liquidator = this.signers.accounts[4];
      const debtTokenAmount = 50n;
      const assetAmount = 20n;

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .receivedERC20(erc20, assetAmount);

      const gasPoolBalanceBefore = await this.contracts.debtToken.balanceOf(
        this.contracts.gasPool.getAddress()
      );
      const liquidatorBalanceBefore = await this.contracts.debtToken.balanceOf(liquidator);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .sendGasCompensation(erc20, liquidator, debtTokenAmount, assetAmount);

      const gasPoolBalanceAfter = await this.contracts.debtToken.balanceOf(
        this.contracts.gasPool.getAddress()
      );
      const liquidatorBalanceAfter = await this.contracts.debtToken.balanceOf(liquidator);
      const liquidatorAssetBalanceAfter = await erc20.balanceOf(liquidator);

      expect(gasPoolBalanceAfter).to.be.equal(gasPoolBalanceBefore - debtTokenAmount);
      expect(liquidatorBalanceAfter).to.be.equal(liquidatorBalanceBefore + debtTokenAmount);
      expect(liquidatorAssetBalanceAfter).to.equal(assetAmount);
    });

    it("executes sendGasCompensation if we have no values", async function () {
      const { erc20 } = this.testContracts;
      const liquidator = this.signers.accounts[4];

      const gasPoolBalanceBefore = await this.contracts.debtToken.balanceOf(
        this.contracts.gasPool.getAddress()
      );
      const liquidatorBalanceBefore = await this.contracts.debtToken.balanceOf(liquidator);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .sendGasCompensation(erc20, liquidator, 0, 0);

      const gasPoolBalanceAfter = await this.contracts.debtToken.balanceOf(
        this.contracts.gasPool.getAddress()
      );
      const liquidatorBalanceAfter = await this.contracts.debtToken.balanceOf(liquidator);
      const liquidatorAssetBalanceAfter = await erc20.balanceOf(liquidator);

      expect(gasPoolBalanceAfter).to.be.equal(gasPoolBalanceBefore);
      expect(liquidatorBalanceAfter).to.be.equal(liquidatorBalanceBefore);
      expect(liquidatorAssetBalanceAfter).to.equal(0);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .sendGasCompensation(wETH.address, borrower, 12n, 35n)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
