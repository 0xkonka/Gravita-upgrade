import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseActiveDebt(): void {
  beforeEach(async function () {
    const TrenBoxStorageFactory = await ethers.getContractFactory("TrenBoxStorage");
    const trenBoxStorage = await TrenBoxStorageFactory.connect(this.signers.deployer).deploy();
    await trenBoxStorage.waitForDeployment();
    await trenBoxStorage.initialize(this.signers.deployer);

    this.redeployedContracts.trenBoxStorage = trenBoxStorage;

    this.borrowerOperationsImpostor = this.signers.accounts[1];
  });

  context("when caller is Tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.borrowerOperationsImpostor,
      });

      await this.redeployedContracts.trenBoxStorage.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context("when caller is not Tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.redeployedContracts.trenBoxStorage
          .connect(impostor)
          .increaseActiveDebt(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__BorrowerOperationsOnly"
      );
    });
  });
}

function shouldBehaveLikeCanIncreaseDebtCorrectly() {
  it("increases active debt balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtBalanceBefore = await this.redeployedContracts.trenBoxStorage.getActiveDebtBalance(
      wETH.address
    );
    const debtAmount = 50n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.borrowerOperationsImpostor)
      .increaseActiveDebt(wETH.address, debtAmount);

    const debtBalanceAfter = await this.redeployedContracts.trenBoxStorage.getActiveDebtBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore + debtAmount);
  });

  it("should emit ActiveDebtBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    const increaseDebtTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.borrowerOperationsImpostor)
      .increaseActiveDebt(wETH.address, debtAmount);

    await expect(increaseDebtTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "ActiveDebtBalanceUpdated")
      .withArgs(wETH.address, debtAmount);
  });
}
