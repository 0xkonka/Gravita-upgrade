import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeIsEmpty(): void {
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
    it("check isEmpty", async function () {
      const { sortedTrenBoxes } = this.redeployedContracts;
      const { wETH } = this.collaterals.active;

      const isEmpty = await sortedTrenBoxes.isEmpty(wETH.address);

      expect(isEmpty).to.be.equal(true);
    });
  });
}
