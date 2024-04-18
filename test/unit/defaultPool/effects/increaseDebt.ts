import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanIncreaseDebt(): void {
  beforeEach(async function () {
    const DefaultPoolFactory = await ethers.getContractFactory("DefaultPool");
    const defaultPool = await DefaultPoolFactory.connect(this.signers.deployer).deploy();
    await defaultPool.waitForDeployment();
    await defaultPool.initialize(this.signers.deployer);

    this.redeployedContracts.defaultPool = defaultPool;

    this.trenBoxManagerImpostor = this.signers.accounts[1];
  });

  context("when caller is Tren box manager", function () {
    beforeEach(async function () {
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        trenBoxManager: this.trenBoxManagerImpostor,
      });

      await this.redeployedContracts.defaultPool.setAddresses(addressesForSetAddresses);
    });

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context("when caller is not Tren box manager", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;
      const debtAmount = 50n;

      await expect(
        this.redeployedContracts.defaultPool
          .connect(impostor)
          .increaseDebt(wETH.address, debtAmount)
      ).to.be.revertedWith("DefaultPool: Caller is not the TrenBoxManager");
    });
  });
}

function shouldBehaveLikeCanIncreaseDebtCorrectly() {
  it("increases debt tokens balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtBalanceBefore = await this.redeployedContracts.defaultPool.getDebtTokenBalance(
      wETH.address
    );
    const debtAmount = 50n;

    await this.redeployedContracts.defaultPool
      .connect(this.trenBoxManagerImpostor)
      .increaseDebt(wETH.address, debtAmount);

    const debtBalanceAfter = await this.redeployedContracts.defaultPool.getDebtTokenBalance(
      wETH.address
    );

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore + debtAmount);
  });

  it("should emit DefaultPoolDebtUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    const increaseDebtTx = await this.redeployedContracts.defaultPool
      .connect(this.trenBoxManagerImpostor)
      .increaseDebt(wETH.address, debtAmount);

    await expect(increaseDebtTx)
      .to.emit(this.redeployedContracts.defaultPool, "DefaultPoolDebtUpdated")
      .withArgs(wETH.address, debtAmount);
  });
}
