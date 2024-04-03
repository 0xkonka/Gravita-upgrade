import { expect } from "chai";

export default function shouldHaveMaximumDelay(): void {
  it("should retrieve correct MAXIMUM_DELAY", async function () {
    const MAXIMUM_DELAY = 15 * 24 * 3600;
    expect(await this.contracts.timelock.MAXIMUM_DELAY()).to.be.equal(MAXIMUM_DELAY);
  });
}
