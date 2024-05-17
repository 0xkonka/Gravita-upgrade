import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetDepositorGains(): void {
  beforeEach(async function () {
    const { erc20 } = this.testContracts;

    this.users = this.signers.accounts.slice(2, 6);
    const mintCap = ethers.parseUnits("100", 35);

    await this.utils.setupProtocolForTests({
      collaterals: [
        {
          collateral: erc20,
          collateralOptions: {
            setAsActive: true,
            price: ethers.parseUnits("200", "ether"),
            mintCap,
            mints: this.users.map((user) => {
              return {
                to: user.address,
                amount: ethers.parseUnits("100", 30),
              };
            }),
          },
        },
      ],
    });

    const assetAmount = ethers.parseUnits("100", 30);

    await this.utils.setupProtocolForTests({
      commands: this.users.map((user: HardhatEthersSigner) => {
        return {
          action: "openTrenBox",
          args: {
            asset: erc20,
            assetAmount,
            from: user,
          },
        };
      }),
    });
  });

  context("when assets list has no repetitive addresses", function () {
    it("should return depositor gains", async function () {
      const { wETH } = this.collaterals.active;
      const { erc20, erc20_with_6_decimals } = this.testContracts;

      const user = this.signers.accounts[2];

      await this.contracts.stabilityPool.connect(user).provideToSP(150n, [erc20]);

      const depositorGains = await this.contracts.stabilityPool.getDepositorGains(user, [
        wETH.address,
        erc20,
        erc20_with_6_decimals,
      ]);

      expect(depositorGains).to.deep.equal([
        [wETH.address, await erc20.getAddress(), await erc20_with_6_decimals.getAddress()],
        [0n, 0n, 0n],
      ]);
    });
  });

  context("when assets list has repetitive addresses", function () {
    it("should revert StabilityPool__ArrayNotInAscendingOrder", async function () {
      const { wETH } = this.collaterals.active;
      const { erc20, erc20_with_6_decimals } = this.testContracts;

      const user = this.signers.accounts[2];

      await this.contracts.stabilityPool.connect(user).provideToSP(150n, [erc20]);

      const firstDepositorGainsTx = this.contracts.stabilityPool.getDepositorGains(user, [
        wETH.address,
        erc20,
        erc20_with_6_decimals,
        erc20,
      ]);

      await expect(firstDepositorGainsTx).to.be.revertedWithCustomError(
        this.contracts.stabilityPool,
        "StabilityPool__ArrayNotInAscendingOrder"
      );

      const secondDepositorGainsTx = this.contracts.stabilityPool.getDepositorGains(user, [
        wETH.address,
        erc20,
        erc20_with_6_decimals,
        wETH.address,
      ]);

      await expect(secondDepositorGainsTx).to.be.revertedWithCustomError(
        this.contracts.stabilityPool,
        "StabilityPool__ArrayNotInAscendingOrder"
      );
    });
  });
}
