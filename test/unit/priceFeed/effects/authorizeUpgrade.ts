import { expect } from "chai";

export default function shouldBehaveLikeCanAuthorizeUpgrade(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.notOwner = this.signers.accounts[1];
    this.newImplementation = await this.testContracts.mockAggregator.getAddress();
  });

  context("when caller is owner", function () {
    it("should upgrade to new implementation", async function () {
      await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .authorizeUpgrade(this.newImplementation);
    });
  });

  context("when caller is not an owner", function () {
    it("reverts custom error", async function () {
      const { priceFeed } = this.redeployedContracts;

      await expect(
        priceFeed.connect(this.notOwner).authorizeUpgrade(this.newImplementation)
      ).to.be.revertedWithCustomError(priceFeed, "OwnableUnauthorizedAccount");
    });
  });
}
