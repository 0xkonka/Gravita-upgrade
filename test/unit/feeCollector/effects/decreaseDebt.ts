import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseDebt(): void {
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

    await debtToken.addWhitelist(await feeCollector.getAddress());

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

  context("when caller is borrower operations or tren box manager", function () {
    context("Should check validations", function () {
      it("should revert if payback fraction is zero", async function () {
        const paybackFraction = 0n;
        await expect(
          this.redeployedContracts.feeCollector
            .connect(this.borrowerOperationsImpostor)
            .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction)
        ).to.be.revertedWith("Payback fraction cannot be zero");
      });

      it("should revert if payback fraction is higher than 1 ether", async function () {
        const paybackFraction = ethers.parseEther("2");
        await expect(
          this.redeployedContracts.feeCollector
            .connect(this.borrowerOperationsImpostor)
            .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction)
        ).to.be.revertedWith("Payback fraction cannot be higher than 1 (@ 10**18)");
      });
    });

    context("Should decrease debt", function () {
      beforeEach(async function () {
        const feeCollectorAddress = await this.redeployedContracts.feeCollector.getAddress();
        // assume that enough feeAmount has already been minted
        await this.redeployedContracts.debtToken
          .connect(this.borrowerOperationsImpostor)
          .mint(this.debtAsset.address, feeCollectorAddress, ethers.parseEther("10"));
      });

      it("should be no change in debtToken balance if no fee record", async function () {
        const paybackFraction = ethers.WeiPerEther;

        const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(
          this.revenueDestination
        );

        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction);

        const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(
          this.revenueDestination
        );

        expect(debtBalanceAfter).to.equal(debtBalanceBefore);
      });

      it("should close fee record if expired", async function () {
        const feeAmount = ethers.WeiPerEther;
        // first create fee record
        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .increaseDebt(this.borrower, this.debtAsset.address, feeAmount);

        // after 1 year
        await time.increase(time.duration.years(1));

        const paybackFraction = ethers.parseEther("0.5");
        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction);

        const feeRecord = await this.redeployedContracts.feeCollector.feeRecords(
          this.borrower,
          this.debtAsset.address
        );

        expect(feeRecord.from).to.equal(0);
      });

      it("should be no refund on a full payback", async function () {
        const feeAmount = ethers.WeiPerEther;
        // first create fee record
        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .increaseDebt(this.borrower, this.debtAsset.address, feeAmount);

        // after 1 month
        await time.increase(time.duration.days(30));

        const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(this.borrower);

        const paybackFraction = ethers.WeiPerEther;
        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction);

        const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(this.borrower);
        expect(debtBalanceAfter).to.equal(debtBalanceBefore);
      });

      it("should refund amount proportional to the payment", async function () {
        const feeAmount = ethers.WeiPerEther;
        // first create fee record
        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .increaseDebt(this.borrower, this.debtAsset.address, feeAmount);

        const feeRecordBefore = await this.redeployedContracts.feeCollector.feeRecords(
          this.borrower,
          this.debtAsset.address
        );

        // after 1 month
        await time.increase(time.duration.days(30));

        const paybackFraction = ethers.parseEther("0.5");

        const expiredAmount = calcExpiredAmount(
          BigInt((await time.latest()) + 1),
          feeRecordBefore.from,
          feeRecordBefore.to,
          feeRecordBefore.amount
        );

        const refundAmount = (feeRecordBefore.amount - expiredAmount) / 2n;

        const debtBalanceBefore = await this.redeployedContracts.debtToken.balanceOf(this.borrower);

        await this.redeployedContracts.feeCollector
          .connect(this.borrowerOperationsImpostor)
          .decreaseDebt(this.borrower, this.debtAsset.address, paybackFraction);

        const debtBalanceAfter = await this.redeployedContracts.debtToken.balanceOf(this.borrower);
        expect(debtBalanceAfter).to.equal(debtBalanceBefore + refundAmount);
      });
    });
  });

  context("when caller is not borrower operations or tren box manager", function () {
    it("should revert", async function () {
      const { wETH } = this.collaterals.active;
      const feeAmount = ethers.parseEther("0.1");

      await expect(
        this.redeployedContracts.feeCollector.decreaseDebt(this.borrower, wETH.address, feeAmount)
      )
        .to.be.revertedWithCustomError(
          this.redeployedContracts.feeCollector,
          "FeeCollector__BorrowerOperationsOrTrenBoxManagerOnly"
        )
        .withArgs(this.owner, this.borrowerOperationsImpostor, this.trenBoxManagerImpostor);
    });
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