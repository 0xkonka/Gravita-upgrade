import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanUpdateUserClaimableBalance(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.trenBoxManagerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is trenBoxManagerOperations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanUpdateUserClaimableBalanceCorrectly();
  });

  context("when caller is not trenBoxManagerOperations", function () {
    it("reverts custom error", async function () {
      const { wETH } = this.collaterals.active;
      const amount = 50n;
      const user = this.signers.accounts[1];

      await expect(
        this.contracts.trenBoxStorage
          .connect(this.signers.accounts[8])
          .updateUserClaimableBalance(wETH.address, user, amount)
      ).to.be.revertedWithCustomError(
        this.contracts.trenBoxStorage,
        "TrenBoxStorage__TrenBoxManagerOperationsOnly"
      );
    });
  });
}

function shouldBehaveLikeCanUpdateUserClaimableBalanceCorrectly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;
    const user = this.signers.accounts[1];

    const assetBalanceBefore =
      await this.redeployedContracts.trenBoxStorage.getUserClaimableCollateralBalance(
        wETH.address,
        user
      );

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .updateUserClaimableBalance(wETH.address, user, assetAmount);
    const assetBalanceAfter =
      await this.redeployedContracts.trenBoxStorage.getUserClaimableCollateralBalance(
        wETH.address,
        user
      );

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });

  it("should emit ClaimableCollateralBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;
    const user = this.signers.accounts[1];

    const userAssetBalanceBefore =
      await this.redeployedContracts.trenBoxStorage.getUserClaimableCollateralBalance(
        wETH.address,
        user.address
      );

    const accountSurplusTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .updateUserClaimableBalance(wETH.address, user, assetAmount);

    const userAssetBalanceAfter =
      await this.redeployedContracts.trenBoxStorage.getUserClaimableCollateralBalance(
        wETH.address,
        user.address
      );

    expect(assetAmount).to.be.equal(userAssetBalanceAfter - userAssetBalanceBefore);

    await expect(accountSurplusTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "UserClaimableCollateralBalanceUpdated")
      .withArgs(user, wETH.address, assetAmount);
  });
}
