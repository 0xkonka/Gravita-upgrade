import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseActiveDebt(): void {
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

    shouldBehaveLikeCanDecreaseDebtCorrectly();
  });

  context("when caller is not Tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .decreaseActiveDebt(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__NotAuthorizedContract"
      );
    });
  });
}

function shouldBehaveLikeCanDecreaseDebtCorrectly() {
  it("decreases active debt balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;
    const debtAmountToDecrease = 20n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseActiveDebt(wETH.address, debtAmount);

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .decreaseActiveDebt(wETH.address, debtAmountToDecrease);

    const debtBalanceAfter = await this.redeployedContracts.trenBoxStorage.getActiveDebtBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtAmount - debtAmountToDecrease);
  });

  it("should emit ActiveDebtBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;
    const debtAmountToDecrease = 20n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseActiveDebt(wETH.address, debtAmount);

    const decreaseDebtTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .decreaseActiveDebt(wETH.address, debtAmountToDecrease);

    await expect(decreaseDebtTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "ActiveDebtBalanceUpdated")
      .withArgs(wETH.address, debtAmount - debtAmountToDecrease);
  });
}
