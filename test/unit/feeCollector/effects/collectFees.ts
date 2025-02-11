import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanCollectFees(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.borrower = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
    const debtToken = await DebtTokenFactory.deploy(this.owner);
    await debtToken.waitForDeployment();

    this.redeployedContracts.feeCollector = feeCollector;
    this.redeployedContracts.debtToken = debtToken;

    await this.utils.connectRedeployedContracts({
      borrowerOperations: this.borrowerOperationsImpostor,
      feeCollector: this.redeployedContracts.feeCollector,
      debtToken: this.redeployedContracts.debtToken,
    });

    this.revenueDestination =
      await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();

    this.asset = this.collaterals.active.wETH;

    const mintFeeAmountTx = await this.redeployedContracts.debtToken
      .connect(this.borrowerOperationsImpostor)
      .mint(this.asset.address, await feeCollector.getAddress(), ethers.WeiPerEther);
    await mintFeeAmountTx.wait();

    const createFeeRecordTx = await this.redeployedContracts.feeCollector
      .connect(this.borrowerOperationsImpostor)
      .increaseDebt(this.borrower, this.asset.address, ethers.WeiPerEther);
    await createFeeRecordTx.wait();
  });

  it("should revert if borrowers length is 0", async function () {
    const borrowers: string[] = [];
    const assets: string[] = [];

    await expect(
      this.redeployedContracts.feeCollector.collectFees(borrowers, assets)
    ).to.be.revertedWithCustomError(
      this.redeployedContracts.feeCollector,
      "FeeCollector__ArrayMismatch"
    );
  });

  it("should revert if array is mismatched", async function () {
    const borrowers = [this.borrower];
    const assets: string[] = [];

    await expect(
      this.redeployedContracts.feeCollector.collectFees(borrowers, assets)
    ).to.be.revertedWithCustomError(
      this.redeployedContracts.feeCollector,
      "FeeCollector__ArrayMismatch"
    );
  });

  it("should not collect any fee if not past MIN_FEE_DAYS", async function () {
    const { debtToken } = this.redeployedContracts;
    const borrowers = [this.borrower];
    const assets = [this.asset.address];

    const collectFeesTx = await this.redeployedContracts.feeCollector.collectFees(
      borrowers,
      assets
    );

    await expect(collectFeesTx).to.changeTokenBalance(debtToken, this.revenueDestination, 0);
  });

  it("should collect full record amount if expired", async function () {
    const { debtToken } = this.redeployedContracts;
    const borrowers = [this.borrower];
    const assets = [this.asset.address];

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      borrowers[0],
      assets[0]
    );

    const oneYear = time.duration.years(1);
    await time.increase(oneYear);

    const collectFeesTx = await this.redeployedContracts.feeCollector.collectFees(
      borrowers,
      assets
    );

    await expect(collectFeesTx).to.changeTokenBalance(
      debtToken,
      this.revenueDestination,
      feeRecord.amount
    );
  });

  it("should collect pro rata fee if past MIN_FEE_DAYS", async function () {
    const borrowers = [this.borrower];
    const assets = [this.asset.address];

    const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
      borrowers[0],
      assets[0]
    );

    const twoWeeks = 14 * 24 * 3600;
    await time.increase(twoWeeks);

    const now = BigInt((await time.latest()) + 1);
    const expiredAmount = calcExpiredAmount(now, feeRecord.from, feeRecord.to, feeRecord.amount);

    const collectFeesTx = await this.redeployedContracts.feeCollector.collectFees(
      borrowers,
      assets
    );

    await expect(collectFeesTx).to.changeTokenBalance(
      this.redeployedContracts.debtToken,
      this.revenueDestination,
      expiredAmount
    );
  });
}

function calcExpiredAmount(now: bigint, from: bigint, to: bigint, amount: bigint): bigint {
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
