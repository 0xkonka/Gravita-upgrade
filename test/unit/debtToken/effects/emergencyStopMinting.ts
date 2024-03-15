import { expect } from "chai";

export default function shouldBehaveLikeHaveCanEmergencyStopMinting(): void {
  context("for non stopped address address", function () {
    it("should set it to true", async function () {
      const whitelistedAddress = this.signers.accounts[1].address;

      await this.contracts.debtToken.emergencyStopMinting(whitelistedAddress, true);

      expect(
        await this.contracts.debtToken.emergencyStopMintingCollateral(whitelistedAddress)
      ).to.be.equal(true);
    });
  });

  context("for stopped address", function () {
    beforeEach(async function () {
      const whitelistedAddress = this.signers.accounts[1].address;

      await this.contracts.debtToken.emergencyStopMinting(whitelistedAddress, true);
    });

    it("should set it to false", async function () {
      const whitelistedAddress = this.signers.accounts[1].address;

      await this.contracts.debtToken.emergencyStopMinting(whitelistedAddress, false);

      expect(
        await this.contracts.debtToken.emergencyStopMintingCollateral(whitelistedAddress)
      ).to.be.equal(false);
    });
  });
}
