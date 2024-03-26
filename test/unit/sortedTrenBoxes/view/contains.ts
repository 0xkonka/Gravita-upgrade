import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
    beforeEach(async function () {
        const SortedTrenBoxeslFactory = await ethers.getContractFactory("SortedTrenBoxes");
        const sortedTrenBoxes = await SortedTrenBoxeslFactory.connect(this.signers.deployer).deploy();
        await sortedTrenBoxes.waitForDeployment();
        await sortedTrenBoxes.initialize();

        this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

        this.impostor = this.signers.accounts[1];
    });

    context("for active collateral", function () {
        beforeEach(async function () {
            const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
                borrowerOperations: this.impostor,
            });

            await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
        });
        it("should contain module", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await this.redeployedContracts.sortedTrenBoxes
                .connect(this.impostor)
                .insert(wETH.address, user1, 1n, prevId, nextId);

            const exist = await sortedTrenBoxes.contains(wETH.address, user1);

            expect(exist).to.be.equal(true);
        });

        it("should not contain module", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const exist = await sortedTrenBoxes.contains(wETH.address, user1);

            expect(exist).to.be.equal(false);
        });
    });
}
