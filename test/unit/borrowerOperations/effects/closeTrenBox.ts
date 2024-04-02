import { expect } from "chai";
import { ethers } from "hardhat";

const DEFAULT_LOWER_HINT = ethers.ZeroAddress;
const DEFAULT_UPPER_HINT = ethers.ZeroAddress;

export default function shouldBehaveLikeCanCloseTrenBox() {
  beforeEach(async function () {
    const users = [this.signers.accounts[0], this.signers.accounts[1], this.signers.accounts[2]];

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

    await this.utils.setUsers(users);

    const { debtToken, feeCollector } = this.contracts;
    await debtToken.addWhitelist(await feeCollector.getAddress());
  });

  context("when user has TrenBox", function () {
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

  context("when user does not have TrenBox", function () {
    it("they cannot close TrenBox", async function () {
      const [, usersWithoutTrenBox, debtTokenDonor] = this.users;
      const { erc20 } = this.testContracts;
      const { debtToken } = this.contracts;

      await debtToken
        .connect(debtTokenDonor)
        .transfer(usersWithoutTrenBox.address, await debtToken.balanceOf(debtTokenDonor.address));

      const closeTrenBoxTx = this.utils.closeTrenBox({
        from: usersWithoutTrenBox,
        asset: erc20,
      });

      await expect(closeTrenBoxTx).to.be.revertedWith(
        "BorrowerOps: TrenBox does not exist or is closed"
      );
    });
  });
}
