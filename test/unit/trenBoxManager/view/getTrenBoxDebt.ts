import { expect } from "chai";

export default function shouldBehaveLikeGetTrenBoxDebt(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[2];

    expect(await this.contracts.trenBoxManager.getTrenBoxDebt(wETH.address, borrower)).to.be.equal(
      0
    );
  });
}
