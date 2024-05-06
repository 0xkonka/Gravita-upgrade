import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseLiquidatedCollateral(): void {
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

    shouldBehaveLikeCanDecreaseCollCorrectly();
  });

  context("when caller is not Tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const collAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .increaseLiquidatedCollateral(wETH.address, collAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__TrenBoxManagerOnly"
      );
    });
  });
}

function shouldBehaveLikeCanDecreaseCollCorrectly() {
  it("decreases liquidated collateral balance", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;
    const collAmountToDescrease = 10n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseLiquidatedCollateral(wETH.address, collAmount);

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .decreaseLiquidatedCollateral(wETH.address, collAmountToDescrease);

    const collBalanceAfter =
      await this.redeployedContracts.trenBoxStorage.getLiquidatedCollateralBalance(wETH.address);

    expect(collBalanceAfter).to.be.equal(collAmount - collAmountToDescrease);
  });

  it("should emit LiquidatedCollateralBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;
    const collAmountToDescrease = 10n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseLiquidatedCollateral(wETH.address, collAmount);

    const decreaseCollTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .decreaseLiquidatedCollateral(wETH.address, collAmountToDescrease);

    await expect(decreaseCollTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "LiquidatedCollateralBalanceUpdated")
      .withArgs(wETH.address, collAmount - collAmountToDescrease);
  });
}
