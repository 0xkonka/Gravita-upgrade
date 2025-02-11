import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseClaimableCollateral(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is TrenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanIncreaseCollateralCorrectly();
  });

  context("when caller is not TrenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const collAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .increaseClaimableCollateral(wETH.address, collAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__TrenBoxManagerOperationsOnly"
      );
    });
  });
}

function shouldBehaveLikeCanIncreaseCollateralCorrectly() {
  it("increases active collateral balance", async function () {
    const { wETH } = this.collaterals.active;
    const collBalanceBefore =
      await this.redeployedContracts.trenBoxStorage.getClaimableCollateralBalance(wETH.address);
    const collAmount = 50n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .increaseClaimableCollateral(wETH.address, collAmount);

    const collBalanceAfter =
      await this.redeployedContracts.trenBoxStorage.getClaimableCollateralBalance(wETH.address);

    expect(collBalanceAfter).to.be.equal(collBalanceBefore + collAmount);
  });

  it("should emit ClaimableCollateralBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;

    const increaseCollTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .increaseClaimableCollateral(wETH.address, collAmount);

    await expect(increaseCollTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "ClaimableCollateralBalanceUpdated")
      .withArgs(wETH.address, collAmount);
  });
}
