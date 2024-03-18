import { expect } from "chai";
import { ethers } from "hardhat";
import { ActivePool, ActivePool__factory } from ".../../../types";
import { impostorContractInArray } from "../../../shared/utils";

let activePool: ActivePool;
let contracts: any[];

export default function shouldBehaveLikeCanIncreaseDebt(): void {
  beforeEach(async function () {
    contracts = [
      this.contracts.activePool,
      this.contracts.adminContract,
      this.contracts.borrowerOperations,
      this.contracts.adminContract, // collSurplusPool
      this.contracts.debtToken,
      this.contracts.debtToken, // defaultPool
      this.contracts.debtToken, // feeCollector
      this.contracts.debtToken, // gasPool
      this.contracts.debtToken, // priceFeed
      this.contracts.debtToken, // sortedVessels
      this.contracts.debtToken, // stabilityPool
      this.contracts.lock,
      this.signers.deployer,
      this.contracts.trenBoxManager,
      this.contracts.debtToken, // trenBoxManagerOperations
    ];

    const ActivePoolFactory: ActivePool__factory = await ethers.getContractFactory("ActivePool");
    activePool = await ActivePoolFactory.connect(this.signers.deployer).deploy();
    await activePool.waitForDeployment();

    await activePool.initialize();

    this.impostor = this.signers.accounts[1];
  })

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 2);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 13);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanIncreaseDebtCorrectly();
  });

  context(
    "when caller is not borrower operations, or tren box manager",
    function () {
      it("reverts custom error", async function () {
        this.impostor = this.signers.accounts[1];
        const { wETH } = this.collaterals.active;
        const debtAmount = 50n;

        await expect(
          this.contracts.activePool
            .connect(this.impostor)
            .increaseDebt(wETH.address, debtAmount)
        ).to.be.revertedWith(
          "ActivePool: Caller is not an authorized Tren contract"
        );
      });
    }
  );
}

function shouldBehaveLikeCanIncreaseDebtCorrectly() {
  it("increases debt tokens balance", async function () {
    const { wETH } = this.collaterals.active;
    const debtBalanceBefore = await activePool.getDebtTokenBalance(wETH.address);
    const debtAmount = 50n;

    await activePool.connect(this.impostor).increaseDebt(wETH.address, debtAmount);
    const debtBalanceAfter = await activePool.getDebtTokenBalance(wETH.address);

    expect(debtBalanceAfter).to.be.equal(debtBalanceBefore + debtAmount);
  });

  it("should emit ActivePoolDebtUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const debtAmount = 50n;

    const increaseDebtTx = await activePool.connect(this.impostor).increaseDebt(wETH.address, debtAmount);

    await expect(increaseDebtTx)
      .to.emit(activePool, "ActivePoolDebtUpdated")
      .withArgs(wETH.address, debtAmount);
  });
}
