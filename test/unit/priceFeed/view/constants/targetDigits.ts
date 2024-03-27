import { expect } from "chai";

const TARGET_DIGITS = 18;
export default function shouldHaveTargetDigits(): void {
  it("should retrieve correct TARGET_DIGITS", async function () {
    expect(await this.redeployedContracts.priceFeed.TARGET_DIGITS()).to.be.equal(TARGET_DIGITS);
  });
}
