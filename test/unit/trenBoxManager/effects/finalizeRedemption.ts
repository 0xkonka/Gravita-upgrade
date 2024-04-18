import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanFinalizeRedemption(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize(this.signers.deployer);

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.signers.deployer).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.activePool = activePool;
    this.redeployedContracts.feeCollector = feeCollector;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[4];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.signers.deployer, 1000n);
    await erc20.transfer(this.redeployedContracts.activePool, 105n);
    await erc20.approve(this.trenBoxManagerOperationsImpostor, 105n);
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        activePool: this.redeployedContracts.activePool,
        feeCollector: this.redeployedContracts.feeCollector,
        borrowerOperations: this.borrowerOperationsImpostor,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        debtToken: this.contracts.debtToken,
      });

      const receiver = this.signers.accounts[2];

      await this.contracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.testContracts.erc20, receiver, 50n);
    });

    it("should finalize redemption if assetFeeAmount not zero", async function () {
      const { erc20 } = this.testContracts;
      const receiver = this.signers.accounts[2];
      const debtToIncrease = 75n;
      const debtToRedeem = 50n;
      const assetFeeAmount = 5n;
      const assetRedeemedAmount = 100n;

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(erc20, debtToIncrease);

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .receivedERC20(erc20, 105n);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .finalizeRedemption(erc20, receiver, debtToRedeem, assetFeeAmount, assetRedeemedAmount);

      const balanceAfter = await erc20.balanceOf(receiver);

      expect(balanceAfter).to.be.equal(assetRedeemedAmount - assetFeeAmount);
    });

    it("should finalize redemption if assetFeeAmount is zero", async function () {
      const { erc20 } = this.testContracts;
      const receiver = this.signers.accounts[2];
      const debtToIncrease = 75n;
      const debtToRedeem = 50n;
      const assetFeeAmount = 0n;
      const assetRedeemedAmount = 100n;

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(erc20, debtToIncrease);

      await this.redeployedContracts.activePool
        .connect(this.borrowerOperationsImpostor)
        .receivedERC20(erc20, 105n);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .finalizeRedemption(erc20, receiver, debtToRedeem, assetFeeAmount, assetRedeemedAmount);

      const balanceAfter = await erc20.balanceOf(receiver);

      expect(balanceAfter).to.be.equal(assetRedeemedAmount - assetFeeAmount);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const receiver = this.signers.accounts[3];
      const debtToRedeem = 50n;
      const assetFeeAmount = 5n;
      const assetRedeemedAmount = 100n;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(this.trenBoxManagerOperationsImpostor)
          .finalizeRedemption(
            wETH.address,
            receiver,
            debtToRedeem,
            assetFeeAmount,
            assetRedeemedAmount
          )
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyTrenBoxManagerOperations"
      );
    });
  });
}
