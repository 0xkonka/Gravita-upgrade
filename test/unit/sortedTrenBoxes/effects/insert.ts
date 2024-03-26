import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeInsert(): void {
    beforeEach(async function () {
        const SortedTrenBoxeslFactory = await ethers.getContractFactory("SortedTrenBoxes");
        const sortedTrenBoxes = await SortedTrenBoxeslFactory.connect(this.signers.deployer).deploy();
        await sortedTrenBoxes.waitForDeployment();
        await sortedTrenBoxes.initialize();

        this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

        this.impostor = this.signers.accounts[1];
    });

    context("when caller is trenbox manager", function () {
        beforeEach(async function () {
            const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
                trenBoxManager: this.impostor,
            });

            await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
        });

        shouldBehaveLikeCanInsertModuleCorrectly();

    });

    context("when caller is borrower operations", function () {
        beforeEach(async function () {
            const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
                borrowerOperations: this.impostor,
            });

            await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
        });

        shouldBehaveLikeCanInsertModuleCorrectly();

    });

    context("when caller is not borrower operations or tranbox manager", function () {
        it("reverts", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await expect(
                sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId)
            ).to.be.revertedWith("SortedTrenBoxes: Caller is neither BO nor TrenBoxM");
        });
    });
}

function shouldBehaveLikeCanInsertModuleCorrectly() {
    it("insert module", async function () {
        const { sortedTrenBoxes } = this.redeployedContracts;
        const { wETH } = this.collaterals.active;

        const user1 = this.signers.accounts[1];

        const prevId = ethers.ZeroAddress;
        const nextId = ethers.ZeroAddress;

        await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId);
    });

    it("should emit NodeAdded", async function () {
        const { sortedTrenBoxes } = this.redeployedContracts;
        const { wETH } = this.collaterals.active;

        const user1 = this.signers.accounts[1];

        const prevId = ethers.ZeroAddress;
        const nextId = ethers.ZeroAddress;

        const insertModuleTx = await sortedTrenBoxes
            .connect(this.impostor)
            .insert(wETH.address, user1, 1n, prevId, nextId);

        await expect(insertModuleTx)
            .to.emit(sortedTrenBoxes, "NodeAdded")
            .withArgs(wETH.address, user1, 1n);
    });
    it("couldn't insert same module", async function () {
        const { sortedTrenBoxes } = this.redeployedContracts;
        const { wETH } = this.collaterals.active;

        const user1 = this.signers.accounts[1];

        const prevId = ethers.ZeroAddress;
        const nextId = ethers.ZeroAddress;

        await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId);

        await expect(
            sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId)
        ).to.be.rejectedWith("SortedTrenBoxes: List already contains the node");
    });
}