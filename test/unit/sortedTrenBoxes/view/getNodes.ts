import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize();

    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("for active collateral", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);

      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const users = this.signers.accounts.slice(1, 5);

      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, users[0], 1n, prevId, nextId);
      await sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, users[1], 2n, prevId, nextId);
      await sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, users[2], 3n, prevId, nextId);
      await sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, users[3], 4n, prevId, nextId);

      await this.utils.setUsers(users);
    });

    it("get first node", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const firstUser = this.users[0];

      const firstNode = await sortedTrenBoxes.getFirst(wETH.address);

      expect(firstNode).to.be.equal(firstUser);
    });

    it("get last node", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const lastUsers = this.users.at(-1);

      const lastNode = await sortedTrenBoxes.getLast(wETH.address);

      expect(lastNode).to.be.equal(lastUsers);
    });

    it("get next node", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const currentUser = this.users[0];
      const nextUsers = this.users[1];

      const nextNode = await sortedTrenBoxes.getNext(wETH.address, currentUser);

      expect(nextNode).to.be.equal(nextUsers);
    });

    it("get prev node", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const currentUser = this.users[this.users.length - 1];
      const previousUser = this.users.at(-2);

      const prevNode = await sortedTrenBoxes.getPrev(wETH.address, currentUser);

      expect(prevNode).to.be.equal(previousUser);
    });
  });
}
