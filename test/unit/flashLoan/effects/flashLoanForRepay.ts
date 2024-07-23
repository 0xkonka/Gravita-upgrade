import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanFlashLoanForRepay(): void {
  context("when called by borrower", function () {
    beforeEach(async function () {
      this.user = this.signers.accounts[1];
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const debtToken = this.contracts.debtToken;

      const FlashLoanFactory = await ethers.getContractFactory("FlashLoan");
      const flashLoan = await FlashLoanFactory.connect(this.signers.deployer).deploy();
      await flashLoan.waitForDeployment();
      await flashLoan.initialize(this.signers.deployer);

      const MockBOFactory = await ethers.getContractFactory("MockBorrowerOperations");
      const mockBorrowerOperations = await MockBOFactory.connect(this.signers.deployer).deploy();
      await mockBorrowerOperations.waitForDeployment();

      this.redeployedContracts.flashLoan = flashLoan;

      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: mockBorrowerOperations,
      });

      await this.redeployedContracts.flashLoan.setAddresses(addressesForSetAddresses);
      await this.redeployedContracts.flashLoan.setInternalAddresses(
        mockBorrowerOperations,
        this.testContracts.mockRouter
      );

      await debtToken.addWhitelist(this.redeployedContracts.flashLoan);
      await debtToken.addWhitelist(this.signers.deployer.address);
      await debtToken.mintFromWhitelistedContract(100n);
      await debtToken.transfer(this.testContracts.mockRouter, 100n);

      await this.contracts.adminContract.setFeeForFlashLoan(100n);

      await this.utils.setupCollateralForTests({
        collateral: erc20,
        collateralOptions: {
          setAsActive: true,
          price: ethers.parseEther("2000"),
          mints: [
            {
              amount: 1000n,
              to: this.user.address,
            },
            {
              amount: 1000n,
              to: mockBorrowerOperations,
            },
          ],
        },
      });

      await this.utils.setupCollateralForTests({
        collateral: erc20_with_6_decimals,
        collateralOptions: {
          setAsActive: true,
          price: ethers.parseEther("1"),
          mints: [
            {
              amount: 10000n,
              to: this.user.address,
            },
            {
              amount: 10000n,
              to: mockBorrowerOperations,
            },
          ],
        },
      });
    });

    context("when collateral is erc20 with 18 decimals", function () {
      it("should execute flashLoanForRepay and emit FlashLoanExecuted", async function () {
        const { erc20 } = this.testContracts;

        const flashLoanTx = await this.redeployedContracts.flashLoan
          .connect(this.user)
          .flashLoanForRepay(erc20);

        await expect(flashLoanTx)
          .to.emit(this.redeployedContracts.flashLoan, "FlashLoanExecuted")
          .withArgs(this.user, 0n, 0n);

        await expect(flashLoanTx).to.changeTokenBalances(
          erc20,
          [this.user.address, this.testContracts.mockRouter, this.redeployedContracts.flashLoan],
          [1000n, 0, 0]
        );
        await expect(flashLoanTx).to.changeTokenBalances(
          this.contracts.debtToken,
          [this.user.address, this.signers.deployer.address, this.redeployedContracts.flashLoan],
          [0, 0, 0]
        );
      });
    });

    context("when collateral is erc20_with_6_decimals (stable coin)", function () {
      it("should execute flashLoanForRepay and emit FlashLoanExecuted", async function () {
        const { erc20_with_6_decimals } = this.testContracts;

        const flashLoanTx = await this.redeployedContracts.flashLoan
          .connect(this.user)
          .flashLoanForRepay(erc20_with_6_decimals);

        await expect(flashLoanTx)
          .to.emit(this.redeployedContracts.flashLoan, "FlashLoanExecuted")
          .withArgs(this.user, 0n, 0n);

        await expect(flashLoanTx).to.changeTokenBalances(
          erc20_with_6_decimals,
          [this.user.address, this.testContracts.mockRouter, this.redeployedContracts.flashLoan],
          [10000n, 0, 0]
        );
        await expect(flashLoanTx).to.changeTokenBalances(
          this.contracts.debtToken,
          [this.user.address, this.signers.deployer.address, this.redeployedContracts.flashLoan],
          [0, 0, 0]
        );
      });
    });
  });
}
