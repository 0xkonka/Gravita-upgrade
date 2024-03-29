import { expect } from "chai";

export default function shouldBehaveLikeGetNominalICR(): void {
  it("should return correct NICR", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];

    expect(
      await this.contracts.trenBoxManager.getNominalICR(wETH.address, borrower)
    ).to.not.be.equal(0);
  });
}
