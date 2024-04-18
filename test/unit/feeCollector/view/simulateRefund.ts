import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveSimulateRefund(): void {
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

    const feeCollectorAddress = await feeCollector.getAddress();

    const mintFeeAmountTx = await this.redeployedContracts.debtToken
      .connect(this.borrowerOperationsImpostor)
      .mint(this.debtAsset.address, feeCollectorAddress, ethers.WeiPerEther);
    await mintFeeAmountTx.wait();
  });

  it("should revert if payback fraction is zero", async function () {
    const paybackFraction_100percent = 0n;

    await expect(
      this.redeployedContracts.feeCollector.simulateRefund(
        this.borrower,
        this.debtAsset.address,
        paybackFraction_100percent
      )
    ).to.be.revertedWith("Payback fraction cannot be zero");
  });

  it("should revert if payback fraction is higher than 1 ether", async function () {
    const paybackFraction_200percent = ethers.parseEther("2");

    await expect(
      this.redeployedContracts.feeCollector.simulateRefund(
        this.borrower,
        this.debtAsset.address,
        paybackFraction_200percent
      )
    ).to.be.revertedWith("Payback fraction cannot be higher than 1 (@ 10**18)");
  });

  it("should return zero if no fee record", async function () {
    const paybackFraction_0percent = ethers.parseEther("0.5");
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction_0percent
    );
    expect(refundAmount).to.equal(0n);
  });

  it("should return zero if expired", async function () {
    const createFeeRecordTx = await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);
    await createFeeRecordTx.wait();

    const oneYear = time.duration.years(1);
    await time.increase(oneYear);

    const paybackFraction_50percent = ethers.parseEther("0.5");
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction_50percent
    );
    expect(refundAmount).to.equal(0n);
  });

  it("should return full refund amount", async function () {
    const createFeeRecordTx = await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);
    await createFeeRecordTx.wait();

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      this.borrower,
      this.debtAsset.address
    );

    const oneMonth = time.duration.days(30);
    await time.increase(oneMonth);

    const expiredAmount = calculateExpiredAmount(
      BigInt(await time.latest()),
      feeRecord.from,
      feeRecord.to,
      feeRecord.amount
    );

    const paybackFraction = ethers.WeiPerEther;
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction
    );
    expect(refundAmount).to.equal(feeRecord.amount - expiredAmount);
  });

  it("should return proportional refund amount", async function () {
    const createFeeRecordTx = await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);
    await createFeeRecordTx.wait();

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      this.borrower,
      this.debtAsset.address
    );

    const oneMonth = time.duration.days(30);
    await time.increase(oneMonth);

    const expiredAmount = calculateExpiredAmount(
      BigInt(await time.latest()),
      feeRecord.from,
      feeRecord.to,
      feeRecord.amount
    );

    const paybackFraction = ethers.parseEther("0.5");
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction
    );
    expect(refundAmount).to.equal((feeRecord.amount - expiredAmount) / 2n);
  });
}

function calculateExpiredAmount(now: bigint, from: bigint, to: bigint, amount: bigint): bigint {
  if (from > now) {
    return BigInt(0);
  }
  if (now >= to) {
    return amount;
  }
  const PRECISION = BigInt(1e9);
  const lifeTime = to - from;
  const elapsedTime = now - from;
  const decayRate = (amount * PRECISION) / lifeTime;

  return (elapsedTime * decayRate) / PRECISION;
}
