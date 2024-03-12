import { expect } from "chai";

export default function shouldHavePercentDivisorDefault(): void {
  it("should retrieve correct PERCENT_DIVISOR_DEFAULT", async function () {
    const twoHundretYields = 200n;

    expect(await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT()).to.be.equal(
      twoHundretYields
    );
  });
}
