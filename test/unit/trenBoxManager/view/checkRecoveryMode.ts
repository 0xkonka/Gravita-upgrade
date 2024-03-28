import { expect } from "chai";

export default function shouldBehaveLikeCheckRecoveryMode(): void {
  it("should return false", async function () {
    const { wETH } = this.collaterals.active;
    const price = 100n;

    expect(await this.contracts.trenBoxManager.checkRecoveryMode(wETH.address, price)).to.be.equal(
      false
    );
  });
}
