import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { ethers } from "hardhat";

export default function shouldBehaveLikeBatchLiquidateTrenBoxes(): void {
  context("when execute with no list of trenBoxes provided by the caller", function () {
    it("should revert custom error because of empty array", async function () {
      const { wETH } = this.collaterals.active;
      const addesses: AddressLike[] = [];

      await expect(
        this.contracts.trenBoxManagerOperations.batchLiquidateTrenBoxes(wETH.address, addesses)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__InvalidArraySize"
      );
    });

    it("should revert custom error because of size limit", async function () {
      const { wETH } = this.collaterals.active;
      const addresses: AddressLike[] = Array(26).fill(ethers.ZeroAddress);

      await expect(
        this.contracts.trenBoxManagerOperations.batchLiquidateTrenBoxes(wETH.address, addresses)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__InvalidArraySize"
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

    it("should revert with custom error TrenBoxManagerOperations__NothingToLiquidate", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.signers.accounts[1];

      await expect(
        this.contracts.trenBoxManagerOperations.batchLiquidateTrenBoxes(erc20, [borrower])
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NothingToLiquidate"
      );
    });

    it("should execute batchLiquidateTrenBoxes and emit Liquidation", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.signers.accounts[2];

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const tx = await this.contracts.trenBoxManagerOperations
        .connect(this.liquidator)
        .batchLiquidateTrenBoxes(erc20, [borrower]);

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
