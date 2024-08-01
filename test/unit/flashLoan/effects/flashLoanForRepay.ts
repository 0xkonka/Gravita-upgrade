import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanFlashLoanForRepay(): void {
  context("when called by borrower", function () {
    beforeEach(async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const users = [this.signers.accounts[1], this.signers.accounts[2]];
      const owner = this.signers.deployer;
      const assetAmount = ethers.parseUnits("4000", 18);

      const FlashLoanFactory = await ethers.getContractFactory("FlashLoan");
      const flashLoan = await FlashLoanFactory.connect(owner).deploy();
      await flashLoan.waitForDeployment();
      await flashLoan.initialize(owner);

      const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
      const trenBoxManager = await TrenBoxManagerFactory.connect(owner).deploy();
      await trenBoxManager.waitForDeployment();
      await trenBoxManager.initialize(owner);

      const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
      const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(owner).deploy();
      await sortedTrenBoxes.waitForDeployment();
      await sortedTrenBoxes.initialize(owner);

      const BorrowerOperationsFactory = await ethers.getContractFactory("BorrowerOperations");
      const borrowerOperations = await BorrowerOperationsFactory.connect(owner).deploy();
      await borrowerOperations.waitForDeployment();
      await borrowerOperations.initialize(owner);

      const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
      const feeCollector = await FeeCollectorFactory.connect(owner).deploy();
      await feeCollector.waitForDeployment();
      await feeCollector.initialize(owner);

      const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
      const trenBoxStorage = await TrenBoxStorageFactory.connect(owner).deploy();
      await trenBoxStorage.waitForDeployment();
      await trenBoxStorage.initialize(owner);

      const DebtTokenFactory = await ethers.getContractFactory("DebtToken");
      const debtToken = await DebtTokenFactory.deploy(owner);
      await debtToken.waitForDeployment();

      await debtToken.addWhitelist(feeCollector);

      this.redeployedContracts.flashLoan = flashLoan;
      this.redeployedContracts.trenBoxManager = trenBoxManager;
      this.redeployedContracts.borrowerOperations = borrowerOperations;
      this.redeployedContracts.debtToken = debtToken;
      this.redeployedContracts.feeCollector = feeCollector;
      this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;
      this.redeployedContracts.trenBoxStorage = trenBoxStorage;

      await this.utils.connectRedeployedContracts({
        flashLoan: this.redeployedContracts.flashLoan,
        borrowerOperations: this.redeployedContracts.borrowerOperations,
        debtToken: this.redeployedContracts.debtToken,
        feeCollector: this.redeployedContracts.feeCollector,
        trenBoxManager: this.redeployedContracts.trenBoxManager,
        sortedTrenBoxes: this.redeployedContracts.sortedTrenBoxes,
        trenBoxStorage: this.redeployedContracts.trenBoxStorage,
      });

      await this.redeployedContracts.flashLoan.setInternalAddresses(
        this.redeployedContracts.borrowerOperations,
        this.testContracts.mockRouter
      );

      await debtToken.addWhitelist(this.redeployedContracts.flashLoan);
      await debtToken.addWhitelist(owner.address);

      const amount = ethers.parseEther("10000");
      await debtToken.mintFromWhitelistedContract(amount);
      await debtToken.transfer(this.testContracts.mockRouter, amount);

      await this.contracts.adminContract.setFeeForFlashLoan(100n);

      await this.utils.setupProtocolForTests({
        overrides: {
          borrowerOperations: this.redeployedContracts.borrowerOperations,
        },
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseEther("2000"),
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseEther("10000"),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: erc20,
              assetAmount,
              from: user,
            },
          };
        }),
      });

      await this.utils.setupProtocolForTests({
        overrides: {
          borrowerOperations: this.redeployedContracts.borrowerOperations,
        },
        collaterals: [
          {
            collateral: erc20_with_6_decimals,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseEther("1"),
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("10000", 6),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: erc20_with_6_decimals,
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    context("when collateral is erc20 with 18 decimals", function () {
      it("should execute flashLoanForRepay and emit FlashLoanExecuted", async function () {
        const { erc20 } = this.testContracts;
        const user = this.signers.accounts[1];

        const debt = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
          erc20,
          user.address
        );
        const refund = await this.redeployedContracts.feeCollector.simulateRefund(
          user,
          erc20,
          ethers.parseEther("1")
        );
        const netDebt =
          (await this.redeployedContracts.trenBoxManager.getNetDebt(erc20, debt)) - refund;
        const fee = (netDebt * 100n) / 1000n;

        const flashLoanTx = await this.redeployedContracts.flashLoan
          .connect(user)
          .flashLoanForRepay(erc20);

        await expect(flashLoanTx)
          .to.emit(this.redeployedContracts.flashLoan, "FlashLoanExecuted")
          .withArgs(user, netDebt, fee);

        await expect(flashLoanTx).to.changeTokenBalances(
          erc20,
          [user.address, this.testContracts.mockRouter, this.redeployedContracts.flashLoan],
          [3998898683871051144149n, 1101316128948855851n, 0]
        );
        await expect(flashLoanTx).to.changeTokenBalances(
          this.redeployedContracts.debtToken,
          [user.address, this.signers.deployer.address, this.redeployedContracts.flashLoan],
          [0, fee, 0]
        );
      });
    });

    context("when collateral is erc20_with_6_decimals (stable coin)", function () {
      it("should execute flashLoanForRepay and emit FlashLoanExecuted", async function () {
        const { erc20_with_6_decimals } = this.testContracts;
        const user = this.signers.accounts[1];

        const debt = await this.redeployedContracts.trenBoxManager.getTrenBoxDebt(
          erc20_with_6_decimals,
          user.address
        );
        const refund = await this.redeployedContracts.feeCollector.simulateRefund(
          user,
          erc20_with_6_decimals,
          ethers.parseEther("1")
        );
        const netDebt =
          (await this.redeployedContracts.trenBoxManager.getNetDebt(erc20_with_6_decimals, debt)) -
          refund;
        const fee = (netDebt * 100n) / 1000n;

        const flashLoanTx = await this.redeployedContracts.flashLoan
          .connect(user)
          .flashLoanForRepay(erc20_with_6_decimals);

        await expect(flashLoanTx)
          .to.emit(this.redeployedContracts.flashLoan, "FlashLoanExecuted")
          .withArgs(user, netDebt, fee);

        await expect(flashLoanTx).to.changeTokenBalances(
          erc20_with_6_decimals,
          [user.address, this.testContracts.mockRouter, this.redeployedContracts.flashLoan],
          [0, 2196044125n, 1803955875n]
        );
        await expect(flashLoanTx).to.changeTokenBalances(
          this.redeployedContracts.debtToken,
          [user.address, this.signers.deployer.address, this.redeployedContracts.flashLoan],
          [0, fee, 0]
        );
      });
    });
  });
}
