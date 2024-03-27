import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetTrenBoxFromTrenBoxOwnersArray(): void {
  it("should return correct number of trenBox owners", async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.borrowerOperationsImpostor = this.signers.accounts[1];

    const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
      borrowerOperations: this.borrowerOperationsImpostor,
    });

    await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);

    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[2];

    await this.redeployedContracts.trenBoxManager
      .connect(this.borrowerOperationsImpostor)
      .addTrenBoxOwnerToArray(wETH.address, borrower);

    expect(
      await this.redeployedContracts.trenBoxManager.getTrenBoxFromTrenBoxOwnersArray(
        wETH.address,
        0
      )
    ).to.be.equal(borrower);
  });
}
