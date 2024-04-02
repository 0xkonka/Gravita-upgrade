import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

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
}
