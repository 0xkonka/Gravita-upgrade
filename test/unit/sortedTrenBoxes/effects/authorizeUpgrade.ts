import { expect } from "chai";

export default function shouldBehaveLikeCanAuthorizeUpgrade(): void {
  context("when caller is owner", function () {
    it("should SortedTrenBox updated", async function () {
      const { wETH } = this.collaterals.active;

      await this.contracts.sortedTrenBoxes
        .connect(this.signers.deployer)
        .authorizeUpgrade(wETH.address);
    });
  });

  context("when caller is not an owner", function () {
    it("reverts custom error", async function () {
      const impostor = this.signers.accounts[1];
      const { wETH } = this.collaterals.active;

      await expect(
        this.contracts.sortedTrenBoxes.connect(impostor).authorizeUpgrade(wETH.address)
      ).to.be.revertedWithCustomError(this.contracts.sortedTrenBoxes, "OwnableUnauthorizedAccount");
    });
  });
}
