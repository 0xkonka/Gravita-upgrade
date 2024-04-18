import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseDebt(): void {
  beforeEach(async function () {
    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const defaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await defaultPool.waitForDeployment();
    await defaultPool.initialize(this.signers.deployer);

    this.redeployedContracts.defaultPool = defaultPool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanDecreaseDebtCorrectly();
  });

  context("when caller is not tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.contracts.defaultPool.connect(impostor).decreaseDebt(wETH.address, debtAmount)
      ).to.be.revertedWith("DefaultPool: Caller is not the TrenBoxManager");
    });
  });
}

function shouldBehaveLikeCanDecreaseDebtCorrectly() {
  it("decreases debt tokens balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);
    const debtBalanceBefore = await this.redeployedContracts.defaultPool.getDebtTokenBalance(
      wETH.address
    );

    const debtAmountToDecrease = 20n;

    await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .decreaseDebt(wETH.address, debtAmountToDecrease);
    const debtBalanceAfter = await this.redeployedContracts.defaultPool.getDebtTokenBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore - debtAmountToDecrease);
  });

  it("should emit DefaultPoolDebtUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);

    const debtAmountToDecrease = 20n;

    const decreaseDebtTx = await this.redeployedContracts.defaultPool
      .connect(this.impostor)
      .decreaseDebt(wETH.address, debtAmountToDecrease);

    await expect(decreaseDebtTx)
      .to.emit(this.redeployedContracts.defaultPool, "DefaultPoolDebtUpdated")
      .withArgs(wETH.address, debtAmount - debtAmountToDecrease);
  });
}
