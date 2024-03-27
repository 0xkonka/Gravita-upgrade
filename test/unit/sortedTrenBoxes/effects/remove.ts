import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanRemove(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize();

    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

    this.trenBoxManagerImpostor = this.signers.accounts[1];
  });

  context("when caller is TrenBoxManager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.trenBoxManagerImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);

      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];
      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await sortedTrenBoxes
        .connect(this.trenBoxManagerImpostor)
        .insert(wETH.address, user1, 1n, prevId, nextId);
    });

    it("remove module", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];

      await sortedTrenBoxes.connect(this.trenBoxManagerImpostor).remove(wETH.address, user1);
    });

    it("should emit NodeRemoved", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];

      const removeModuleTx = await sortedTrenBoxes
        .connect(this.trenBoxManagerImpostor)
        .remove(wETH.address, user1);

      await expect(removeModuleTx)
        .to.emit(sortedTrenBoxes, "NodeRemoved")
        .withArgs(wETH.address, user1);
    });

    it("should not remove if not contain module", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];

      await sortedTrenBoxes.connect(this.trenBoxManagerImpostor).remove(wETH.address, user1);

      await expect(
        sortedTrenBoxes.connect(this.trenBoxManagerImpostor).remove(wETH.address, user1)
      ).to.be.rejectedWith("SortedTrenBoxes: List does not contain the id");
    });
  });

  context("when caller is not TrenBox manager", function () {
    it("reverts", async function () {
      const impostor = this.signers.accounts[4];
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];

      await expect(
        sortedTrenBoxes.connect(impostor).remove(wETH.address, user1)
      ).to.be.revertedWith("SortedTrenBoxes: Caller is not the TrenBoxManager");
    });
  });
}
