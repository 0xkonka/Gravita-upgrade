import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { ZERO_ADDRESS } from "../../../../utils/constants";

export default function shouldBehaveLikeRedistributeTrenBoxes(): void {
  context("when execute active trenBoxes for current asset", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseEther("1000");
      const mintCap = ethers.parseUnits("2", 24);
      const users = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
        this.signers.accounts[5],
      ];
      const usersToOpenTrenBoxInt = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
      ];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseEther("20"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("100", 30),
                };
              }),
            },
          },
        ],
        commands: usersToOpenTrenBoxInt.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: assetAddress,
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should revert with custom error TrenBoxManagerOperations__NothingToLiquidate", async function () {
      const { erc20 } = this.testContracts;

      await expect(
        this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(erc20, 1n)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NothingToLiquidate"
      );
    });

    it("should execute redistributeTrenBoxes and emit Redistribution and TrenBoxUpdated", async function () {
      const { erc20 } = this.testContracts;

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseEther("2"));

      const redistributeTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        1n
      );

      const liquidatedDebt = ethers.parseEther("2000");
      const liquidatedColl = ethers.parseEther("1000");

      await expect(redistributeTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, liquidatedDebt, liquidatedColl);
    });

    it("should execute redistributeTrenBoxes with more TrenBoxes and emit TrenBoxUpdated", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = ethers.parseEther("2000");
      const assetAmountAfter = ethers.parseEther("3500");
      const [borrower, borrower2, borrower4, borrower5] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[4],
        this.signers.accounts[5],
      ];
      const newBorrowers = this.signers.accounts.slice(4, 6);

      const openTrenBoxPromises = newBorrowers.map((borrower) => {
        return this.utils.openTrenBox({
          asset: erc20,
          assetAmount,
          from: borrower,
        });
      });

      await Promise.all(openTrenBoxPromises);

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseEther("2"));

      const redistributeTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        3n
      );

      await expect(redistributeTx)
        .to.emit(this.contracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, borrower, 0n, 0n, 0n, 4n);
      await expect(redistributeTx)
        .to.emit(this.contracts.trenBoxManager, "TrenBoxUpdated")
        .withArgs(erc20, borrower2, 0n, 0n, 0n, 4n);

      const reapyTrenBoxPromises = newBorrowers.map((borrower) => {
        return this.utils.repayDebt({
          collateral: erc20,
          debtAmount: ethers.parseUnits("200", "ether"),
          from: borrower,
        });
      });

      await Promise.all(reapyTrenBoxPromises);

      const borrower4CollAmountAfterRedistribution =
        await this.contracts.trenBoxManager.getTrenBoxColl(erc20, borrower4.address);
      const borrower5CollAmountAfterRedistribution =
        await this.contracts.trenBoxManager.getTrenBoxColl(erc20, borrower5.address);

      expect(borrower4CollAmountAfterRedistribution).to.be.equal(assetAmountAfter);
      expect(borrower5CollAmountAfterRedistribution).to.be.equal(assetAmountAfter);
    });
  });

  context("some scenarios of redistribution mechanism", function () {
    beforeEach(async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const erc20Address = await erc20.getAddress();
      const erc20With6DecimalsAddress = await erc20_with_6_decimals.getAddress();
      const assetAmount = ethers.parseEther("1000");
      const mintCap = ethers.parseUnits("1", 24);
      const users = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];
      await this.contracts.debtToken.addWhitelist(this.signers.accounts[5].address);

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseEther("3"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseEther("2500"),
                };
              }),
            },
          },
        ],
        commands: users.map((user: HardhatEthersSigner) => {
          return {
            action: "openTrenBox",
            args: {
              asset: erc20Address,
              assetAmount,
              from: user,
            },
          };
        }),
      });

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20_with_6_decimals,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseEther("1"),
              mintCap,
              debtTokenGasCompensation: ethers.parseEther("300"),
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
              asset: erc20With6DecimalsAddress,
              assetAmount: 4n * assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should allow redistribute 3 TrenBoxes", async function () {
      const { erc20 } = this.testContracts;
      const [borrower1, borrower2, borrower3, borrower4] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Change erc20 token's price to 1.7
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("17", 17));

      // Redistribution for borrower1 and  borrower2 TrenBoxes
      const firstRedistributionTx =
        await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(erc20, 2n);

      const totalRedistributedDebt = ethers.parseEther("4000");
      const totalRedistributedColl = ethers.parseEther("2000");

      await expect(firstRedistributionTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, totalRedistributedDebt, totalRedistributedColl);

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower1, borrower2],
      });
      const trenBoxDebts = await this.utils.getTrenBoxDebts({
        asset: erc20,
        borrowers: [borrower1, borrower2],
      });

      expect(trenBoxStatuses).to.have.members([5n, 5n]);
      expect(trenBoxDebts).to.have.members([0n, 0n]);

      // Borrower3 decided to add some collaterals to avoid redistribution
      await this.contracts.borrowerOperations
        .connect(borrower3)
        .addColl(erc20, ethers.parseEther("1300"), ZERO_ADDRESS, ZERO_ADDRESS);

      // Erc20 token's price increased to 2
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2.3", 18));

      // And borrower4 decided to repay some of his debt and withdraw collaterals
      await this.utils.repayDebt({
        collateral: erc20,
        debtAmount: ethers.parseEther("1500"),
        from: borrower4,
      });
      await this.utils.withdrawCollateral({
        collateral: erc20,
        amount: ethers.parseEther("600"),
        from: borrower4,
      });

      // Check a new debt and coll of borrower3's TrenBox
      const newDebt = ethers.parseEther("4000");
      const newColl = ethers.parseEther("3300");

      const borrower3Debt = await this.contracts.trenBoxManager.getTrenBoxDebt(
        erc20,
        borrower3.address
      );
      const borrower3Coll = await this.contracts.trenBoxManager.getTrenBoxColl(
        erc20,
        borrower3.address
      );

      expect(borrower3Debt).to.be.equal(newDebt);
      expect(borrower3Coll).to.be.equal(newColl);

      // Erc20 token's price decreased 1.4
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("14", 17));

      // Redistribution for borrower4 TrenBox
      const secondRedistributionTx =
        await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(erc20, 2n);

      const totalRedistributedDebt2 = ethers.parseEther("2500");
      const totalRedistributedColl2 = ethers.parseEther("1400");

      await expect(secondRedistributionTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, totalRedistributedDebt2, totalRedistributedColl2);

      const trenBoxStatuses2 = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower3, borrower4],
      });
      const borrower4Debt = await this.contracts.trenBoxManager.getTrenBoxDebt(
        erc20,
        borrower4.address
      );

      expect(trenBoxStatuses2).to.have.members([1n, 5n]);
      expect(borrower4Debt).to.be.equal(0n);

      // Borrower3 decided to add more collaterals to avoid another redistribution
      await this.contracts.borrowerOperations
        .connect(borrower3)
        .addColl(erc20, ethers.parseEther("200"), ZERO_ADDRESS, ZERO_ADDRESS);

      const borrower3DebtAtTheEnd = await this.contracts.trenBoxManager.getTrenBoxDebt(
        erc20,
        borrower3.address
      );
      const borrower3CollAtTheEnd = await this.contracts.trenBoxManager.getTrenBoxColl(
        erc20,
        borrower3.address
      );

      expect(borrower3DebtAtTheEnd).to.be.equal(ethers.parseEther("6500") - 850n);
      expect(borrower3CollAtTheEnd).to.be.equal(ethers.parseEther("4900") - 1400n);
    });

    it("should allow redistribute 2 low-value TrenBoxes with deposits in Stability Pool", async function () {
      const { erc20 } = this.testContracts;
      const [borrower1, borrower2, borrower3, borrower4, user] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
        this.signers.accounts[5],
      ];

      const trenUSDToSP = ethers.parseEther("1600");
      await this.contracts.debtToken.connect(user).mintFromWhitelistedContract(trenUSDToSP);
      await this.contracts.stabilityPool.connect(user).provideToSP(trenUSDToSP, [erc20]);

      // And all borrowers decided to repay some of his debt and only 2 of them decided to withdraw collaterals
      const borrowersList = [
        {
          borrower: borrower3,
          debtToRepay: ethers.parseEther("1500"),
          collToWithdraw: ethers.parseEther("800"),
        },
        {
          borrower: borrower4,
          debtToRepay: ethers.parseEther("900"),
          collToWithdraw: ethers.parseEther("500"),
        },
      ];
      const borrowersList2 = [
        { borrower: borrower1, collToAdd: ethers.parseEther("1000") },
        { borrower: borrower2, collToAdd: ethers.parseEther("800") },
      ];

      const repayDebts = borrowersList.map(({ borrower, debtToRepay }) => {
        return this.utils.repayDebt({
          collateral: erc20,
          debtAmount: debtToRepay,
          from: borrower,
        });
      });
      const addColls = borrowersList2.map(({ borrower, collToAdd }) => {
        return this.utils.addCollateral({
          collateral: erc20,
          amount: collToAdd,
          from: borrower,
        });
      });
      const withdrawColls = borrowersList.map(({ borrower, collToWithdraw }) => {
        return this.utils.withdrawCollateral({
          collateral: erc20,
          amount: collToWithdraw,
          from: borrower,
        });
      });

      await Promise.all(repayDebts);
      await Promise.all(addColls);
      await Promise.all(withdrawColls);

      // Change erc20 token's price to 1.7
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("24", 17));

      // Redistribution for borrower3 and borrower4 TrenBoxes
      const redistributionTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        4n
      );

      const totalRedistributedDebt = ethers.parseEther("1600");
      const totalRedistributedColl = ethers.parseEther("700");

      await expect(redistributionTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, totalRedistributedDebt, totalRedistributedColl);

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });

      expect(trenBoxStatuses).to.have.members([1n, 1n, 5n, 5n]);

      // Borrower1 and borrower2 repayed some part of the debts and updated TrenBoxes
      await this.utils.repayDebt({
        collateral: erc20,
        debtAmount: ethers.parseEther("150"),
        from: borrower1,
      });
      await this.utils.repayDebt({
        collateral: erc20,
        debtAmount: ethers.parseEther("100"),
        from: borrower2,
      });

      const trenBoxDebts = await this.utils.getTrenBoxDebts({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      const trenBoxColls = await this.utils.getTrenBoxColls({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });

      expect(trenBoxDebts).to.have.members([
        ethers.parseEther("1850"),
        0n,
        ethers.parseEther("1900"),
        0n,
      ]);
      expect(trenBoxColls).to.have.members([
        ethers.parseEther("2000"),
        0n,
        ethers.parseEther("1800"),
        0n,
      ]);

      const trenUSDInSP = await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

      expect(trenUSDInSP).to.be.equal(totalRedistributedDebt - trenUSDToSP);
    });

    it("should allow redistribute 2 low-value TrenBoxes with 2 collaterals", async function () {
      // Check with erc20
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const [borrower1, borrower2, borrower3, borrower4] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Change erc20 token's price to 1.6
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("16", 17));

      // Borrower1, Borrower3 and Borrower4 decided to add some collaterals to avoid redistribution
      const borrowersListToAddColls = [
        { borrower: borrower1, collAmount: ethers.parseEther("1000") },
        { borrower: borrower3, collAmount: ethers.parseEther("1000") },
        { borrower: borrower4, collAmount: ethers.parseEther("200") },
      ];

      const addColls = borrowersListToAddColls.map(({ borrower, collAmount }) => {
        return this.utils.addCollateral({
          collateral: erc20,
          amount: collAmount,
          from: borrower,
        });
      });

      await Promise.all(addColls);

      // Redistribution for borrower2 and borrower4 TrenBoxes
      const redistributionTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        4n
      );

      const totalRedistributedDebt = ethers.parseEther("4000");
      const totalRedistributedColl = ethers.parseEther("2200");

      await expect(redistributionTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, totalRedistributedDebt, totalRedistributedColl);

      // Borrower1 and Borrower3 decided to repay some debts, and update TrenBoxes
      await this.utils.repayDebt({
        collateral: erc20,
        debtAmount: ethers.parseEther("100"),
        from: borrower1,
      });
      await this.utils.repayDebt({
        collateral: erc20,
        debtAmount: ethers.parseEther("100"),
        from: borrower3,
      });

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      const trenBoxDebts = await this.utils.getTrenBoxDebts({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      const trenBoxColls = await this.utils.getTrenBoxColls({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });

      expect(trenBoxStatuses).to.have.members([1n, 5n, 1n, 5n]);
      expect(trenBoxDebts).to.have.members([
        ethers.parseEther("3900"),
        0n,
        ethers.parseEther("3900"),
        0n,
      ]);
      expect(trenBoxColls).to.have.members([
        ethers.parseEther("3100"),
        0n,
        ethers.parseEther("3100"),
        0n,
      ]);

      // Check with erc20_with_6_decimals
      const borrowersList = [
        {
          borrower: borrower1,
          debtAmount: ethers.parseEther("1600"),
          collateralAmount: ethers.parseEther("3170"),
        },
        {
          borrower: borrower3,
          debtAmount: ethers.parseEther("1700"),
          collateralAmount: ethers.parseEther("3230"),
        },
        {
          borrower: borrower4,
          debtAmount: ethers.parseEther("1650"),
          collateralAmount: ethers.parseEther("3150"),
        },
      ];

      const repayDebtPromises = borrowersList.map(({ borrower, debtAmount }) => {
        return this.utils.repayDebt({
          collateral: erc20_with_6_decimals,
          debtAmount: debtAmount,
          from: borrower,
        });
      });
      const withdrawCollateralPromises = borrowersList.map(({ borrower, collateralAmount }) => {
        return this.utils.withdrawCollateral({
          collateral: erc20_with_6_decimals,
          amount: collateralAmount,
          from: borrower,
        });
      });

      await Promise.all(repayDebtPromises);
      await Promise.all(withdrawCollateralPromises);

      // Change erc20_with_6_decimals token's price to 0.79
      await this.testContracts.priceFeedTestnet.setPrice(
        erc20_with_6_decimals,
        ethers.parseUnits("79", 16)
      );

      // Redistribution for borrower1, borrower3 and borrower4 TrenBoxes
      const redistributionTx2 = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20_with_6_decimals,
        4n
      );

      const totalRedistributedDebt2 = ethers.parseEther("1950");
      const totalRedistributedColl2 = ethers.parseEther("2450");

      await expect(redistributionTx2)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20_with_6_decimals, totalRedistributedDebt2, totalRedistributedColl2);

      // Borrower2 decided to repay some debts, and update TrenBox
      await this.utils.repayDebt({
        collateral: erc20_with_6_decimals,
        debtAmount: ethers.parseEther("1000"),
        from: borrower2,
      });

      const trenBoxStatuses2 = await this.utils.getTrenBoxStatuses({
        asset: erc20_with_6_decimals,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      const trenBoxDebts2 = await this.utils.getTrenBoxDebts({
        asset: erc20_with_6_decimals,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      const trenBoxColls2 = await this.utils.getTrenBoxColls({
        asset: erc20_with_6_decimals,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });

      expect(trenBoxStatuses2).to.have.members([5n, 1n, 5n, 5n]);
      expect(trenBoxDebts2).to.have.members([0n, ethers.parseEther("3250"), 0n, 0n]);
      expect(trenBoxColls2).to.have.members([0n, ethers.parseEther("6450"), 0n, 0n]);
    });
  });
}
