import { expect } from "chai";
import { ethers } from "hardhat";
import { ActivePool, ActivePool__factory } from ".../../../types";
import { impostorContractInArray } from "../../../shared/utils";

let activePool: ActivePool;
let contracts: any[];

export default function shouldBehaveLikeCanReceivedERC20(): void {
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

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context("when caller is default pool", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 5);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanReceivedERC20Correctly();
  });

  context(
    "when caller is not borrower operations, or default pool",
    function () {
      it("reverts custom error", async function () {
        this.impostor = this.signers.accounts[1];
        const { wETH } = this.collaterals.active;
        const debtAmount = 50n;

        await expect(
          this.contracts.activePool
            .connect(this.impostor)
            .receivedERC20(wETH.address, debtAmount)
        ).to.be.revertedWith(
          "ActivePool: Caller is not an authorized Tren contract"
        );
      });
    }
  );
}

function shouldBehaveLikeCanReceivedERC20Correctly() {
  it("receives asset token and increase balance", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 50n;

    const assetBalanceBefore = await activePool.getAssetBalance(wETH.address);

    await activePool.connect(this.impostor).receivedERC20(wETH.address, assetAmount);
    const assetBalanceAfter = await activePool.getAssetBalance(wETH.address);

    expect(assetBalanceAfter).to.be.equal(assetBalanceBefore + assetAmount);
  });

  it("should emit ActivePoolAssetBalanceUpdated", async function () {
    const { wETH } = this.collaterals.active;
    const assetAmount = 20n;

    const balanceBefore = await activePool.connect(this.impostor).getAssetBalance(wETH.address);

    const decreaseDebtTx = await activePool.connect(this.impostor).receivedERC20(wETH.address, assetAmount);

    await expect(decreaseDebtTx)
      .to.emit(activePool, "ActivePoolAssetBalanceUpdated")
      .withArgs(wETH.address, balanceBefore + assetAmount);
  });
}
