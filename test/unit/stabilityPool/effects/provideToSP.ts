import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanProvideToSP(): void {
    beforeEach(async function () {
        const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
        const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
        await stabilityPool.waitForDeployment();
        await stabilityPool.initialize();

        this.redeployedContracts.stabilityPool = stabilityPool;

        this.activePoolImpostor = this.signers.accounts[1];
        this.borrowerOperationsImpostor = this.signers.accounts[2];

        // await this.utils.connectRedeployedContracts({
        //     // adminContract: this.redeployedContracts.adminContract,
        //     stabilityPool: this.redeployedContracts.stabilityPool,
        //     // borrowerOperations: this.borrowerOperationsImpostor,
        //     // activePool: this.activePoolImpostor,
        // });

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
        it("when user has sufficient debtToken balance", async function () {
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
                            amount: ethers.parseUnits("100", 18),
                        },
                    };
                }),
            });
        });

        it("when pool has insufficient balance", async function () {
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
