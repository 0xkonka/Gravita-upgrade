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

            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const user2 = this.signers.accounts[2];
            const user3 = this.signers.accounts[3];
            const user4 = this.signers.accounts[4];

            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId);
            await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user2, 2n, prevId, nextId);
            await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user3, 3n, prevId, nextId);
            await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user4, 4n, prevId, nextId);
        });
        it("get first node", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user = this.signers.accounts[1];

            const firstNode = await sortedTrenBoxes.getFirst(wETH.address);

            expect(firstNode).to.be.equal(user);
        });

        it("get last node", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user = this.signers.accounts[4];

            const lastNode = await sortedTrenBoxes.getLast(wETH.address);

            expect(lastNode).to.be.equal(user);
        });

        it("get next node", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const user2 = this.signers.accounts[2];

            const nextNode = await sortedTrenBoxes.getNext(wETH.address, user1);

            expect(nextNode).to.be.equal(user2);
        });

        it("get prev node", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[4];
            const user2 = this.signers.accounts[3];

            const prevNode = await sortedTrenBoxes.getPrev(wETH.address, user1);

            expect(prevNode).to.be.equal(user2);
        });
    });
}
