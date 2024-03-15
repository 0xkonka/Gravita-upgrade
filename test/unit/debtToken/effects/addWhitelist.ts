import { expect } from "chai";

export default function shouldBehaveLikeCanAddWhitelist(): void {
  context("when called by the owner", function () {
    it("marks address as whitelisted", async function () {
      const addressToWhitelist = this.signers.accounts[1].address;

      await this.contracts.debtToken.addWhitelist(addressToWhitelist);

      const isWhitelisted = await this.contracts.debtToken.whitelistedContracts(addressToWhitelist);

      expect(isWhitelisted).to.be.true;
    });

    it("emits a Whitelisted event", async function () {
      const addressToWhitelist = this.signers.accounts[1].address;

      await expect(this.contracts.debtToken.addWhitelist(addressToWhitelist))
        .to.emit(this.contracts.debtToken, "WhitelistChanged")
        .withArgs(addressToWhitelist, true);
    });
  });

  context("when called by not owner", function () {
    it("reverts", async function () {
      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.debtToken.connect(notOwner).addWhitelist(notOwner.address)
      ).to.be.revertedWithCustomError(this.contracts.debtToken, "OwnableUnauthorizedAccount");
    });
  });
}
