import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { parseUnits } from "ethers";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanProvideToSP(): void {
  beforeEach(async function () {
    // const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
    // const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
    // await stabilityPool.waitForDeployment();
    // await stabilityPool.initialize();

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

  context("provide to stability pool", function () {
    context("when user has sufficient debtToken balance", function () {
      it("should provide to Stability Pool", async function () {
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

        const totalDebtTokenDepositsBefore =
          await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

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

        const depositorTrenGain = await this.contracts.stabilityPool.getDepositorTRENGain(
          this.users[0]
        );
        expect(depositorTrenGain).to.be.equal(0);

        const totalDebtTokenDepositsAfter =
          await this.contracts.stabilityPool.getTotalDebtTokenDeposits();

        expect(totalDebtTokenDepositsAfter).to.be.equal(
          totalDebtTokenDepositsBefore + BigInt(this.users.length) * 100n
        );

        await this.utils.setupProtocolForTests({
          commands: this.users.map((user: HardhatEthersSigner) => {
            return {
              action: "provideToStabilityPool",
              args: {
                from: user,
                assets: [assetAddress],
                amount: 200n,
              },
            };
          }),
        });
      });

      it("should emit StabilityPoolDebtTokenBalanceUpdated and UserDepositChanged", async function () {
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

        const provideToSPTx = await this.utils.provideToStabilityPool({
          from: this.users[0],
          assets: [assetAddress],
          amount: 100n,
        });

        await expect(provideToSPTx)
          .to.emit(this.contracts.stabilityPool, "StabilityPoolDebtTokenBalanceUpdated")
          .withArgs(100n);

        await expect(provideToSPTx)
          .to.emit(this.contracts.stabilityPool, "UserDepositChanged")
          .withArgs(this.users[0], 100n);
      });
    });

    it("should revert in case providing zero debt amount", async function () {
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

      await expect(
        this.utils.provideToStabilityPool({
          from: this.users[0],
          assets: [assetAddress],
          amount: 0n,
        })
      ).to.be.revertedWithCustomError(
        this.contracts.stabilityPool,
        "StabilityPool__AmountMustBeNonZero"
      );
    });

    it("when user has insufficient debtToken balance", async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      await expect(
        this.utils.setupProtocolForTests({
          commands: [
            {
              action: "provideToStabilityPool",
              args: {
                from: this.users[0],
                assets: [assetAddress],
                amount: ethers.parseUnits("100", 18),
              },
            },
          ],
        })
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
    });
  });

  context("provide to stability pool", function () {
    it("when user has sufficient debtToken balance", async function () {
      const { erc20 } = this.testContracts;
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

      await this.utils.setupProtocolForTests({
        commands: this.users.map((user: HardhatEthersSigner) => {
          return {
            action: "provideToStabilityPool",
            args: {
              from: user,
              assets: [erc20],
              amount: ethers.parseUnits("100", 18),
              overrideStabilityPool: this.redeployedContracts.stabilityPool,
            },
          };
        }),
      });
    });

    it("when user has insufficient debtToken balance", async function () {
      const { erc20 } = this.testContracts;
      const assetAddress = await erc20.getAddress();
      await expect(
        this.utils.setupProtocolForTests({
          commands: [
            {
              action: "provideToStabilityPool",
              args: {
                from: this.users[0],
                assets: [assetAddress],
                amount: ethers.parseUnits("100", 18),
              },
            },
          ],
        })
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "ERC20InsufficientBalance");
    });
  });
}
