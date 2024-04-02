import { expect } from "chai";
import { ethers } from "hardhat";

import { BorrowerOperationType } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanWithdrawColl() {
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
            extraDebtTokenAmount: ethers.parseUnits("10", 18),
          },
        },
        {
          action: "addCollateral",
          args: {
            from: users[0],
            collateral: erc20,
            amount: ethers.parseUnits("100", 30),
          },
        },
      ],
    });

    await this.utils.setUsers(users);
  });

  context("when user has TrenBox", function () {
    context("when user tries to withdraw 0 collateral amount", async function () {
      it("cannot withdraw collateral", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;

        const amountToWithdraw = 0n;

        const withdrawCollateralTx = this.utils.withdrawCollateral({
          from: user,
          collateral: erc20,
          amount: amountToWithdraw,
        });

        await expect(withdrawCollateralTx).to.be.revertedWith(
          "BorrowerOps: There must be either a collateral change or a debt change"
        );
      });
    });

    context("when TrenBox is closed", function () {
      it.skip("they cannot withdraw collateral", async function () {});
    });

    context("when user tries to withdraw more collateral than they have", async function () {
      it("cannot withdraw collateral", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;

        const amountToWithdraw = ethers.parseUnits("200", 30);

        const withdrawCollateralTx = this.utils.withdrawCollateral({
          from: user,
          collateral: erc20,
          amount: amountToWithdraw,
        });

        await expect(withdrawCollateralTx).to.be.revertedWith(
          "BorrowerOps: An operation that would result in ICR < MCR is not permitted"
        );
      });
    });

    it("should emit TrenBoxUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;

      const amountToWithdraw = ethers.parseUnits("50", 30);

      const withdrawCollateralTx = this.utils.withdrawCollateral({
        from: user,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      const collateralAddress = await erc20.getAddress();

      // TODO: How to calculate those values?
      const expectedDebt = 2010050000000000000000n;
      const expectedCollateral = 150000000000000000000000000000000n;
      const expectedStake = 150000000000000000000000000000000n;

      await expect(withdrawCollateralTx)
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

    it("should increase user's collateral balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;

      const amountToWithdraw = ethers.parseUnits("100", 30);

      const withdrawCollateralTx = await this.utils.withdrawCollateral({
        from: user,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      await expect(withdrawCollateralTx).to.changeTokenBalances(erc20, [user], [amountToWithdraw]);
    });

    it("should decrease ActivePool collateral balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { activePool } = this.contracts;

      const amountToWithdraw = ethers.parseUnits("100", 30);

      const withdrawCollateralTx = await this.utils.withdrawCollateral({
        from: user,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      await expect(withdrawCollateralTx).to.changeTokenBalances(
        erc20,
        [activePool],
        [-amountToWithdraw]
      );
    });

    it("should not change user's debt token balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken } = this.contracts;

      const amountToWithdraw = ethers.parseUnits("100", 30);

      const withdrawCollateralTx = await this.utils.withdrawCollateral({
        from: user,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      await expect(withdrawCollateralTx).to.changeTokenBalances(debtToken, [user], [0]);
    });

    it.skip("should not emit DebtToken Transfer event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken } = this.contracts;

      const amountToWithdraw = ethers.parseUnits("100", 30);

      const withdrawCollateralTx = await this.utils.withdrawCollateral({
        from: user,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      await expect(withdrawCollateralTx).to.not.emit(debtToken, "Transfer");
    });
  });

  context("when user does not have TrenBox", function () {
    it("they cannot withdraw collateral", async function () {
      const [, userWithoutTrenBox] = this.users;
      const { erc20 } = this.testContracts;

      const amountToWithdraw = ethers.parseUnits("100", 30);

      const addCollateralTx = this.utils.withdrawCollateral({
        from: userWithoutTrenBox,
        collateral: erc20,
        amount: amountToWithdraw,
      });

      await expect(addCollateralTx).to.be.revertedWith(
        "BorrowerOps: TrenBox does not exist or is closed"
      );
    });
  });
}
