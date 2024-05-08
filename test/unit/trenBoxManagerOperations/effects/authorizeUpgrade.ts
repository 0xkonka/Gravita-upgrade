import { expect } from "chai";

export default function shouldBehaveLikeAuthorizeUpgrade(): void {
  context("when caller is owner", function () {
    it("should execute authorizeUpgrade", async function () {
      const { wETH } = this.collaterals.active;

      await this.contracts.trenBoxManagerOperations
        .connect(this.signers.deployer)
        .authorizeUpgrade(wETH.address);
    });
  });

  context("when caller is not an owner", function () {
    it("reverts custom error OwnableUnauthorizedAccount", async function () {
      this.impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;

      await expect(
        this.contracts.trenBoxManagerOperations
          .connect(this.impostor)
          .authorizeUpgrade(wETH.address)
      ).to.be.revertedWithCustomError(this.contracts.trenBoxStorage, "OwnableUnauthorizedAccount");
    });
  });
}
