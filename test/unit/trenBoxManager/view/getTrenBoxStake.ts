import { expect } from "chai";

export default function shouldBehaveLikeGetTrenBoxStake(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[2];

    expect(await this.contracts.trenBoxManager.getTrenBoxStake(wETH.address, borrower))
      .to.be.equal(0);
  });
}
