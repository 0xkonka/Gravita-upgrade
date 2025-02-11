import { expect } from "chai";
import { ethers, network } from "hardhat";

import { BorrowerOperationType } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanRepayDebtTokens() {
  beforeEach(async function () {
    const users = [this.signers.accounts[0], this.signers.accounts[1], this.signers.accounts[3]];

    this.upperHint = DEFAULT_UPPER_HINT;
    this.lowerHint = DEFAULT_LOWER_HINT;

    const { erc20, erc20_with_6_decimals } = this.testContracts;
    const asset = await erc20.getAddress();
    const asset_with_6_decimals = await erc20_with_6_decimals.getAddress();
    await this.contracts.debtToken.addWhitelist(await this.contracts.feeCollector.getAddress());

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20,
          collateralOptions: {
            debtTokenGasCompensation: ethers.parseUnits("200", "ether"),
            setAsActive: true,
            price: ethers.parseUnits("200", "ether"),
            mints: [
              {
                to: users[0].address,
                amount: 3n * ethers.parseUnits("100", 30),
              },
              {
                to: users[1].address,
                amount: 2n * ethers.parseUnits("100", 30),
              },
            ],
          },
        },
      ],
      commands: [
        {
          action: "openTrenBox",
          args: {
            from: users[0],
            asset: asset,
            assetAmount: ethers.parseUnits("100", 30),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
            extraDebtTokenAmount: ethers.parseUnits("10", 18),
          },
        },
        {
          action: "openTrenBox",
          args: {
            from: users[1],
            asset: asset,
            assetAmount: ethers.parseUnits("100", 30),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
            extraDebtTokenAmount: ethers.parseUnits("10", 18),
          },
        },
      ],
    });

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20_with_6_decimals,
          collateralOptions: {
            setAsActive: true,
            price: 1000283810000000000n,
            mints: [
              {
                to: users[0].address,
                amount: 3n * ethers.parseUnits("100", 30),
              },
              {
                to: users[1].address,
                amount: 2n * ethers.parseUnits("100", 30),
              },
              {
                to: users[2].address,
                amount: 1n * ethers.parseUnits("100", 30),
              },
            ],
          },
        },
      ],
      commands: [
        {
          action: "openTrenBox",
          args: {
            from: users[0],
            asset: asset_with_6_decimals,
            assetAmount: ethers.parseUnits("5000", 18),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
          },
        },
        {
          action: "openTrenBox",
          args: {
            from: users[2],
            asset: asset_with_6_decimals,
            assetAmount: ethers.parseUnits("155423.5223", 18),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
            extraDebtTokenAmount: ethers.parseUnits("100000", 18),
          },
        },
      ],
    });

    await this.utils.setUsers(users);
  });

  context("when user has TrenBox", function () {
    context("when user tries to repay 0 debt amount", function () {
      it("cannot repay debt", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;

        const amountToRepay = 0n;

        const repayDebtTx = this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20,
          from: user,
        });

        await expect(repayDebtTx).to.be.revertedWithCustomError(
          this.contracts.borrowerOperations,
          "BorrowerOperations__ZeroAdjustment"
        );
      });
    });

    context("when user has not enough debt token balance", function () {
      it("should revert", async function () {
        const [user, differentUser] = this.users;
        const { erc20 } = this.testContracts;
        const { debtToken, adminContract, borrowerOperations } = this.contracts;

        const totalBalance = await debtToken.balanceOf(user.address);
        await debtToken.connect(user).transfer(differentUser.address, totalBalance);

        const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
        const amountToRepay = totalBalance - minNetDebt;

        const repayDebtTx = this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20,
          from: user,
        });

        await expect(repayDebtTx).to.be.revertedWithCustomError(
          borrowerOperations,
          "BorrowerOperations__InsufficientDebtBalance"
        );
      });
    });

    it("should emit TrenBoxUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { adminContract, debtToken } = this.contracts;

      const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
      const totalDebt = await debtToken.balanceOf(user.address);

      const amountToRepay = totalDebt - minNetDebt;

      const repayDebtTx = this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      const collateralAddress = await erc20.getAddress();

      const expectedDebt = 219950497512437810944n;
      const expectedCollateral = 100000000000000000000000000000000n;
      const expectedStake = 100000000000000000000000000000000n;

      await expect(repayDebtTx)
        .to.emit(this.contracts.borrowerOperations, "TrenBoxUpdated")
        .withArgs(
          collateralAddress,
          user.address,
          expectedDebt,
          expectedCollateral,
          expectedStake,
          BorrowerOperationType.adjustTrenBox
        );
    });

    it("should decrease user's debt token balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { adminContract, debtToken } = this.contracts;

      const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
      const totalDebt = await debtToken.balanceOf(user.address);

      const amountToRepay = totalDebt - minNetDebt;

      const repayDebtTx = this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      const expectedDebtTokenBalance = 1981440853064360912030n;

      await expect(repayDebtTx).to.changeTokenBalances(
        debtToken,
        [user],
        [-expectedDebtTokenBalance]
      );
    });

    it("should decrease TrenBox's debt", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { adminContract, debtToken, trenBoxManager } = this.contracts;

      const collateralAddress = await erc20.getAddress();

      const [debtBefore] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
      const totalDebt = await debtToken.balanceOf(user.address);

      const amountToRepay = totalDebt - minNetDebt;

      await this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      const [debtAfter] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const expectedDebt = debtBefore - amountToRepay;

      expect(debtAfter).to.be.equal(expectedDebt);
    });

    it("should decrease TrenBox's debt up to 1", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { trenBoxManager } = this.contracts;

      const collateralAddress = await erc20.getAddress();

      const [debtBefore] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const amountToRepay = ethers.parseUnits("201004", 16);

      await this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      const [debtAfter] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const expectedDebt = debtBefore - amountToRepay;

      const trenBoxBalanceAfter = await trenBoxManager.getTrenBoxDebt(erc20, user.address);
      const debtAmountAfter = ethers.parseUnits("20001", 16);

      expect(debtAfter).to.be.equal(expectedDebt);
      expect(trenBoxBalanceAfter).to.be.equal(debtAmountAfter);
    });

    it("should not change user's collateral balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken, adminContract } = this.contracts;

      const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
      const totalDebt = await debtToken.balanceOf(user.address);

      const amountToRepay = totalDebt - minNetDebt;

      const userCollateralBalanceBefore = await erc20.balanceOf(user.address);

      const repayDebtTx = await this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      const userCollateralBalance = await erc20.balanceOf(user.address);

      expect(userCollateralBalance).to.equal(userCollateralBalanceBefore);

      await expect(repayDebtTx).to.changeTokenBalances(erc20, [user], [0n]);
    });

    it("should not emit Collateral Transfer event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken, adminContract } = this.contracts;

      const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
      const totalDebt = await debtToken.balanceOf(user.address);

      const amountToRepay = totalDebt - minNetDebt;

      const repayDebtTx = await this.utils.repayDebt({
        debtAmount: amountToRepay,
        collateral: erc20,
        from: user,
      });

      await expect(repayDebtTx).to.not.emit(erc20, "Transfer");
    });

    context("when user has enough debt token amount to close TrenBox", function () {
      it("should emit TrenBoxUpdated event", async function () {
        const [user, differentUser] = this.users;
        const { erc20 } = this.testContracts;
        const { debtToken, borrowerOperations } = this.contracts;

        const totalBalance = await debtToken.balanceOf(user.address);
        await debtToken.connect(user).transfer(differentUser.address, totalBalance);

        await this.contracts.debtToken.addWhitelist(user.address);
        await this.contracts.debtToken
          .connect(user)
          .mintFromWhitelistedContract(ethers.parseUnits("3000", 18));

        const amountToRepay = ethers.parseUnits("201005", 16);

        const repayDebtTx = this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20,
          from: user,
        });

        await expect(repayDebtTx)
          .to.emit(borrowerOperations, "TrenBoxUpdated")
          .withArgs(erc20, user.address, 0n, 0n, 0n, 1n);
      });

      it("should increase user token balance", async function () {
        const [user] = this.users;
        const { erc20_with_6_decimals } = this.testContracts;
        const { trenBoxManager } = this.contracts;
        const decimal = await erc20_with_6_decimals.decimals();

        const assetBalanceBefore = await erc20_with_6_decimals.balanceOf(user.address);
        const compositDebt = await trenBoxManager.getTrenBoxDebt(
          erc20_with_6_decimals,
          user.address
        );
        const amountToRepay = await trenBoxManager.getNetDebt(erc20_with_6_decimals, compositDebt);
        const assetAmount = ethers.parseUnits("5000", 18);

        await this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20_with_6_decimals,
          from: user,
        });

        const assetBalanceAfter = await erc20_with_6_decimals.balanceOf(user.address);
        const expectedAssetBalance =
          assetBalanceBefore + assetAmount / BigInt(10 ** (18 - Number(decimal)));

        expect(assetBalanceAfter).to.equal(expectedAssetBalance);
      });

      it("should decrease TrenBox debt and collateral amount", async function () {
        const [user] = this.users;
        const { erc20_with_6_decimals } = this.testContracts;
        const { trenBoxManager } = this.contracts;

        const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20_with_6_decimals);

        const debtBalanceBefore = await trenBoxManager.getTrenBoxDebt(
          erc20_with_6_decimals,
          user.address
        );
        const trenBoxCollBefore = await trenBoxManager.getTrenBoxColl(
          erc20_with_6_decimals,
          user.address
        );

        const assetAmount = ethers.parseUnits("5000", 18);
        const amountToRepay = ethers.parseUnits("2000", 18);

        await this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20_with_6_decimals,
          from: user,
        });

        const debtBalanceAfter = await trenBoxManager.getTrenBoxDebt(
          erc20_with_6_decimals,
          user.address
        );
        const expectedDebtBalance = debtBalanceBefore - minDebt;

        expect(debtBalanceAfter).to.equal(expectedDebtBalance);

        const trenBoxCollAfter = await trenBoxManager.getTrenBoxColl(
          erc20_with_6_decimals,
          user.address
        );
        const expectedCollBalance = trenBoxCollBefore - assetAmount;

        expect(trenBoxCollAfter).to.equal(expectedCollBalance);
      });

      it("should close TrenBox after repay full net debt", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const { trenBoxManager } = this.contracts;

        const compositDebt = await trenBoxManager.getTrenBoxDebt(erc20, user.address);
        const netDebt = await trenBoxManager.getNetDebt(erc20, compositDebt);

        await this.utils.repayDebt({
          debtAmount: netDebt - ethers.parseEther("1"),
          collateral: erc20,
          from: user,
        });

        const debtBalanceAfter = await trenBoxManager.getTrenBoxDebt(erc20, user.address);
        expect(debtBalanceAfter).to.equal(ethers.parseUnits("201", 18));

        const trenBoxStatusAfterRepay = await trenBoxManager.getTrenBoxStatus(erc20, user.address);
        expect(trenBoxStatusAfterRepay).to.equal(1n);

        await this.utils.repayDebt({
          debtAmount: ethers.parseEther("1"),
          collateral: erc20,
          from: user,
        });

        const debtBalanceAfterSecondRepay = await trenBoxManager.getTrenBoxDebt(
          erc20,
          user.address
        );
        expect(debtBalanceAfterSecondRepay).to.equal(0n);

        const trenBoxStatusAfterSecondRepay = await trenBoxManager.getTrenBoxStatus(
          erc20,
          user.address
        );
        expect(trenBoxStatusAfterSecondRepay).to.equal(2n);
      });

      it("should not allow repay more debt amount than needed", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const { trenBoxManager, debtToken } = this.contracts;

        const compositDebt = await trenBoxManager.getTrenBoxDebt(erc20, user.address);
        const netDebt = await trenBoxManager.getNetDebt(erc20, compositDebt);

        const tx = this.utils.repayDebt({
          debtAmount: netDebt + ethers.parseEther("500"),
          collateral: erc20,
          from: user,
        });

        const oneYearInSec = 31536000;
        await network.provider.send("evm_increaseTime", [oneYearInSec]);

        await expect(tx).changeTokenBalance(debtToken, user, -netDebt);
      });
    });
  });

  context("when user does not have TrenBox", function () {
    it("reverts with panic because user has no debt at all", async function () {
      const { erc20 } = this.testContracts;

      const debtAmountToRepay = 100n;

      const addCollateralTx = this.utils.repayDebt({
        debtAmount: debtAmountToRepay,
        collateral: erc20,
        from: this.users[2],
      });

      await expect(addCollateralTx).to.be.revertedWithPanic();
    });
  });
}
