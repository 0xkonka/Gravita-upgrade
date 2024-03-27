import { expect } from "chai";

export default function shouldBehaveLikeCanAuthorizeUpgrade(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.notOwner = this.signers.accounts[1];
    this.newImplementation = await this.testContracts.mockAggregator.getAddress();
  });

  context("when caller is owner", function () {
    it("should upgrade to new implementation", async function () {
      await this.contracts.feeCollector
        .connect(this.owner)
        .authorizeUpgrade(this.newImplementation);
    });
  });

  context("when caller is not an owner", function () {
    it("reverts custom error", async function () {
      await expect(
        this.contracts.feeCollector.connect(this.notOwner).authorizeUpgrade(this.newImplementation)
      ).to.be.revertedWithCustomError(this.contracts.feeCollector, "OwnableUnauthorizedAccount");
    });
  });
}
