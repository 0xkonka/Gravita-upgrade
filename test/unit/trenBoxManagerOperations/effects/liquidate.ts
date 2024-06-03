import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeLiquidate(): void {
  context("when execute with no active trenBoxes for current asset and borrower", function () {
    it("should revert custom error TrenBoxManagerOperations__TrenBoxNotActive", async function () {
      const { wETH } = this.collaterals.active;
      const borrower = this.signers.accounts[1];

      await expect(
        this.contracts.trenBoxManagerOperations.liquidate(wETH.address, borrower)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__TrenBoxNotActive"
      );
    });
  });

  context("when execute active trenBoxes for current asset", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("1", 21);
      const mintCap = ethers.parseUnits("200", 35);
      const users = [this.signers.accounts[1], this.signers.accounts[2], this.signers.accounts[3]];
      this.liquidator = this.signers.accounts[5];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("20", "ether"),
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
        commands: users.map((user: HardhatEthersSigner) => {
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

    it("should revert custom error TrenBoxManagerOperations__NothingToLiquidate", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.signers.accounts[1];

      await expect(
        this.contracts.trenBoxManagerOperations.liquidate(erc20, borrower)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NothingToLiquidate"
      );
    });

    it("should execute liquidate and emit Liquidation", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.signers.accounts[2];

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const tx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower);

      const liquidatedDebt = ethers.parseUnits("2", 21);
      const liquidatedColl = ethers.parseUnits("995", 18);
      const totalCollGasCompensation = ethers.parseUnits("5", 18);
      const totalDebtTokenGasCompensation = 0n;

      await expect(tx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          liquidatedDebt,
          liquidatedColl,
          totalCollGasCompensation,
          totalDebtTokenGasCompensation
        );

      await expect(tx).changeTokenBalance(erc20, this.liquidator.address, totalCollGasCompensation);
    });
  });

  context("some scenarios of liquidation mechanism", function () {
    beforeEach(async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const erc20Address = await erc20.getAddress();
      const erc20With6DecimalsAddress = await erc20_with_6_decimals.getAddress();
      const assetAmount = ethers.parseUnits("1000", 18);
      const mintCap = ethers.parseUnits("200", 35);
      const users = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
        this.signers.accounts[5],
      ];
      this.liquidator = this.signers.accounts[5];

      await this.utils.setupProtocolForTests({
        collaterals: [
          {
            collateral: erc20,
            collateralOptions: {
              setAsActive: true,
              price: ethers.parseUnits("3", "ether"),
              mintCap,
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("10000", 18),
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
              price: ethers.parseUnits("35", 17),
              mintCap,
              debtTokenGasCompensation: ethers.parseUnits("100", "ether"),
              mints: users.map((user) => {
                return {
                  to: user.address,
                  amount: ethers.parseUnits("3000", 18),
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
              assetAmount,
              from: user,
            },
          };
        }),
      });
    });

    it("should allow liquidate user2 and user3 TrenBoxes by liquidator", async function () {
      const { erc20 } = this.testContracts;
      const [borrower2, borrower3] = [this.signers.accounts[2], this.signers.accounts[3]];

      // Change price to 2
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      // Liquidation for borrower2 TrenBox
      const firstLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower2);

      const firstCollGasCompensation = ethers.parseUnits("5", 18);

      await expect(firstLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          ethers.parseUnits("2000", 18),
          ethers.parseUnits("995", 18),
          firstCollGasCompensation,
          0n
        );

      await expect(firstLiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        firstCollGasCompensation
      );

      // Liquidation for borrower3 TrenBox
      const secondLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower3);

      const secondCollGasCompensation = ethers.parseUnits("624375", 13);
      const newDebt = ethers.parseUnits("2000", 18) + ethers.parseUnits("2000", 18) / 4n;
      const fee = ethers.parseUnits("1000", 18) / 200n;
      const collAfterFirstLiquidation =
        ethers.parseUnits("1000", 18) + (ethers.parseUnits("1000", 18) - fee) / 4n;
      const feeCalc = (collAfterFirstLiquidation * 5n) / 1000n;
      const newColl = collAfterFirstLiquidation - feeCalc;

      await expect(secondLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(erc20, newDebt, newColl, secondCollGasCompensation, 0n);

      await expect(secondLiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        secondCollGasCompensation
      );

      const trenBoxStatusesWith6DecColl = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower2, borrower3],
      });
      expect(trenBoxStatusesWith6DecColl).to.have.members([3n, 3n]);
    });

    it("should allow liquidate user1, user3 and user4 TrenBoxes with 2 collaterals by liquidator", async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const [borrower1, borrower3, borrower4] = [
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Change erc20 price to 2
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));
      // Change erc20_with_6_decimals price to 1
      await this.testContracts.priceFeedTestnet.setPrice(
        erc20_with_6_decimals,
        ethers.parseUnits("1", "ether")
      );

      // Liquidation for borrower1 TrenBox with erc20 as a collateral
      const borrower1LiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower1);

      const borrower1GasCompensation = ethers.parseUnits("5", 18);

      await expect(borrower1LiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          ethers.parseUnits("2000", 18),
          ethers.parseUnits("995", 18),
          borrower1GasCompensation,
          0n
        );

      const borrower1TrenBoxStatus = await this.contracts.trenBoxManager.getTrenBoxStatus(
        erc20,
        borrower1
      );

      await expect(borrower1LiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        borrower1GasCompensation
      );
      expect(borrower1TrenBoxStatus).to.be.equal(3n);

      // Liquidation for borrower3 and borrower4 TrenBoxes with erc20 as a collateral
      const borrower3LiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower3);
      const borrower4LiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20, borrower4);

      const borrower3CollGasCompensation = ethers.parseUnits("624375", 13);
      const newDebt = ethers.parseUnits("2000", 18) + ethers.parseUnits("2000", 18) / 4n;
      const fee = ethers.parseUnits("1000", 18) / 200n;
      const collAfterFirstLiquidation =
        ethers.parseUnits("1000", 18) + (ethers.parseUnits("1000", 18) - fee) / 4n;
      const feeCalc = (collAfterFirstLiquidation * 5n) / 1000n;
      const newColl = collAfterFirstLiquidation - feeCalc;

      const borrower4CollGasCompensation = ethers.parseUnits("831459375", 10);
      const borrower4newDebt = 3333333333333333333000n;
      const borrower4CollAfterLiquidation = 1654604156250000000000n;

      await expect(borrower3LiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(erc20, newDebt, newColl, borrower3CollGasCompensation, 0n);

      await expect(borrower4LiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          borrower4newDebt,
          borrower4CollAfterLiquidation,
          borrower4CollGasCompensation,
          0n
        );

      await expect(borrower4LiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        borrower4CollGasCompensation
      );

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower3, borrower4],
      });
      expect(trenBoxStatuses).to.have.members([3n, 3n]);

      // Liquidation for borrower1 TrenBox with erc20_with_6_decimals as a collateral
      const borrower1LiquidationTxWith6DecColl = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20_with_6_decimals, borrower1);

      const borrower1FirstCollGasCompensation = ethers.parseUnits("5", 18);

      await expect(borrower1LiquidationTxWith6DecColl)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20_with_6_decimals,
          ethers.parseUnits("2100", 18),
          ethers.parseUnits("995", 18),
          borrower1FirstCollGasCompensation,
          ethers.parseUnits("100", 18)
        );

      await expect(borrower1LiquidationTxWith6DecColl).changeTokenBalance(
        erc20_with_6_decimals,
        this.liquidator.address,
        5000000n
      );

      // Liquidation for borrower3 TrenBoxe with erc20_with_6_decimals as a collateral
      const borr3LiquidationTxWith6DecColl = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidate(erc20_with_6_decimals, borrower3);

      const borr3CollGasCompWith6DecColl = ethers.parseUnits("624375", 13);
      const borr3newDebt = ethers.parseUnits("2100", 18) + ethers.parseUnits("2100", 18) / 4n;
      const _fee = ethers.parseUnits("1000", 18) / 200n;
      const collAfterSecondLiquidation =
        ethers.parseUnits("1000", 18) + (ethers.parseUnits("1000", 18) - _fee) / 4n;
      const _feeCalc = (collAfterSecondLiquidation * 5n) / 1000n;
      const borr3newColl = collAfterSecondLiquidation - _feeCalc;

      await expect(borr3LiquidationTxWith6DecColl)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20_with_6_decimals,
          borr3newDebt,
          borr3newColl,
          borr3CollGasCompWith6DecColl,
          ethers.parseUnits("100", 18)
        );

      await expect(borr3LiquidationTxWith6DecColl).changeTokenBalance(
        erc20_with_6_decimals,
        this.liquidator.address,
        6243750n
      );

      const trenBoxStatusesWith6DecColl = await this.utils.getTrenBoxStatuses({
        asset: erc20_with_6_decimals,
        borrowers: [borrower1, borrower3],
      });
      expect(trenBoxStatusesWith6DecColl).to.have.members([3n, 3n]);
    });
  });
}
