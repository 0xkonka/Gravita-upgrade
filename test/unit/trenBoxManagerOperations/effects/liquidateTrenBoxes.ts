import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

import { ZERO_ADDRESS } from "../../../../utils/constants";

export default function shouldBehaveLikeLiquidateTrenBoxes(): void {
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

      await expect(
        this.contracts.trenBoxManagerOperations.liquidateTrenBoxes(erc20, 3n)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NothingToLiquidate"
      );
    });

    it("should execute liquidateTrenBoxes and emit Liquidation when Normal Mode", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = ethers.parseUnits("5", 21);

      await erc20.mint(this.signers.accounts[4], ethers.parseUnits("100", 30));

      const { openTrenBoxTx } = await this.utils.openTrenBox({
        asset: erc20,
        assetAmount,
        from: this.signers.accounts[4],
      });

      await (await openTrenBoxTx).wait();

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const tx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20, 3n);

      const liquidatedDebt = ethers.parseUnits("6", 21);
      const liquidatedColl = ethers.parseUnits("2985", 18);
      const totalCollGasCompensation = ethers.parseUnits("15", 18);
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

      const liquidatorBalanceAfterMadeLiquidation = await erc20.balanceOf(this.liquidator);

      expect(liquidatorBalanceAfterMadeLiquidation).to.be.equal(totalCollGasCompensation);
    });

    it("should execute liquidateTrenBoxes and emit Liquidation when Recovery Mode", async function () {
      const { erc20 } = this.testContracts;

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const tx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20, 3n);

      const liquidatedDebt = ethers.parseUnits("4", 21);
      const liquidatedColl = ethers.parseUnits("199", 19);
      const totalCollGasCompensation = ethers.parseUnits("10", 18);
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

      const liquidatorBalanceAfterMadeLiquidation = await erc20.balanceOf(this.liquidator);

      expect(liquidatorBalanceAfterMadeLiquidation).to.be.equal(totalCollGasCompensation);
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
        this.signers.accounts[5]
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

    it("should allow liquidate first undercollateralized 3 TrenBoxes by liquidator", async function () {
      const { erc20 } = this.testContracts;
      const [borrower1, borrower2, borrower3, borrower4] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Change price to 2
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      // Liquidation for borrower1 and  borrower2 TrenBoxes
      const firstLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20, 2n);

      const totalLiquidatedDebt = ethers.parseUnits("4000", 18);
      const totalLiquidatedColl = ethers.parseUnits("1990", 18);
      const totalCollGasCompensation = ethers.parseUnits("10", 18);
      const totalDebtGasCompensation = 0n;

      await expect(firstLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          totalLiquidatedDebt,
          totalLiquidatedColl,
          totalCollGasCompensation,
          totalDebtGasCompensation
        );
      await expect(firstLiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        totalCollGasCompensation
      );

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower1, borrower2],
      });
      expect(trenBoxStatuses).to.have.members([3n, 3n]);

      // Borrower3 decided to add some collaterals to avoid liquidation
      await this.contracts.borrowerOperations
        .connect(borrower3)
        .addColl(erc20, ethers.parseUnits("1500", 18), ZERO_ADDRESS, ZERO_ADDRESS);

      // Liquidation for borrower4 TrenBox
      const secondLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20, 1n);

      const liquidatedDebt = 3333333333333333333000n;
      const liquidatedColl = 1655016666666666666335n;
      const collGasCompensation = 8316666666666666665n;
      const debtGasCompensation = 0n;

      await expect(secondLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(erc20, liquidatedDebt, liquidatedColl, collGasCompensation, debtGasCompensation);

      await expect(secondLiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        collGasCompensation
      );

      const trenBoxStatusesAfterSecondLiquidation = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower3, borrower4],
      });
      expect(trenBoxStatusesAfterSecondLiquidation).to.have.members([1n, 3n]);
    });

    it("should allow liquidate first 3 TrenBoxes with 2 collaterals by liquidator", async function () {
      const { erc20, erc20_with_6_decimals } = this.testContracts;
      const [borrower1, borrower2, borrower3, borrower4] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
        this.signers.accounts[4],
      ];

      // Change price to 2
      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      // Liquidation for borrower1, borrower2 and borrower3 TrenBoxes
      const firstLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20, 3n);

      const totalLiquidatedDebt = ethers.parseUnits("6000", 18);
      const totalLiquidatedColl = ethers.parseUnits("2985", 18);
      const totalCollGasCompensation = ethers.parseUnits("15", 18);
      const totalDebtGasCompensation = 0n;

      await expect(firstLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20,
          totalLiquidatedDebt,
          totalLiquidatedColl,
          totalCollGasCompensation,
          totalDebtGasCompensation
        );

      await expect(firstLiquidationTx).changeTokenBalance(
        erc20,
        this.liquidator.address,
        totalCollGasCompensation
      );

      const trenBoxStatuses = await this.utils.getTrenBoxStatuses({
        asset: erc20,
        borrowers: [borrower1, borrower2, borrower3],
      });
      expect(trenBoxStatuses).to.have.members([3n, 3n, 3n]);

      // Change erc20_with_6_decimals price to 1
      await this.testContracts.priceFeedTestnet.setPrice(
        erc20_with_6_decimals,
        ethers.parseUnits("1", "ether")
      );

      // Borrower2 and borrower3 decided to add some collaterals to avoid liquidation
      await this.contracts.borrowerOperations
        .connect(borrower2)
        .addColl(erc20_with_6_decimals, ethers.parseUnits("1500", 18), ZERO_ADDRESS, ZERO_ADDRESS);
      await this.contracts.borrowerOperations
        .connect(borrower3)
        .addColl(erc20_with_6_decimals, ethers.parseUnits("2000", 18), ZERO_ADDRESS, ZERO_ADDRESS);

      // Liquidation for borrower1 and borrower4 TrenBox with erc20_with_6_decimals as a collateral
      const secondLiquidationTx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .liquidateTrenBoxes(erc20_with_6_decimals, 2n);

      const totalLiquidatedDebtWith6DecColl = ethers.parseUnits("4200", 18);
      const totalLiquidatedColltWith6DecColl = ethers.parseUnits("1990", 18);
      const totalCollGasCompWith6DecColl = ethers.parseUnits("10", 18);
      const totalDebtGasCompWith6DecColl = ethers.parseUnits("200", 18);

      await expect(secondLiquidationTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Liquidation")
        .withArgs(
          erc20_with_6_decimals,
          totalLiquidatedDebtWith6DecColl,
          totalLiquidatedColltWith6DecColl,
          totalCollGasCompWith6DecColl,
          totalDebtGasCompWith6DecColl
        );

      await expect(secondLiquidationTx).changeTokenBalance(
        erc20_with_6_decimals,
        this.liquidator.address,
        10000000n
      );

      const trenBoxStatusesWith6DecColl = await this.utils.getTrenBoxStatuses({
        asset: erc20_with_6_decimals,
        borrowers: [borrower1, borrower2, borrower3, borrower4],
      });
      expect(trenBoxStatusesWith6DecColl).to.have.members([3n, 1n, 1n, 3n]);
    });
  });
}
