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

      const liquidatorBalanceAfterMadeLiquidation = await erc20.balanceOf(this.liquidator.address);

      expect(liquidatorBalanceAfterMadeLiquidation).to.be.equal(totalCollGasCompensation);
    });
  });
}
