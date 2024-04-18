import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReInsert(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize(this.signers.deployer);

    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

    this.impostor = this.signers.accounts[1];
    this.trenBoxManagerImpostor = this.signers.accounts[2];
    this.borrowerOperationsImpostor = this.signers.accounts[3];

    this.NICR = 1n;
    this.newNICR = 2n;
  });

  context("when caller is TrenBox manager", function () {
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
        .insert(wETH.address, user1, this.NICR, prevId, nextId);

      this.impostor = this.trenBoxManagerImpostor;
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
        sortedTrenBoxes
          .connect(this.impostor)
          .reInsert(wETH.address, user1, this.newNICR, prevId, nextId)
      ).to.be.revertedWithCustomError(sortedTrenBoxes, "SortedTrenBoxer__ListDoesNotContainNode");
    });
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);

      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];
      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, user1, this.NICR, prevId, nextId);

      this.impostor = this.borrowerOperationsImpostor;
    });

    shouldBehaveLikeCanReInsertModuleCorrectly();
  });

  context("when caller is not borrower operations or TrenBox manager", function () {
    it("reverts", async function () {
      const impostor = this.signers.accounts[4];
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user1 = this.signers.accounts[1];

      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await expect(
        sortedTrenBoxes.connect(impostor).reInsert(wETH.address, user1, this.NICR, prevId, nextId)
      ).to.be.revertedWithCustomError(
        sortedTrenBoxes,
        "SortedTrenBoxes__CallerMustBeBorrowerOperationsOrTrenBoxManager"
      );
    });
  });
}

function shouldBehaveLikeCanReInsertModuleCorrectly() {
  it("reinsert module", async function () {
    const { sortedTrenBoxes } = this.redeployedContracts;
    const { wETH } = this.collaterals.active;

    const idToReinsert = this.signers.accounts[1];

    const prevId = ethers.ZeroAddress;
    const nextId = ethers.ZeroAddress;

    await sortedTrenBoxes
      .connect(this.impostor)
      .reInsert(wETH.address, idToReinsert, this.newNICR, prevId, nextId);
  });

  it("should emit NodeAdded", async function () {
    const { sortedTrenBoxes } = this.redeployedContracts;
    const { wETH } = this.collaterals.active;

    const itToReinsert = this.signers.accounts[1];

    const prevId = ethers.ZeroAddress;
    const nextId = ethers.ZeroAddress;

    const insertModuleTx = await sortedTrenBoxes
      .connect(this.impostor)
      .reInsert(wETH.address, itToReinsert, this.newNICR, prevId, nextId);

    await expect(insertModuleTx)
      .to.emit(sortedTrenBoxes, "NodeRemoved")
      .withArgs(wETH.address, itToReinsert);

    await expect(insertModuleTx)
      .to.emit(sortedTrenBoxes, "NodeAdded")
      .withArgs(wETH.address, itToReinsert, this.newNICR);
  });
}
