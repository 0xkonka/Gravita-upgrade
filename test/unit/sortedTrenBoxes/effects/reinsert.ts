import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReInsert(): void {
    beforeEach(async function () {
        const SortedTrenBoxeslFactory = await ethers.getContractFactory("SortedTrenBoxes");
        const sortedTrenBoxes = await SortedTrenBoxeslFactory.connect(this.signers.deployer).deploy();
        await sortedTrenBoxes.waitForDeployment();
        await sortedTrenBoxes.initialize();

        this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

        this.impostor = this.signers.accounts[1];

        this.NICR = 1n;
        this.newNICR = 2n;
    });

    context("when caller is trenbox manager", function () {
        beforeEach(async function () {
            const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
                trenBoxManager: this.impostor,
            });

            await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);

            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await sortedTrenBoxes
                .connect(this.impostor)
                .insert(wETH.address, user1, this.NICR, prevId, nextId);
        });

        shouldBehaveLikeCanReInsertModuleCorrectly();

        it("should reverted if not contain module", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await sortedTrenBoxes.connect(this.impostor).remove(wETH.address, user1);

            await expect(
                sortedTrenBoxes.connect(this.impostor).reInsert(wETH.address, user1, this.newNICR, prevId, nextId)
            ).to.be.rejectedWith("SortedTrenBoxes: List does not contain the id");
        });
    });

    context("when caller is borrower operations", function () {
        beforeEach(async function () {
            const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
                borrowerOperations: this.impostor,
            });

            await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);

            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await sortedTrenBoxes
                .connect(this.impostor)
                .insert(wETH.address, user1, this.NICR, prevId, nextId);
        });

        shouldBehaveLikeCanReInsertModuleCorrectly();
    });

    context("when caller is not borrower operations or tranbox manager", function () {
        it("reverts", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await expect(
                sortedTrenBoxes
                    .connect(this.impostor)
                    .reInsert(wETH.address, user1, this.NICR, prevId, nextId)
            ).to.be.revertedWith("SortedTrenBoxes: Caller is neither BO nor TrenBoxM");
        });
    });
}

function shouldBehaveLikeCanReInsertModuleCorrectly() {
    it("reinsert module", async function () {
        const { sortedTrenBoxes } = this.redeployedContracts;
        const { wETH } = this.collaterals.active;

        const user1 = this.signers.accounts[1];

        const prevId = ethers.ZeroAddress;
        const nextId = ethers.ZeroAddress;

        await sortedTrenBoxes
            .connect(this.impostor)
            .reInsert(wETH.address, user1, this.newNICR, prevId, nextId);
    });

    it("should emit NodeAdded", async function () {
        const { sortedTrenBoxes } = this.redeployedContracts;
        const { wETH } = this.collaterals.active;

        const user1 = this.signers.accounts[1];

        const prevId = ethers.ZeroAddress;
        const nextId = ethers.ZeroAddress;

        const insertModuleTx = await sortedTrenBoxes
            .connect(this.impostor)
            .reInsert(wETH.address, user1, this.newNICR, prevId, nextId);

        await expect(insertModuleTx)
            .to.emit(sortedTrenBoxes, "NodeRemoved")
            .withArgs(wETH.address, user1);

        await expect(insertModuleTx)
            .to.emit(sortedTrenBoxes, "NodeAdded")
            .withArgs(wETH.address, user1, this.newNICR);
    });
}
