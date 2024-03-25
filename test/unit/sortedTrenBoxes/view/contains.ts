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
        it("should contains", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;

            const NICR = BigInt(1);

            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const user2 = this.signers.accounts[2];

            const prevId = "0x0000000000000000000000000000000000000000";
            const nextId = "0x0000000000000000000000000000000000000000";

            await (
                await sortedTrenBoxes
                    .connect(this.impostor)
                    .insert(wETH.address, user1, NICR, prevId, nextId)
            ).wait();

            let exist = await sortedTrenBoxes.contains(wETH.address, user1);

            expect(exist).to.be.equal(true);

            await (
                await sortedTrenBoxes
                    .connect(this.impostor)
                    .insert(wETH.address, user2, NICR, prevId, nextId)
            ).wait();

            exist = await sortedTrenBoxes.contains(wETH.address, user2);

            expect(exist).to.be.equal(true);
        });
    });
}
