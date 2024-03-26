import { expect } from "chai";

export default function shouldBehaveLikeGetTrenBoxOwnersCount(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;

    expect(await this.contracts.trenBoxManager.getTrenBoxOwnersCount(wETH.address))
      .to.be.equal(0);
  });
}
