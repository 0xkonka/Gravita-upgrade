import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSendGasCompensation(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(this.signers.deployer);
    await debtToken.waitForDeployment();

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.trenBoxStorage = trenBoxStorage;
    this.redeployedContracts.debtToken = debtToken;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];

    const { erc20 } = this.testContracts;
    await erc20.mint(this.redeployedContracts.trenBoxStorage, 1000n);
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        borrowerOperations: this.borrowerOperationsImpostor,
        debtToken: this.redeployedContracts.debtToken,
      });

      const trenBoxStorageAddress = this.redeployedContracts.trenBoxStorage.getAddress();
      await this.redeployedContracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.testContracts.erc20, trenBoxStorageAddress, 50n);
    });

    it("executes sendGasCompensation if we have all values", async function () {
      const { erc20 } = this.testContracts;
      const liquidator = this.signers.accounts[4];
      const debtTokenAmount = 50n;
      const assetAmount = 20n;

      await this.redeployedContracts.trenBoxStorage
        .connect(this.borrowerOperationsImpostor)
        .increaseActiveCollateral(erc20, assetAmount);

      const trenBoxStorageBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
        this.redeployedContracts.trenBoxStorage.getAddress()
      );
      const liquidatorBalanceBefore =
        await this.redeployedContracts.debtToken.balanceOf(liquidator);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .sendGasCompensation(erc20, liquidator, debtTokenAmount, assetAmount);

      const trenBoxStorageBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
        this.redeployedContracts.trenBoxStorage.getAddress()
      );
      const liquidatorBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(liquidator);
      const liquidatorAssetBalanceAfter = await erc20.balanceOf(liquidator);

      expect(trenBoxStorageBalanceAfter).to.be.equal(trenBoxStorageBalanceBefore - debtTokenAmount);
      expect(liquidatorBalanceAfter).to.be.equal(liquidatorBalanceBefore + debtTokenAmount);
      expect(liquidatorAssetBalanceAfter).to.equal(assetAmount);
    });

    it("executes sendGasCompensation if we have no values", async function () {
      const { erc20 } = this.testContracts;
      const liquidator = this.signers.accounts[4];

      const trenBoxStorageBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
        this.redeployedContracts.trenBoxStorage.getAddress()
      );
      const liquidatorBalanceBefore =
        await this.redeployedContracts.debtToken.balanceOf(liquidator);

      await this.redeployedContracts.trenBoxManager
        .connect(this.trenBoxManagerOperationsImpostor)
        .sendGasCompensation(erc20, liquidator, 0, 0);

      const trenBoxStorageBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
        this.redeployedContracts.trenBoxStorage.getAddress()
      );
      const liquidatorBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(liquidator);
      const liquidatorAssetBalanceAfter = await erc20.balanceOf(liquidator);

      expect(trenBoxStorageBalanceAfter).to.be.equal(trenBoxStorageBalanceBefore);
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
