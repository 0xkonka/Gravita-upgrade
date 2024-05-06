import { expect } from "chai";

export default function shouldBehaveLikeGetUserClaimableCollateralBalance(): void {
  context("for active collateral", function () {
    it("should return ZERO", async function () {
      const { wETH } = this.collaterals.active;

      const assetBalance = await this.contracts.trenBoxStorage.getUserClaimableCollateralBalance(
        this.signers.accounts[1].address,
        wETH.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });

  context("for inactive collateral", function () {
    it("should return ZERO", async function () {
      const { dai } = this.collaterals.inactive;

      const assetBalance = await this.contracts.trenBoxStorage.getUserClaimableCollateralBalance(
        this.signers.accounts[1].address,
        dai.address
      );

      expect(assetBalance).to.be.equal(0n);
    });
  });
}
