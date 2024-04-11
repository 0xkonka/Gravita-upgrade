import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseDebt(): void {
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

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.impostor,
      });

      await this.redeployedContracts.activePool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context("when caller is not borrower operations, or tren box manager", function () {
    it("reverts custom error", async function () {
      this.impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.contracts.activePool.connect(this.impostor).increaseDebt(wETH.address, debtAmount)
      ).to.be.revertedWithCustomError(
        this.contracts.activePool,
        "ActivePool__NotAuthorizedContract"
      );
    });
  });
}

function shouldBehaveLikeCanIncreaseDebtCorrectly() {
  it("increases debt tokens balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtBalanceBefore = await this.redeployedContracts.activePool.getDebtTokenBalance(
      wETH.address
    );
    const debtAmount = 50n;

    await this.redeployedContracts.activePool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);
    const debtBalanceAfter = await this.redeployedContracts.activePool.getDebtTokenBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore + debtAmount);
  });

  it("should emit ActivePoolDebtUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    const increaseDebtTx = await this.redeployedContracts.activePool
      .connect(this.impostor)
      .increaseDebt(wETH.address, debtAmount);

    await expect(increaseDebtTx)
      .to.emit(this.redeployedContracts.activePool, "ActivePoolDebtUpdated")
      .withArgs(wETH.address, debtAmount);
  });
}
