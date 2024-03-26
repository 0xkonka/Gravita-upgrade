import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
    beforeEach(async function () {
        const SortedTrenBoxeslFactory = await ethers.getContractFactory("SortedTrenBoxes");
        const sortedTrenBoxes = await SortedTrenBoxeslFactory.connect(this.signers.deployer).deploy();
        await sortedTrenBoxes.waitForDeployment();
        await sortedTrenBoxes.initialize();

        this.impostor = this.signers.accounts[1];

        this.user = [
            this.signers.accounts[2],
            this.signers.accounts[3],
            this.signers.accounts[4],
            this.signers.accounts[5],
        ];

        const { erc20 } = this.testContracts;

        await this.utils.setupCollateralForTests({
            collateral: erc20,
            collateralOptions: {
                setAsActive: true,
                price: ethers.parseUnits("200", "ether"),
                mints: [
                    {
                        to: this.user[0].address,
                        amount: ethers.parseUnits("100", 30),
                    },
                ],
            },
        });

        const assetAddress = await erc20.getAddress();
        const assetAmount = ethers.parseUnits("100", 30);

        const mintCap = ethers.parseUnits("100", 35);
        await this.contracts.adminContract.setMintCap(assetAddress, mintCap);

        for (let i = 0; i < this.user.length; i++) {
            await erc20.mint(this.user[i], ethers.parseUnits("100", 30));
            await this.utils.openTrenBox({
                asset: assetAddress,
                assetAmount,
                from: this.user[i],
            });
        }
    });

    context("for active collateral", function () {
        it("find insert Position", async function () {
            const { sortedTrenBoxes } = this.contracts;
            const { erc20 } = this.testContracts;

            const position = await sortedTrenBoxes.findInsertPosition(
                erc20,
                2n,
                this.user[0],
                this.user[3]
            );
            expect(position[0]).to.be.equal(this.user[0]);
        });
    });
}
