import { expect } from "chai";

export default function shouldHaveValidCollateral(): void {
  it("should retrieve collaterals", async function () {
    const { wETH } = this.collaterals.active;

    const expectedLength =
      Object.keys(this.collaterals.active).length + Object.keys(this.collaterals.inactive).length;

    const validCollaterals = await this.contracts.adminContract.getValidCollateral();

    expect(validCollaterals).to.have.lengthOf(expectedLength);
    expect(validCollaterals[0]).to.be.equal(wETH.address);
  });
}
