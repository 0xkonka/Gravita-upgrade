import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseLiquidatedDebt(): void {
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
          .increaseLiquidatedDebt(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.trenBoxStorage,
        "TrenBoxStorage__NotAuthorizedContract"
      );
    });
  });
}

function shouldBehaveLikeCanIncreaseDebtCorrectly() {
  it("increases liquidated debt balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtBalanceBefore =
      await this.redeployedContracts.trenBoxStorage.getLiquidatedDebtBalance(wETH.address);
    const debtAmount = 50n;

    await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseLiquidatedDebt(wETH.address, debtAmount);

    const debtBalanceAfter = await this.redeployedContracts.trenBoxStorage.getLiquidatedDebtBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore + debtAmount);
  });

  it("should emit LiquidatedDebtBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    const increaseDebtTx = await this.redeployedContracts.trenBoxStorage
      .connect(this.trenBoxManagerImpostor)
      .increaseLiquidatedDebt(wETH.address, debtAmount);

    await expect(increaseDebtTx)
      .to.emit(this.redeployedContracts.trenBoxStorage, "LiquidatedDebtBalanceUpdated")
      .withArgs(wETH.address, debtAmount);
  });
}
