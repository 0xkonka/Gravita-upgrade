import { expect } from "chai";

export default function shouldBehaveLikeGetTCR(): void {
  it("should return not zero", async function () {
    const { wETH } = this.collaterals.active;
    const price = 10n;

    expect(await this.contracts.trenBoxManager.getTCR(wETH.address, price)).to.not.be.equal(0);
  });
}
