import { expect } from "chai";

export default function shouldBehaveLikeHaveWhitelistedContracts(): void {
  context("for non-whitelisted address", function () {
    it("should return false", async function () {
      const nonWhitelistedAddress = this.signers.accounts[1].address;

      expect(
        await this.contracts.debtToken.whitelistedContracts(nonWhitelistedAddress)
      ).to.be.equal(false);
    });
  });

  context("for whitelisted address", function () {
    it("should return true", async function () {
      const whitelistedAddress = this.signers.accounts[1].address;

      await this.contracts.debtToken.addWhitelist(whitelistedAddress);

      expect(await this.contracts.debtToken.whitelistedContracts(whitelistedAddress)).to.be.equal(
        true
      );
    });
  });
}
