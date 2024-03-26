import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanRemove(): void {
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

            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];
            const prevId = ethers.ZeroAddress;
            const nextId = ethers.ZeroAddress;

            await sortedTrenBoxes.connect(this.impostor).insert(wETH.address, user1, 1n, prevId, nextId);
        });

        it("remove module", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            await sortedTrenBoxes.connect(this.impostor).remove(wETH.address, user1);
        });

        it("should emit NodeRemoved", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            const removeModuleTx = await sortedTrenBoxes
                .connect(this.impostor)
                .remove(wETH.address, user1);

            await expect(removeModuleTx)
                .to.emit(sortedTrenBoxes, "NodeRemoved")
                .withArgs(wETH.address, user1);
        });

        it("should not remove if not contain module", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            await sortedTrenBoxes.connect(this.impostor).remove(wETH.address, user1);

            await expect(
                sortedTrenBoxes.connect(this.impostor).remove(wETH.address, user1)
            ).to.be.rejectedWith("SortedTrenBoxes: List does not contain the id");
        });
    });

    context("when caller is not tranbox manager", function () {
        it("reverts", async function () {
            const { sortedTrenBoxes } = this.redeployedContracts;
            const { wETH } = this.collaterals.active;

            const user1 = this.signers.accounts[1];

            await expect(
                sortedTrenBoxes.connect(this.impostor).remove(wETH.address, user1)
            ).to.be.revertedWith("SortedTrenBoxes: Caller is not the TrenBoxManager");
        });
    });
}
