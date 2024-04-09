import { expect } from "chai";

export default function shouldBehaveLikeCanFlashLoan(): void {
  context("when called by another contract", function () {
    beforeEach(async function () {
      this.users = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];
      const flashLoanTester = this.testContracts.flashLoanTester;
      const debtToken = this.contracts.debtToken;
      const flashLoanAddress = this.contracts.flashLoan.getAddress();

      await flashLoanTester.setFlashLoanAddress(flashLoanAddress);

      await debtToken.addWhitelist(flashLoanAddress);
      await debtToken.addWhitelist(this.signers.deployer.address);
      await debtToken.mintFromWhitelistedContract(500n);
      await debtToken.transfer(flashLoanTester.getAddress(), 500n);

      await this.contracts.adminContract.setFeeForFlashLoan(100n);
    });

    it("should execute flashLoan and emit FlashLoanExecuted", async function () {
      const flashLoanTester = this.testContracts.flashLoanTester;
      const debtToken = this.contracts.debtToken;
      const adminContract = this.contracts.adminContract;
      const amount = 5000n;
      const feeAmount = 500n;

      await adminContract.setMinDebtForFlashLoan(1000n);
      await adminContract.setMaxDebtForFlashLoan(10000n);

      const flashLoanTx = await flashLoanTester.connect(this.users[1]).executeFlashLoan(amount);

      await expect(flashLoanTx)
        .to.emit(this.contracts.flashLoan, "FlashLoanExecuted")
        .withArgs(this.testContracts.flashLoanTester.getAddress(), amount, feeAmount);

      await expect(flashLoanTx).to.changeTokenBalances(
        this.contracts.debtToken,
        [
          this.users[1].address,
          await this.contracts.flashLoan.getAddress(),
          this.signers.deployer.address,
          await flashLoanTester.getAddress(),
        ],
        [0, 0, 500n, -500n]
      );
    });

    it("should revert custom error when loan amount is beyond min", async function () {
      const flashLoanTester = this.testContracts.flashLoanTester;
      const adminContract = this.contracts.adminContract;
      const amount = 900n;

      await adminContract.setMinDebtForFlashLoan(1000n);
      await adminContract.setMaxDebtForFlashLoan(10000n);

      await expect(
        flashLoanTester.connect(this.users[1]).executeFlashLoan(amount)
      ).to.revertedWithCustomError(this.contracts.flashLoan, "FlashLoan__AmountBeyondMin");
    });

    it("should revert custom error when loan amount is beyond max", async function () {
      const flashLoanTester = this.testContracts.flashLoanTester;
      const adminContract = this.contracts.adminContract;
      const amount = 90000n;

      await adminContract.setMinDebtForFlashLoan(1000n);
      await adminContract.setMaxDebtForFlashLoan(10000n);

      await expect(
        flashLoanTester.connect(this.users[1]).executeFlashLoan(amount)
      ).to.revertedWithCustomError(this.contracts.flashLoan, "FlashLoan__AmountBeyondMax");
    });

    it("should revert custom error when user doesn't have enough amount to pay fee", async function () {
      const flashLoanTester = this.testContracts.flashLoanTester;
      const adminContract = this.contracts.adminContract;
      const amount = 8000n;

      await adminContract.setMinDebtForFlashLoan(1000n);
      await adminContract.setMaxDebtForFlashLoan(10000n);

      await expect(
        flashLoanTester.connect(this.users[1]).executeFlashLoan(amount)
      ).to.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
    });
  });

  context("when called by wallet directly", function () {
    it("should revert an error", async function () {
      const debtToken = this.contracts.debtToken;
      const flashLoan = this.contracts.flashLoan;
      const flashLoanAddress = flashLoan.getAddress();
      const adminContract = this.contracts.adminContract;
      const amount = 9000n;

      await debtToken.addWhitelist(flashLoanAddress);
      await debtToken.addWhitelist(this.signers.deployer.address);

      await adminContract.setFeeForFlashLoan(100n);
      await adminContract.setMinDebtForFlashLoan(1000n);
      await adminContract.setMaxDebtForFlashLoan(10000n);

      await expect(flashLoan.flashLoan(amount)).to.revertedWithoutReason();
    });
  });
}
