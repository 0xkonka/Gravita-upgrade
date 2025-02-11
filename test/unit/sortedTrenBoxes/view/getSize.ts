import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeContains(): void {
  beforeEach(async function () {
    const SortedTrenBoxesFactory = await ethers.getContractFactory("SortedTrenBoxes");
    const sortedTrenBoxes = await SortedTrenBoxesFactory.connect(this.signers.deployer).deploy();
    await sortedTrenBoxes.waitForDeployment();
    await sortedTrenBoxes.initialize(this.signers.deployer);

    this.redeployedContracts.sortedTrenBoxes = sortedTrenBoxes;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("for active collateral", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.sortedTrenBoxes.setAddresses(addressesForSetAddresses);
    });
    it("size should be 0", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const size = await sortedTrenBoxes.getSize(wETH.address);

      expect(size).to.be.equal(0);
    });

    it("size should be 1", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const userId = this.signers.accounts[1];
      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await this.redeployedContracts.sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, userId, 1n, prevId, nextId);

      const size = await sortedTrenBoxes.getSize(wETH.address);

      expect(size).to.be.equal(1);
    });
  });
}
