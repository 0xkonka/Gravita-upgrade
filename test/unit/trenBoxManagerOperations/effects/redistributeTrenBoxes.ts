import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeRedistributeTrenBoxes(): void {
  context("when execute active trenBoxes for current asset", function () {
    beforeEach(async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      const assetAmount = ethers.parseUnits("1000", "ether");
      const mintCap = ethers.parseUnits("200", 35);
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
      const borrower = this.signers.accounts[1];

      await expect(
        this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(erc20, [borrower])
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxManagerOperations,
        "TrenBoxManagerOperations__NothingToLiquidate"
      );
    });

    it("should execute redistributeTrenBoxes and emit Redistribution and TrenBoxUpdated", async function () {
      const { erc20 } = this.testContracts;
      const borrower = this.signers.accounts[2];

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const redistributeTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        [borrower]
      );

      const liquidatedDebt = ethers.parseUnits("2000", "ether");
      const liquidatedColl = ethers.parseUnits("1000", "ether");
      const totalDebtTokenGasCompensation = 0n;

      await expect(redistributeTx)
        .to.emit(this.contracts.trenBoxManagerOperations, "Redistribution")
        .withArgs(erc20, liquidatedDebt, liquidatedColl, totalDebtTokenGasCompensation);
    });

    it("should execute redistributeTrenBoxes with more TrenBoxes and emit TrenBoxUpdated", async function () {
      const { erc20 } = this.testContracts;
      const assetAmount = ethers.parseUnits("2000", "ether");
      const assetAmountAfter = ethers.parseUnits("3500", "ether");
      const [borrower, borrower2, borrower3, borrower4, borrower5] = [
        this.signers.accounts[1],
        this.signers.accounts[2],
        this.signers.accounts[3],
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

      await this.testContracts.priceFeedTestnet.setPrice(erc20, ethers.parseUnits("2", "ether"));

      const redistributeTx = await this.contracts.trenBoxManagerOperations.redistributeTrenBoxes(
        erc20,
        [borrower, borrower2, borrower3]
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
}
