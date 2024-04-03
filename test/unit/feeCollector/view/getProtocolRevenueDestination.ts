import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveGetProtocolRevenueDestination(): void {
  beforeEach(async function () {
    const FeeCollectorFactory = await ethers.getContractFactory("FeeCollector");
    const feeCollector = await FeeCollectorFactory.connect(this.signers.deployer).deploy();
    await feeCollector.waitForDeployment();
    await feeCollector.initialize();

    this.redeployedContracts.feeCollector = feeCollector;

    this.treasuryImposter = this.signers.accounts[1];
    this.trenStakingImposter = this.signers.accounts[2];

    await this.utils.connectRedeployedContracts({
      treasury: this.treasuryImposter,
      feeCollector: this.redeployedContracts.feeCollector,
    });
  });

  context("when fees go te treasury", function () {
    it("should return treasury as revenue destination", async function () {
      await this.redeployedContracts.feeCollector.setTRENStaking(this.trenStakingImposter);

      const actualDestination =
        await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();

      const expectedDestination = this.treasuryImposter;

      expect(actualDestination).to.be.equal(expectedDestination);
    });
  });

  context("when fees go to TREN staking", function () {
    it.skip("should return TREN staking as revenue destination", async function () {
      const revenueDestination =
        await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();

      const expectedDestination = this.trenStakingImposter;

      expect(revenueDestination).to.be.equal(expectedDestination);
    });
  });
}
