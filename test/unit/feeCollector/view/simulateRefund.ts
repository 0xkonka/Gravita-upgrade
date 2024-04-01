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
    await feeCollector.initialize();

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(this.owner);
    await debtToken.waitForDeployment();

    await debtToken.setAddresses(
      this.borrowerOperationsImpostor,
      this.signers.accounts[3],
      this.signers.accounts[4]
    );

    this.redeployedContracts.feeCollector = feeCollector;
    this.redeployedContracts.debtToken = debtToken;
    this.debtAsset = this.collaterals.active.wETH;

    await this.utils.connectRedeployedContracts({
      borrowerOperations: this.borrowerOperationsImpostor,
      trenBoxManager: this.trenBoxManagerImpostor,
      feeCollector: this.redeployedContracts.feeCollector,
      debtToken: this.redeployedContracts.debtToken,
    });

    // assume that feeAmount has already been minted
    await this.redeployedContracts.debtToken
      .connect(this.borrowerOperationsImpostor)
      .mint(this.debtAsset.address, await feeCollector.getAddress(), ethers.WeiPerEther);
  });

  it("should revert if payback fraction is zero", async function () {
    const paybackFraction = 0n;
    await expect(
      this.redeployedContracts.feeCollector.simulateRefund(
        this.borrower,
        this.debtAsset.address,
        paybackFraction
      )
    ).to.be.revertedWith("Payback fraction cannot be zero");
  });

  it("should revert if payback fraction is higher than 1 ether", async function () {
    const paybackFraction = ethers.parseEther("2");
    await expect(
      this.redeployedContracts.feeCollector.simulateRefund(
        this.borrower,
        this.debtAsset.address,
        paybackFraction
      )
    ).to.be.revertedWith("Payback fraction cannot be higher than 1 (@ 10**18)");
  });

  it("should return zero if no fee record", async function () {
    const paybackFraction = ethers.parseEther("0.5");
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction
    );
    expect(refundAmount).to.equal(0n);
  });

  it("should return zero if expired", async function () {
    // create fee record
    await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);

    // after 1 year
    await time.increase(time.duration.years(1));

    const paybackFraction = ethers.parseEther("0.5");
    const refundAmount = await this.redeployedContracts.feeCollector.simulateRefund(
      this.borrower,
      this.debtAsset.address,
      paybackFraction
    );
    expect(refundAmount).to.equal(0n);
  });

  it("should return full refund amount", async function () {
    // create fee record
    await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      this.borrower,
      this.debtAsset.address
    );
    // after 1 year
    await time.increase(time.duration.days(30));

    const expiredAmount = calcExpiredAmount(
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
    // create fee record
    await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.debtAsset.address, ethers.WeiPerEther);

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      this.borrower,
      this.debtAsset.address
    );
    // after 1 year
    await time.increase(time.duration.days(30));

    const expiredAmount = calcExpiredAmount(
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

function calcExpiredAmount(now: bigint, from: bigint, to: bigint, amount: bigint) {
  if (from > now) return BigInt(0);
  if (now >= to) return amount;
  const PRECISION = BigInt(1e9);
  const lifeTime = to - from;
  const elapsedTime = now - from;
  const decayRate = (amount * PRECISION) / lifeTime;
  return (elapsedTime * decayRate) / PRECISION;
}
