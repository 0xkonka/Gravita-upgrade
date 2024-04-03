import { expect } from "chai";

export default function shouldHaveMinFeeDays(): void {
  it("should retrieve correct MIN_FEE_DAYS", async function () {
    const minFeeDays = 7n;

    expect(await this.contracts.feeCollector.MIN_FEE_DAYS()).to.be.equal(minFeeDays);
  });
}
