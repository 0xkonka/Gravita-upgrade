import { expect } from "chai";

export default function shouldHaveFeeDenominator(): void {
  it("should retrieve correct FEE_DENOMINATOR", async function () {
    expect(await this.contracts.flashLoan.FEE_DENOMINATOR()).to.be.equal(1000n);
  });
}
