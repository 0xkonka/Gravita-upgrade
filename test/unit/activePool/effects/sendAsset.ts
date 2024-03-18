import { expect } from "chai";
import { ethers } from "hardhat";
import { ActivePool, ActivePool__factory, TRENToken, TRENToken__factory } from ".../../../types";
import { impostorContractInArray } from "../../../shared/utils";

let activePool: ActivePool;
let erc20token: TRENToken;
let contracts: any[];

export default function shouldBehaveLikeCanSendAsset(): void {
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

    const ERC20Token: TRENToken__factory = await ethers.getContractFactory("TRENToken");
    erc20token = await ERC20Token.connect(this.signers.deployer).deploy(this.signers.deployer);
    await erc20token.waitForDeployment();

    await erc20token.transfer(activePool, 5n);
    await erc20token.approve(this.impostor, 2n);
  });

  context("when caller is borrower operations", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 2);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 2, 13);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is tren box manager operations", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 2, 14);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context("when caller is stability pool", function () {
    beforeEach(async function () {
      contracts = impostorContractInArray(contracts, this.impostor, 2, 10);

      await activePool.setAddresses(contracts);
    });

    shouldBehaveLikeCanSendAssetCorrectly();
  });

  context(
    "when caller is not borrower operations, nor tren box manager, nor stability pool, nor tren box manager operations",
    function () {
      it("reverts", async function () {
        const { wETH } = this.collaterals.active;
        const assetAmount = 2n;
        const recepient = this.signers.accounts[2];

        await expect(
          this.contracts.activePool
          .connect(this.impostor)
          .sendAsset(wETH.address, recepient, assetAmount)
        ).to.be.revertedWith(
          "ActivePool: Caller is not an authorized Tren contract"
        );
      });
    }
  );
}

function shouldBehaveLikeCanSendAssetCorrectly() {
  it("sends asset amount", async function () {
    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recepient = this.signers.accounts[2];
    const balanceBefore = await erc20token.balanceOf(recepient.address);
    const activePoolBalanceBefore = await erc20token.balanceOf(activePool);

    await activePool.connect(this.impostor).sendAsset(erc20token, recepient, assetAmount);
    const balanceAfter = await erc20token.balanceOf(recepient.address);
    const activePoolBalanceAfter = await erc20token.balanceOf(activePool);

    expect(balanceAfter).to.be.equal(balanceBefore + assetAmount);
    expect(activePoolBalanceAfter).to.be.equal(activePoolBalanceBefore - assetAmount);
  });

  it("should emit ActivePoolAssetBalanceUpdated", async function () {
    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recepient = this.signers.accounts[2];

    const sendAssetTx = await activePool.connect(this.impostor).sendAsset(erc20token, recepient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "ActivePoolAssetBalanceUpdated")
      .withArgs(erc20token, 3n);
  });

  it("should emit AssetSent", async function () {
    await activePool.connect(this.impostor).receivedERC20(erc20token, 5n);

    const assetAmount = 2n;
    const recepient = this.signers.accounts[2];

    const sendAssetTx = await activePool.connect(this.impostor).sendAsset(erc20token, recepient, assetAmount);
    await expect(sendAssetTx)
      .to.emit(activePool, "AssetSent")
      .withArgs(recepient, erc20token, assetAmount);
  });
}
