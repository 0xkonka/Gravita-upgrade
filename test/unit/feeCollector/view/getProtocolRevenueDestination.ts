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

    const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
      treasury: this.treasuryImposter
    });

    await this.redeployedContracts.feeCollector.setAddresses(addressesForSetAddresses);
    await this.redeployedContracts.feeCollector.setTRENStaking(this.trenStakingImposter);
  });

  it("should return correct revenue destination", async function () {
    const routeToTRENStaking = await this.redeployedContracts.feeCollector.routeToTRENStaking();
    const actualDestination = await this.redeployedContracts.feeCollector.getProtocolRevenueDestination();
    const expectedDestination = routeToTRENStaking ? this.trenStakingImposter: this.treasuryImposter;

    expect(actualDestination).to.be.equal(expectedDestination);
  });
}
