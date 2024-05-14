import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseActiveCollateral(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
    this.trenBoxManagerOperationsImpostor = this.signers.accounts[7];
  });

  context("when caller is Tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
        trenBoxManagerOperations: this.trenBoxManagerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanDecreaseCollateralCorrectly();
  });

  context("when caller is not BorrowerOperations", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .decreaseActiveCollateral(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__TrenBoxManagerOperationsOnly"
      );
    });
  });
}

function shouldBehaveLikeCanDecreaseCollateralCorrectly() {
  it("decreases active collateral balance", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;
    const collAmountToDecrease = 22n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.borrowerOperationsImpostor)
      .increaseActiveCollateral(wETH.address, collAmount);

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .decreaseActiveCollateral(wETH.address, collAmountToDecrease);

    const collBalance = await this.redeployedContracts.trenBoxStorage.getActiveCollateralBalance(
      wETH.address
    );

    expect(collBalance).to.be.equal(collAmount - collAmountToDecrease);
  });

  it("should emit ActiveCollateralBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const collAmount = 50n;
    const collAmountToDecrease = 22n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.borrowerOperationsImpostor)
      .increaseActiveCollateral(wETH.address, collAmount);

    const decreaseCollTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerOperationsImpostor)
      .decreaseActiveCollateral(wETH.address, collAmountToDecrease);

    await expect(decreaseCollTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "ActiveCollateralBalanceUpdated")
      .withArgs(wETH.address, collAmount - collAmountToDecrease);
  });
}
