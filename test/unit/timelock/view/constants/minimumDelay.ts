import { expect } from "chai";

export default function shouldHaveMinimumDelay(): void {
  it("should retrieve correct MINIMUM_DELAY", async function () {
    const TWO_DAYS_MINIMUM_DELAY = 2 * 24 * 3600;
    expect(await this.contracts.timelock.MINIMUM_DELAY()).to.be.equal(TWO_DAYS_MINIMUM_DELAY);
  });
}
