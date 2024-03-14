import { expect } from "chai";

export default function shouldBehaveLikeHaveEmergencyStopMintingCollateral(): void {
  context("for non stopped address address", function () {
    it("should return false", async function () {
      const notStoppedAddress = this.signers.accounts[1].address;

      expect(
        await this.contracts.debtToken.emergencyStopMintingCollateral(notStoppedAddress)
      ).to.be.equal(false);
    });
  });

  context("for stopped address", function () {
    it("should return true", async function () {
      const whitelistedAddress = this.signers.accounts[1].address;

      await this.contracts.debtToken.emergencyStopMinting(whitelistedAddress, true);

      expect(
        await this.contracts.debtToken.emergencyStopMintingCollateral(whitelistedAddress)
      ).to.be.equal(true);
    });
  });
}
