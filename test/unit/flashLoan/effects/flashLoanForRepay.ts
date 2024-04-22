import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanFlashLoanForRepay(): void {
  context("Without open trenBox", function () {
    beforeEach(async function () {
      this.user = this.signers.accounts[1];
      const { erc20 } = this.testContracts;
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
        await mockBorrowerOperations.getAddress(),
        await this.testContracts.mockRouter.getAddress()
      );

      await debtToken.addWhitelist(await this.redeployedContracts.flashLoan.getAddress());
      await debtToken.addWhitelist(this.signers.deployer.address);
      await debtToken.mintFromWhitelistedContract(100n);
      await debtToken.transfer(await this.testContracts.mockRouter.getAddress(), 100n);

      await this.contracts.adminContract.setFeeForFlashLoan(100n);

      await this.utils.setupCollateralForTests({
        collateral: erc20,
        collateralOptions: {
          setAsActive: true,
          price: 200000000000000000000n,
          mints: [
            {
              amount: 1000n,
              to: this.user.address,
            },
            {
              amount: 1000n,
              to: await mockBorrowerOperations.getAddress(),
            },
          ],
        },
      });
    });

    it("should execute flashLoanForRepay and emit FlashLoanExecuted", async function () {
      const { erc20 } = this.testContracts;

      const flashLoanTx = await this.redeployedContracts.flashLoan
        .connect(this.user)
        .flashLoanForRepay(erc20.getAddress());

      await expect(flashLoanTx)
        .to.emit(this.redeployedContracts.flashLoan, "FlashLoanExecuted")
        .withArgs(this.user, 0n, 0n);

      await expect(flashLoanTx).to.changeTokenBalances(
        erc20,
        [this.user.address, await this.testContracts.mockRouter.getAddress()],
        [1000n, 0]
      );
      await expect(flashLoanTx).to.changeTokenBalances(
        this.contracts.debtToken,
        [this.user.address, this.signers.deployer.address],
        [0, 0n]
      );
    });
  });
}
