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
    });

    it("should contain module", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user = this.signers.accounts[1];

      const prevId = ethers.ZeroAddress;
      const nextId = ethers.ZeroAddress;

      await this.redeployedContracts.sortedTrenBoxes
        .connect(this.borrowerOperationsImpostor)
        .insert(wETH.address, user, 1n, prevId, nextId);

      const exist = await sortedTrenBoxes.contains(wETH.address, user);

      expect(exist).to.be.equal(true);
    });

    it("should not contain module", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const user = this.signers.accounts[1];

      const exist = await sortedTrenBoxes.contains(wETH.address, user);

      expect(exist).to.be.equal(false);
    });
  });
}
