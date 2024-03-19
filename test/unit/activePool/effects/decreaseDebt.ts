import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanDecreaseDebt(): void {
  beforeEach(async function () {
    const ActivePoolFactory = await ethers.getContractFactory("ActivePool");
    const activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();
    await activePool.initialize();

    this.redeployedContracts.activePool = activePool;

    this.impostor = this.signers.accounts[1];
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        borrowerOperations: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanDecreaseDebtCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanDecreaseDebtCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        stabilityPool: this.impostor,
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanDecreaseDebtCorrectly();
  });

  context(
    "when caller is not borrower operations, or tren box manager, or stability pool",
    function () {
      it("reverts custom error", async function () {
        this.impostor = this.signers.accounts[1];
        const { wETH } = this.collaterals.active;
        const debtAmount = 50n;

        await expect(
          this.contracts.activePool.connect(this.impostor).decreaseDebt(wETH.address, debtAmount)
        ).to.be.revertedWith("ActivePool: Caller is not an authorized Tren contract");
      });
    }
  );
}

function shouldBehaveLikeCanDecreaseDebtCorrectly() {
  it("decreases debt tokens balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    await this.redeployedContracts.activePool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);
    const debtBalanceBefore = await this.redeployedContracts.activePool.getDebtTokenBalance(
      wETH.address
    );

    const debtAmountToDecrease = 20n;

    await this.redeployedContracts.activePool
      .connect(this.impostor)
      .decreaseDebt(wETH.address, debtAmountToDecrease);
    const debtBalanceAfter = await this.redeployedContracts.activePool.getDebtTokenBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore - debtAmountToDecrease);
  });

  it("should emit ActivePoolDebtUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    await this.redeployedContracts.activePool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);

    const debtAmountToDecrease = 20n;

    const decreaseDebtTx = await this.redeployedContracts.activePool
      .connect(this.impostor)
      .decreaseDebt(wETH.address, debtAmountToDecrease);

    await expect(decreaseDebtTx)
      .to.emit(this.redeployedContracts.activePool, "ActivePoolDebtUpdated")
      .withArgs(wETH.address, debtAmount - debtAmountToDecrease);
  });
}
