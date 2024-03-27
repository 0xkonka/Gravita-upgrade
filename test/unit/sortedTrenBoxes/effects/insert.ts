import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeInsert(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize();

    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

    this.impostor = this.signers.accounts[1];
    this.trenBoxManagerImpostor = this.signers.accounts[2];
    this.borrowerOperationsImpostor = this.signers.accounts[3];
  });

  context("when caller is TrenBox manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.trenBoxManagerImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
      this.impostor = this.trenBoxManagerImpostor;
    });

    shouldBehaveLikeCanInsertModuleCorrectly();
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
      this.impostor = this.borrowerOperationsImpostor;
    });

    shouldBehaveLikeCanInsertModuleCorrectly();
  });

  context("when caller is not borrower operations or TrenBoxManager", function () {
    it("reverts", async function () {
      const impostor = this.signers.accounts[1];
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const anyUser = this.signers.accounts[1];

      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await expect(
        sortedTrenBoxes.connect(impostor).insert(wETH.address, anyUser, 1n, prevId, nextId)
      ).to.be.revertedWith("SortedTrenBoxes: Caller is neither BO nor TrenBoxM");
    });
  });
}

function shouldBehaveLikeCanInsertModuleCorrectly() {
  it("insert module", async function () {
    const { sortedTrenBoxes } = this.redeployedContracts;
    const { wETH } = this.collaterals.active;

    const idToInsert = this.signers.accounts[1];

    const prevId = ethers.ZeroAddress;
    const nextId = ethers.ZeroAddress;

    await sortedTrenBoxes
      .connect(this.impostor)
      .insert(wETH.address, idToInsert, 1n, prevId, nextId);
  });

  it("should emit NodeAdded", async function () {
    const { sortedTrenBoxes } = this.redeployedContracts;
    const { wETH } = this.collaterals.active;

    const idToInsert = this.signers.accounts[1];

    const prevId = ethers.ZeroAddress;
    const nextId = ethers.ZeroAddress;

    const insertModuleTx = await sortedTrenBoxes
      .connect(this.impostor)
      .insert(wETH.address, idToInsert, 1n, prevId, nextId);

    await expect(insertModuleTx)
      .to.emit(sortedTrenBoxes, "NodeAdded")
      .withArgs(wETH.address, idToInsert, 1n);
  });
  it("couldn't insert same module", async function () {
    const { sortedTrenBoxes } = this.redeployedContracts;
    const { wETH } = this.collaterals.active;

    const idToInsert = this.signers.accounts[1];

    const prevId = ethers.ZeroAddress;
    const nextId = ethers.ZeroAddress;

    await sortedTrenBoxes
      .connect(this.impostor)
      .insert(wETH.address, idToInsert, 1n, prevId, nextId);

    await expect(
      sortedTrenBoxes.connect(this.impostor).insert(wETH.address, idToInsert, 1n, prevId, nextId)
    ).to.be.rejectedWith("SortedTrenBoxes: List already contains the node");
  });
}
