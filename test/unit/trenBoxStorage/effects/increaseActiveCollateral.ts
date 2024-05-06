import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseActiveCollateral(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.trenBoxManagerImpostor = this.signers.accounts[1];
  });

  context("when caller is Tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.trenBoxManagerImpostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanIncreaseCollateralCorrectly();
  });

  context("when caller is not Tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const collAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .increaseActiveCollateral(wETH.address, collAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__BorrowerOperationsOrTrenBoxManagerOnly"
      );
    });
  });
}

function shouldBehaveLikeCanIncreaseCollateralCorrectly() {
  it("increases active collateral balance", async function () {
    const { wETH } = this.collaterals.active;
    const collBalanceBefore =
      await this.redeployedContracts.trenBoxStorage.getActiveCollateralBalance(wETH.address);
    const collAmount = 50n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseActiveCollateral(wETH.address, collAmount);

    const collBalanceAfter =
      await this.redeployedContracts.trenBoxStorage.getActiveCollateralBalance(wETH.address);

    expect(collBalanceAfter).to.be.equal(collBalanceBefore + collAmount);
  });

  it("should emit ActiveCollateralBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;

    const increaseCollTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseActiveCollateral(wETH.address, collAmount);

    await expect(increaseCollTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "ActiveCollateralBalanceUpdated")
      .withArgs(wETH.address, collAmount);
  });
}
