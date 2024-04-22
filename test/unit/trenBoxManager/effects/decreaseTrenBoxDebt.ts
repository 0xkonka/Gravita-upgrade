import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseTrenBoxDebt(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize(this.signers.deployer);

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.signers.deployer).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxManager = trenBoxManager;
    this.redeployedContracts.feeCollector = feeCollector;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is borrowerOperations", function () {
    beforeEach(async function () {
      await this.utils.connectRedeployedContracts({
        borrowerOperations: this.borrowerOperationsImpostor,
        feeCollector: this.redeployedContracts.feeCollector,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
      });
    });

    it("executes decreaseTrenBoxDebt and then return correct value", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const amountToIncrease = 15n;
      const amountToDecrease = 7n;

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .increaseTrenBoxDebt(wETH.address, borrower, amountToIncrease);

      const amountBefore = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
        wETH.address,
        borrower
      );

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .decreaseTrenBoxDebt(wETH.address, borrower, amountToDecrease);

      const amountAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
        wETH.address,
        borrower
      );

      expect(amountAfter).to.be.equal(amountBefore - amountToDecrease);
    });

    it("executes decreaseTrenBoxDebt and then return old debt because amountToDecrease equals zero", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const amountToIncrease = 15n;
      const amountToDecrease = 0;

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .increaseTrenBoxDebt(wETH.address, borrower, amountToIncrease);

      await this.redeployedContracts.trenBoxManager
        .connect(this.borrowerOperationsImpostor)
        .decreaseTrenBoxDebt(wETH.address, borrower, amountToDecrease);

      const amountAfter = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
        wETH.address,
        borrower
      );

      expect(amountAfter).to.be.equal(amountToIncrease);
    });
  });

  context("when caller is not borrowerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[4];
      const amountToIncrease = 2n;

      await expect(
        this.redeployedContracts.trenBoxManager
          .connect(impostor)
          .decreaseTrenBoxDebt(wETH.address, borrower, amountToIncrease)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManager,
        "TrenBoxManager__OnlyBorrowerOperations"
      );
    });
  });
}
