import { expect } from "chai";
import { ethers } from "hardhat";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanCloseTrenBox() {
  beforeEach(async function () {
    const users = [this.signers.accounts[0], this.signers.accounts[1], this.signers.accounts[2]];

    this.upperHint = DEFAULT_UPPER_HINT;
    this.lowerHint = DEFAULT_LOWER_HINT;

    const { erc20, erc20_with_6_decimals } = this.testContracts;
    const asset = await erc20.getAddress();
    const asset_with_6_decimals = await erc20_with_6_decimals.getAddress();

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
            asset: asset,
            assetAmount: ethers.parseUnits("100", 30),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
          },
        },
        {
          action: "openTrenBox",
          args: {
            from: users[2],
            asset: asset,
            assetAmount: ethers.parseUnits("100", 30),
            upperHint: this.upperHint,
            lowerHint: this.lowerHint,
            extraDebtTokenAmount: ethers.parseUnits("100000", 18),
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

    const { debtToken, feeCollector } = this.contracts;
    await debtToken.addWhitelist(await feeCollector.getAddress());
  });
  context("when user has TrenBox", function () {
    context("when collateral is 18 decimal", function () {
      it("they can close TrenBox", async function () {
        const [user, , debtTokenDonor] = this.users;

        const { erc20 } = this.testContracts;
        const { debtToken } = this.contracts;

        await debtToken
          .connect(debtTokenDonor)
          .transfer(user.address, await debtToken.balanceOf(debtTokenDonor.address));

        const closeTrenBoxTx = this.utils.closeTrenBox({
          from: user,
          asset: erc20,
        });

        await expect(closeTrenBoxTx).to.not.be.reverted;
      });
    });
    context("when collateral has less than 18 decimals", function () {
      it("they can close TrenBox", async function () {
        const [user, , debtTokenDonor] = this.users;

        const { erc20_with_6_decimals } = this.testContracts;
        const { debtToken } = this.contracts;

        await debtToken
          .connect(debtTokenDonor)
          .transfer(user.address, await debtToken.balanceOf(debtTokenDonor.address));

        const closeTrenBoxTx = this.utils.closeTrenBox({
          from: user,
          asset: erc20_with_6_decimals,
        });

        await expect(closeTrenBoxTx).to.not.be.reverted;
      });

      it("should increase user collateral balance", async function () {
        const [user] = this.users;
        const { erc20_with_6_decimals } = this.testContracts;
        const decimal = await erc20_with_6_decimals.decimals();
        const assetAmount = ethers.parseUnits("5000", 18);

        const assetBalanceBefore = await erc20_with_6_decimals.balanceOf(user.address);

        const closeTrenBoxTx = this.utils.closeTrenBox({
          from: user,
          asset: erc20_with_6_decimals,
        });

        await (await closeTrenBoxTx).wait();

        const assetBalanceAfter = await erc20_with_6_decimals.balanceOf(user.address);
        const expectedAssetBalance =
          assetBalanceBefore + assetAmount / BigInt(10 ** (18 - Number(decimal)));

        expect(assetBalanceAfter).to.equal(expectedAssetBalance);
      });

      it("should decrease TrenBox collateral amount", async function () {
        const [user] = this.users;
        const { erc20_with_6_decimals } = this.testContracts;
        const asset = await erc20_with_6_decimals.getAddress();

        const assetAmount = ethers.parseUnits("5000", 18);

        const { trenBoxManager } = this.contracts;
        const trenBoxCollBefore = await trenBoxManager.getTrenBoxColl(asset, user.address);

        const closeTrenBoxTx = this.utils.closeTrenBox({
          from: user,
          asset: erc20_with_6_decimals,
        });

        await (await closeTrenBoxTx).wait();

        const trenBoxCollAfter = await trenBoxManager.getTrenBoxColl(asset, user.address);
        const expectedDebtBalance = trenBoxCollBefore - assetAmount;

        expect(trenBoxCollAfter).to.equal(expectedDebtBalance);
      });

      it("should decrease TrenBox debt amount", async function () {
        const [user] = this.users;
        const { erc20_with_6_decimals } = this.testContracts;
        const asset = await erc20_with_6_decimals.getAddress();

        const minDebt = await this.contracts.adminContract.getMinNetDebt(erc20_with_6_decimals);

        const { trenBoxManager } = this.contracts;
        const debtBalanceBefore = await trenBoxManager.getTrenBoxDebt(asset, user.address);

        const closeTrenBoxTx = this.utils.closeTrenBox({
          from: user,
          asset: erc20_with_6_decimals,
        });

        await (await closeTrenBoxTx).wait();

        const debtBalanceAfter = await trenBoxManager.getTrenBoxDebt(asset, user.address);
        const expectedDebtBalance = debtBalanceBefore - minDebt;

        expect(debtBalanceAfter).to.equal(expectedDebtBalance);
      });
    });
  });

  context("when user does not have TrenBox", function () {
    it("they cannot close TrenBox", async function () {
      const [, usersWithoutTrenBox, debtTokenDonor] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken, borrowerOperations } = this.contracts;

      await debtToken
        .connect(debtTokenDonor)
        .transfer(usersWithoutTrenBox.address, await debtToken.balanceOf(debtTokenDonor.address));

      const closeTrenBoxTx = this.utils.closeTrenBox({
        from: usersWithoutTrenBox,
        asset: erc20,
      });

      await expect(closeTrenBoxTx).to.be.revertedWithCustomError(
        borrowerOperations,
        "BorrowerOperations__TrenBoxNotExistOrClosed"
      );
    });
  });
}
