import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanWithdrawFromSP(): void {
  beforeEach(async function () {
    const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    await stabilityPool.waitForDeployment();
    await stabilityPool.initialize(this.signers.deployer);

    this.users = this.signers.accounts.slice(2, 6);
    const { erc20 } = this.testContracts;
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
  });

  context("withdraw from stability pool", function () {
    context("when user has sufficient debtToken balance", function () {
      this.beforeEach(async function () {
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        await this.utils.setupProtocolForTests({
          commands: this.users.map((user: HardhatEthersSigner) => {
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

        await this.utils.setupProtocolForTests({
          commands: this.users.map((user: HardhatEthersSigner) => {
            return {
              action: "provideToStabilityPool",
              args: {
                from: user,
                assets: [assetAddress],
                amount: 100n,
              },
            };
          }),
        });
      });
      it("should withdraw from Stability Pool", async function () {
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();

        const totalDebtTokenDepositsBefore =
          await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

        await this.utils.setupProtocolForTests({
          commands: this.users.map((user: HardhatEthersSigner) => {
            return {
              action: "withdrawFromStabilityPool",
              args: {
                from: user,
                assets: [assetAddress],
                amount: 100n,
              },
            };
          }),
        });

        const totalDebtTokenDepositsAfter =
          await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

        expect(totalDebtTokenDepositsAfter).to.be.equal(totalDebtTokenDepositsBefore - 400n);
      });

      it("should emit UserDepositChanged and GainsWithdrawn", async function () {
        const { erc20 } = this.testContracts;
        const assetAddress = await erc20.getAddress();

        const withdrawFromSPTx = await this.utils.withdrawFromStabilityPool({
          from: this.users[0],
          assets: [assetAddress],
          amount: 50n,
        });

        const depositorGains = await this.contracts.stabilityPool.getDepositorGains(this.users[0], [
          assetAddress,
        ]);

        await expect(withdrawFromSPTx)
          .to.emit(this.contracts.stabilityPool, "UserDepositChanged")
          .withArgs(this.users[0], 50n);

        await expect(withdrawFromSPTx)
          .to.emit(this.contracts.stabilityPool, "GainsWithdrawn")
          .withArgs(this.users[0], depositorGains[0], depositorGains[1], 0n);
      });
    });

    it("when user has insufficient debtToken balance", async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      await expect(
        this.utils.setupProtocolForTests({
          commands: [
            {
              action: "withdrawFromStabilityPool",
              args: {
                from: this.users[0],
                assets: [assetAddress],
                amount: ethers.parseUnits("100", 18),
              },
            },
          ],
        })
      ).to.be.revertedWithCustomError(
        this.contracts.stabilityPool,
        "StabilityPool__UserHasNoDeposit"
      );
    });
  });
}
