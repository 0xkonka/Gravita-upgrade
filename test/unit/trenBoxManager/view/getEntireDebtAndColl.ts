import { expect } from "chai";

export default function shouldBehaveLikeGetEntireDebtAndColl(): void {
  it("should return zero for each element", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];
    const result = await this.contracts.trenBoxManager.getEntireDebtAndColl(wETH.address, borrower);

    expect(result).to.have.lengthOf(4);
    expect(result[0]).to.be.equal(0);
    expect(result[1]).to.be.equal(0);
    expect(result[2]).to.be.equal(0);
    expect(result[3]).to.be.equal(0);
  });
}
