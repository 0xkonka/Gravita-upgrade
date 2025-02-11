import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanLiquidateDebt(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.borrower = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];
    this.trenBoxManagerImpostor = this.signers.accounts[5];

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(this.owner);
    await debtToken.waitForDeployment();

    this.redeployedContracts.feeCollector = feeCollector;
    this.redeployedContracts.debtToken = debtToken;
    this.debtAsset = this.collaterals.active.wETH;

    await this.utils.connectRedeployedContracts({
      borrowerOperations: this.borrowerOperationsImpostor,
      trenBoxManager: this.trenBoxManagerImpostor,
      feeCollector: this.redeployedContracts.feeCollector,
      debtToken: this.redeployedContracts.debtToken,
    });

    this.revenueDestination =
      await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const feeCollectorAddress = await this.redeployedContracts.feeCollector.getAddress();

      const mintFeeAmountTx = await this.redeployedContracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.debtAsset.address, feeCollectorAddress, ethers.WeiPerEther);

      await mintFeeAmountTx.wait();
    });

    it("should not collect any fee if no fee record", async function () {
      const { debtToken } = this.redeployedContracts;

      const liquidateDebtTx = await this.redeployedContracts.feeCollector
        .connect(this.trenBoxManagerImpostor)
        .liquidateDebt(this.borrower, this.debtAsset.address);

      await expect(liquidateDebtTx).to.changeTokenBalance(debtToken, this.revenueDestination, 0);
    });

    it("should collect all remaining fees", async function () {
      const { debtToken } = this.redeployedContracts;
      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);

      const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
        this.borrower,
        this.debtAsset.address
      );

      const liquidateDebtTx = await this.redeployedContracts.feeCollector
        .connect(this.trenBoxManagerImpostor)
        .liquidateDebt(this.borrower, this.debtAsset.address);

      await expect(liquidateDebtTx).to.changeTokenBalance(
        debtToken,
        this.revenueDestination,
        feeRecord.amount
      );
    });
  });

  context("when caller is not tren box manager", function () {
    it("should revert", async function () {
      await expect(
        this.redeployedContracts.feeCollector.liquidateDebt(this.borrower, this.debtAsset.address)
      )
        .to.be.revertedWithCustomError(
          this.redeployedContracts.feeCollector,
          "FeeCollector__TrenBoxManagerOnly"
        )
        .withArgs(this.owner, this.trenBoxManagerImpostor);
    });
  });
}
