import { expect } from "chai";

export default function shouldBehaveLikeIsTrenBoxActive(): void {
  it("should return false", async function () {
    const { wETH } = this.collaterals.active;
    const borrower = this.signers.accounts[1];

    expect(await this.contracts.trenBoxManager.isTrenBoxActive(wETH.address, borrower)).to.be.equal(
      false
    );
  });
}
