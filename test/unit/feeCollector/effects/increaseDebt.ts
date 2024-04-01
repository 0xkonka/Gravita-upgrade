import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseDebt(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.borrower = this.signers.accounts[1];
    this.borrowerOperationsImpostor = this.signers.accounts[2];

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize();

    this.feeCollectorAddress = await feeCollector.getAddress();

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
      feeCollector: this.redeployedContracts.feeCollector,
      debtToken: this.redeployedContracts.debtToken,
    });

    this.revenueDestination =
      await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      // assume that enough feeAmount has already been minted
      await this.redeployedContracts.debtToken
        .connect(this.borrowerOperationsImpostor)
        .mint(this.debtAsset.address, this.feeCollectorAddress, ethers.parseEther("10"));
    });

    it("should create fee record", async function () {
      const feeAmountInEther = ethers.WeiPerEther;
      const feeAmount = 1;
      const feeToCollect = await calcFeeToCollect(feeAmount, 0, 0, 0);

      const feeToCollectInEther = ethers.parseEther(feeToCollect.toString());

      const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );
      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, feeAmountInEther);

      const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );

      expect(debtBalanceAfter).to.equal(debtBalanceBefore + feeToCollectInEther);
    });

    it("should update fee record", async function () {
      const feeAmountInEther = ethers.WeiPerEther;
      const feeAmount = 1;
      // create first fee record
      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, feeAmountInEther);

      const feeRecordBefore = await this.redeployedContracts.feeCollector.feeRecords(
        this.borrower,
        this.debtAsset.address
      );
      const recordAmount = Number(ethers.formatEther(feeRecordBefore.amount));
      const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );

      await time.increase(30 * 24 * 3600); // 1 month later

      const feeToCollect = await calcFeeToCollect(
        feeAmount,
        recordAmount,
        Number(feeRecordBefore.from),
        Number(feeRecordBefore.to)
      );
      const feeToCollectInEther = ethers.parseEther(feeToCollect.toString());

      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, feeAmountInEther);

      const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );
      expect(debtBalanceAfter).to.closeTo(debtBalanceBefore + feeToCollectInEther, 1e12);
    });

    it("should create fee record after expiration", async function () {
      const feeAmountInEther = ethers.WeiPerEther;
      const feeAmount = 1;

      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, feeAmountInEther);

      const feeRecordBefore = await this.redeployedContracts.feeCollector.feeRecords(
        this.borrower,
        this.debtAsset.address
      );
      const recordAmount = Number(ethers.formatEther(feeRecordBefore.amount));

      await time.increase(time.duration.years(1)); // after 1 year

      const feeToCollect = await calcFeeToCollect(
        feeAmount,
        recordAmount,
        Number(feeRecordBefore.from),
        Number(feeRecordBefore.to)
      );
      const feeToCollectInEther = ethers.parseEther(feeToCollect.toString());

      const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );

      await this.redeployedContracts.feeCollector
        .connect(this.borrowerOperationsImpostor)
        .increaseDebt(this.borrower, this.debtAsset.address, feeAmountInEther);

      const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
        this.revenueDestination
      );

      expect(debtBalanceAfter).to.equal(debtBalanceBefore + feeToCollectInEther);
    });
  });

  context("when caller is not borrower operations", function () {
    it("should revert", async function () {
      const { wETH } = this.collaterals.active;
      const feeAmountInEther = ethers.parseEther("0.1");

      await expect(
        this.redeployedContracts.feeCollector.increaseDebt(
          this.borrower,
          wETH.address,
          feeAmountInEther
        )
      )
        .to.be.revertedWithCustomError(
          this.redeployedContracts.feeCollector,
          "FeeCollector__BorrowerOperationsOnly"
        )
        .withArgs(this.owner, this.borrowerOperationsImpostor);
    });
  });
}

async function calcFeeToCollect(feeAmount: number, recordAmount: number, from: number, to: number) {
  const MIN_FEE_FRACTION = 0.038461538;
  const minFeeAmount = MIN_FEE_FRACTION * feeAmount;
  const now = await time.latest();
  if (recordAmount == 0) return minFeeAmount;
  else if (to <= now) {
    return minFeeAmount + recordAmount;
  } else {
    const expiredAmount = calcExpiredAmount(now, from, to, recordAmount);
    return minFeeAmount + expiredAmount;
  }
}

function calcExpiredAmount(now: number, from: number, to: number, amount: number) {
  if (from > now) return 0;
  if (now >= to) return amount;
  const PRECISION = 10 ** 9;
  const lifeTime = to - from;
  const elapsedTime = now - from;
  const decayRate = (amount * PRECISION) / lifeTime;
  return (elapsedTime * decayRate) / PRECISION;
}
