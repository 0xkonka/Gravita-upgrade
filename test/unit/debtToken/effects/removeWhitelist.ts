import { expect } from "chai";

export default function shouldBehaveLikeCanRemoveWhitelist(): void {
  context("when called by the owner", function () {
    beforeEach(async function () {
      this.whitelistedAddress = this.signers.accounts[1].address;
      await this.contracts.debtToken.addWhitelist(this.whitelistedAddress);
    });

    it("removes address from whitelist", async function () {
      await this.contracts.debtToken.removeWhitelist(this.whitelistedAddress);

      const isWhitelisted = await this.contracts.debtToken.whitelistedContracts(
        this.whitelistedAddress
      );

      expect(isWhitelisted).to.be.false;
    });

    it("emits a Whitelisted event", async function () {
      await expect(this.contracts.debtToken.removeWhitelist(this.whitelistedAddress))
        .to.emit(this.contracts.debtToken, "WhitelistChanged")
        .withArgs(this.whitelistedAddress, false);
    });
  });

  context("when called by not owner", function () {
    it("reverts", async function () {
      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.debtToken.connect(notOwner).removeWhitelist(notOwner.address)
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "OwnableUnauthorizedAccount");
    });
  });
}
