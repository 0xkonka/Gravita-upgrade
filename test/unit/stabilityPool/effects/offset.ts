import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeOffset(): void {
    beforeEach(async function () {
        this.trenBoxManagerImpostor = this.signers.accounts[1];
        this.user = [this.signers.accounts[2], this.signers.accounts[3]];

        const StabilityPoolFactory = await ethers.getContractFactory("StabilityPool");
        const stabilityPool = await StabilityPoolFactory.connect(this.signers.deployer).deploy();
        await stabilityPool.waitForDeployment();
        await stabilityPool.initialize();

        this.redeployedContracts.stabilityPool = stabilityPool;

        await this.utils.connectRedeployedContracts({
            stabilityPool: this.redeployedContracts.stabilityPool,
            trenBoxManager: this.trenBoxManagerImpostor,
        });
    });

    context("set offset for liquidation", function () {
        context("when caller is trenbox manager", function () {
            it("offset should work", async function () {
                const { wETH } = this.collaterals.active;

                await this.redeployedContracts.stabilityPool
                    .connect(this.trenBoxManagerImpostor)
                    .offset(0, wETH.address, 0);
            });
        });

        it("when caller is not trenbox manager", async function () {
            const { erc20 } = this.testContracts;

            await expect(
                this.redeployedContracts.stabilityPool.offset(0, erc20, 0)
            ).to.be.revertedWithCustomError(
                this.redeployedContracts.stabilityPool,
                "StabilityPool__TrenBoxManagerOnly"
            );
        });
    });
}
