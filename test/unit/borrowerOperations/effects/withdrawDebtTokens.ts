import { expect } from "chai";
import { ethers } from "hardhat";

import { BorrowerOperationType } from "../../../shared/types";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanWithdrawDebtTokens() {
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
    context("when user tries to withdraw 0 debt amount", function () {
      it("they cannot withdraw debt tokens", async function () {
        const [user] = this.users;
        const { erc20 } = this.testContracts;
        const amount = 0n;

        const withdrawDebtTokensTx = this.utils.takeDebt({
          from: user,
          collateral: erc20,
          debtAmount: amount,
        });

        await expect(withdrawDebtTokensTx).to.be.revertedWithCustomError(
          this.contracts.borrowerOperations,
          "BorrowerOperations__ZeroDebtChange"
        );
      });
    });

    context("when TrenBox is closed", function () {
      it.skip("they cannot withdraw debt tokens", async function () {});
    });

    it("should emit TrenBoxUpdated event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { borrowerOperations } = this.contracts;
      const amount = ethers.parseUnits("100", 18);
      const assetAddress = await erc20.getAddress();

      const withdrawDebtTokensTx = this.utils.takeDebt({
        from: user,
        collateral: erc20,
        debtAmount: amount,
      });

      // TODO: How to calculate those values?
      const expectedDebt = 2100500000000000000000n;
      const expectedCollateral = 100000000000000000000000000000000n;
      const expectedStake = 100000000000000000000000000000000n;

      await expect(withdrawDebtTokensTx)
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

    it("should increase user's debt token balance", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken } = this.contracts;
      const amount = ethers.parseUnits("100", 18);

      const withdrawDebtTokensTx = await this.utils.takeDebt({
        from: user,
        collateral: erc20,
        debtAmount: amount,
      });

      await expect(withdrawDebtTokensTx).to.changeTokenBalances(debtToken, [user], [amount]);
    });

    it("should increase TrenBox's debt", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const { trenBoxManager } = this.contracts;

      const collateralAddress = await erc20.getAddress();

      const [debtBefore] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const amount = ethers.parseUnits("100", 18);

      await this.utils.takeDebt({
        debtAmount: amount,
        collateral: erc20,
        from: user,
      });

      const [debtAfter] = await trenBoxManager.getEntireDebtAndColl(
        collateralAddress,
        user.address
      );

      const borrowingFee = await trenBoxManager.getBorrowingFee(collateralAddress, amount);
      const expectedDebt = debtBefore + amount + borrowingFee;

      expect(debtAfter).to.be.equal(expectedDebt);
    });

    it("should not emit Collateral Transfer event", async function () {
      const [user] = this.users;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 18);

      const withdrawDebtTokensTx = this.utils.takeDebt({
        from: user,
        collateral: erc20,
        debtAmount: amount,
      });

      await expect(withdrawDebtTokensTx).to.not.emit(erc20, "Transfer");
    });
  });

  context("when user does not have TrenBox", function () {
    it("they cannot withdraw debt tokens", async function () {
      const [, usersWithoutTrenBox] = this.users;
      const { erc20 } = this.testContracts;
      const amount = ethers.parseUnits("100", 18);

      const withdrawDebtTokensTx = this.utils.takeDebt({
        from: usersWithoutTrenBox,
        collateral: erc20,
        debtAmount: amount,
      });

      await expect(withdrawDebtTokensTx).to.be.reverted;
    });
  });
}
