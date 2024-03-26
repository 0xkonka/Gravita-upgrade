import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanUpdateBaseRateFromRedemption(): void {
  beforeEach(async function () {
    const TrenBoxManagerFactory = await ethers.getContractFactory("TrenBoxManager");
    const trenBoxManager = await TrenBoxManagerFactory.connect(this.signers.deployer).deploy();
    await trenBoxManager.waitForDeployment();
    await trenBoxManager.initialize();

    this.redeployedContracts.trenBoxManager = trenBoxManager;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.impostor,
      });

      await this.redeployedContracts.trenBoxManager.setAddresses(addressesForSetAddresses);
    });

    it("executes updateBaseRateFromRedemption and returns not zero", async function () {
      const { wETH } = this.collaterals.active;
      const assetDrawn = 5n;
      const price = 12500n;
      const totalDebtTokenSupply = 10000n;

      const res = await this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .updateBaseRateFromRedemption(wETH.address, assetDrawn, price, totalDebtTokenSupply);

      expect(res).to.not.be.equal(0);
    });
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const assetDrawn = 5n;
      const price = 125n;
      const totalDebtTokenSupply = 10000n;

      await expect(
        this.redeployedContracts.trenBoxManager
        .connect(this.impostor)
        .updateBaseRateFromRedemption(wETH.address, assetDrawn, price, totalDebtTokenSupply)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxManager, "TrenBoxManager__OnlyTrenBoxManagerOperations");
    });
  });
}
