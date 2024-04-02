import { expect } from "chai";
import { ethers } from "hardhat";

import { BorrowerOperationType } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanRepayDebtTokens() {
  beforeEach(async function () {
    const users = [this.signers.accounts[0], this.signers.accounts[1]];

    this.upperHint = DEFAULT_UPPER_HINT;
    this.lowerHint = DEFAULT_LOWER_HINT;

    const { erc20 } = this.testContracts;
    const asset = await erc20.getAddress();

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20,
          collateralOptions: {
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

        await expect(repayDebtTx).to.be.revertedWith(
          "BorrowerOps: There must be either a collateral change or a debt change"
        );
      });
    });

    context("when user tries to repay so his debt is less than minNetDebt", function () {
      it("should revert", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const { debtToken } = this.contracts;

        const totalDebt = await debtToken.balanceOf(user.address);

        const amountToRepay = totalDebt;

        const repayDebtTx = this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20,
          from: user,
        });

        await expect(repayDebtTx).to.be.revertedWith(
          "BorrowerOps: TrenBox's net debt must be greater than minimum"
        );
      });
    });

    context("when TrenBox is closed", function () {
      it.skip("they cannot repay debt", async function () {});
    });

    context("when user has not enough debt token balance", function () {
      it("should revert", async function () {
        const [user, differentUser] = this.users;
        const { erc20 } = this.testContracts;
        const { debtToken, adminContract } = this.contracts;

        const totalBalance = await debtToken.balanceOf(user.address);
        await debtToken.connect(user).transfer(differentUser.address, totalBalance);

        const minNetDebt = await adminContract.getMinNetDebt(await erc20.getAddress());
        const amountToRepay = totalBalance - minNetDebt;

        const repayDebtTx = this.utils.repayDebt({
          debtAmount: amountToRepay,
          collateral: erc20,
          from: user,
        });

        await expect(repayDebtTx).to.be.revertedWith(
          "BorrowerOps: Caller doesnt have enough debt tokens to make repayment"
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

      // TODO: How to calculate those values?
      const expectedDebt = 2010000248756218905472n;
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

      // TODO: How to calculate this value?
      const expectedDebtTokenBalance = 49513245102348957n;

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
  });

  context("when user does not have TrenBox", function () {
    it("they cannot add collateral", async function () {
      const [, userWithoutTrenBox] = this.users;
      const { erc20 } = this.testContracts;

      const debtAmountToRepay = 100n;

      const addCollateralTx = this.utils.repayDebt({
        debtAmount: debtAmountToRepay,
        collateral: erc20,
        from: userWithoutTrenBox,
      });

      await expect(addCollateralTx).to.be.revertedWith(
        "BorrowerOps: TrenBox does not exist or is closed"
      );
    });
  });
}
