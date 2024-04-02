import { expect } from "chai";
import { ethers } from "hardhat";

import { BorrowerOperationType } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanAddColl() {
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
          },
        },
      ],
    });

    await this.utils.setUsers(users);
  });

  context("when user has TrenBox", function () {
    context("when user tries to send 0 collateral amount", function () {
      it("they cannot add collateral", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const amount = 0n;

        const addCollateralTx = this.utils.addCollateral({
          amount,
          collateral: erc20,
          from: user,
        });

        await expect(addCollateralTx).to.be.revertedWith(
          "BorrowerOps: There must be either a collateral change or a debt change"
        );
      });
    });

    context("when TrenBox is closed", function () {
      beforeEach(async function () {
        const { erc20 } = this.testContracts;

        await this.utils.setupProtocolForTests({
          commands: [
            {
              action: "closeTrenBox",
              args: {
                asset: erc20,
                from: this.users[0],
              },
            },
          ],
        });
      });

      it.skip("they cannot add collateral", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const amount = ethers.parseUnits("100", 30);

        const addCollateralTx = this.utils.addCollateral({
          amount,
          collateral: erc20,
          from: user,
        });

        await expect(addCollateralTx).to.be.revertedWith(
          "BorrowerOps: TrenBox does not exist or is closed"
        );
      });
    });

    context("when user has not enough collateral", function () {
      it("they cannot add collateral", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const amount = ethers.parseUnits("300", 30);

        const addCollateralTx = this.utils.addCollateral({
          amount,
          collateral: erc20,
          from: user,
        });

        await expect(addCollateralTx).to.be.revertedWithCustomError(
          erc20,
          "ERC20InsufficientBalance"
        );
      });
    });

    it("should emit TrenBoxUpdated event", async function () {
      const { borrowerOperations } = this.contracts;
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      const amount = ethers.parseUnits("100", 30);

      // TODO: How to calculate those values?
      const expectedDebt = 2000000000000000000000n;
      const expectedCollateral = 200000000000000000000000000000000n;
      const expectedStake = 200000000000000000000000000000000n;

      const addCollateralTx = this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });

      await expect(addCollateralTx)
        .to.emit(borrowerOperations, "TrenBoxUpdated")
        .withArgs(
          assetAddress,
          user.address,
          expectedDebt,
          expectedCollateral,
          expectedStake,
          BorrowerOperationType.adjustTrenBox
        );
    });

    it("should decrease user's collateral balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 30);

      const userCollateralBalanceBefore = await erc20.balanceOf(user.address);

      const expectedUserCollateralBalance = userCollateralBalanceBefore - amount;

      const addCollateralTx = await this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });
      await addCollateralTx.wait();

      const userCollateralBalance = await erc20.balanceOf(user.address);

      expect(userCollateralBalance).to.equal(expectedUserCollateralBalance);
    });

    it("should increase ActivePool collateral balance", async function () {
      const [user] = this.users;
      const { activePool } = this.contracts;
      const { erc20 } = this.testContracts;
      const amount = ethers.WeiPerEther;

      const activePoolAddress = await activePool.getAddress();

      const activePoolCollateralBalanceBefore = await erc20.balanceOf(activePoolAddress);

      const expectedActivePoolCollateralBalance = activePoolCollateralBalanceBefore + amount;

      const tx = await this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });

      await expect(tx).to.emit(erc20, "Transfer").withArgs(user.address, activePoolAddress, amount);

      const activePoolCollateralBalanceAfter = await erc20.balanceOf(activePoolAddress);

      expect(activePoolCollateralBalanceAfter).to.equal(expectedActivePoolCollateralBalance);
    });

    it("should not change user's debt balance", async function () {
      const [user] = this.users;
      const { debtToken } = this.contracts;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 30);

      const userDebtBalanceBefore = await debtToken.balanceOf(user.address);

      const addCollateralTx = await this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });
      await addCollateralTx.wait();

      const userDebtBalance = await debtToken.balanceOf(user.address);

      expect(userDebtBalance).to.equal(userDebtBalanceBefore);
    });

    it("should not change ActivePool debt balance", async function () {
      const [user] = this.users;
      const { activePool } = this.contracts;
      const { debtToken } = this.contracts;
      const { erc20 } = this.testContracts;
      const amount = ethers.WeiPerEther;

      const activePoolAddress = await activePool.getAddress();

      const activePoolDebtBalanceBefore = await debtToken.balanceOf(activePoolAddress);

      await this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });

      const activePoolDebtBalanceAfter = await debtToken.balanceOf(activePoolAddress);

      expect(activePoolDebtBalanceAfter).to.equal(activePoolDebtBalanceBefore);
    });

    it.skip("should not emit DebtToken Transfer event", async function () {
      const [user] = this.users;
      const { debtToken } = this.contracts;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 30);

      const addCollateralTx = await this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: user,
      });

      await expect(addCollateralTx).to.not.emit(debtToken, "Transfer");
    });
  });

  context("when user does not have TrenBox", function () {
    it("they cannot add collateral", async function () {
      const [, userWithoutTrenBox] = this.users;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 30);

      const addCollateralTx = this.utils.addCollateral({
        amount,
        collateral: erc20,
        from: userWithoutTrenBox,
      });

      await expect(addCollateralTx).to.be.revertedWith(
        "BorrowerOps: TrenBox does not exist or is closed"
      );
    });
  });
}
