import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanHandleRedemptionFee(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.trenBoxManagerImpostor = this.signers.accounts[2];

    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.owner).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize(this.signers.deployer);

    this.redeployedContracts.feeCollector = feeCollector;

    await this.utils.connectRedeployedContracts({
      trenBoxManager: this.trenBoxManagerImpostor,
      feeCollector: this.redeployedContracts.feeCollector,
    });

    this.revenueDestination =
      await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();
  });

  context("when caller is tren box manager", function () {
    it("should emit RedemptionFeeCollected event", async function () {
      const { wETH } = this.collaterals.active;
      const amount = ethers.WeiPerEther;

      const redemptionFeeCollectedTx = await this.redeployedContracts.feeCollector
        .connect(this.trenBoxManagerImpostor)
        .handleRedemptionFee(wETH.address, amount);

      await expect(redemptionFeeCollectedTx)
        .to.emit(this.redeployedContracts.feeCollector, "RedemptionFeeCollected")
        .withArgs(wETH.address, amount);
    });
  });

  context("when caller is not tren box manager", function () {
    it("should revert", async function () {
      const { wETH } = this.collaterals.active;
      const amount = ethers.WeiPerEther;

      await expect(this.redeployedContracts.feeCollector.handleRedemptionFee(wETH.address, amount))
        .to.be.revertedWithCustomError(
          this.redeployedContracts.feeCollector,
          "FeeCollector__TrenBoxManagerOnly"
        )
        .withArgs(this.owner, this.trenBoxManagerImpostor);
    });
  });
}
