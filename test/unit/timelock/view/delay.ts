import { expect } from "chai";

export default function shouldBehaveLikeHaveDelay(): void {
  it("should retrieve correct delay", async function () {
    const two_days_delay = 2 * 24 * 3600;
    expect(await this.contracts.timelock.delay()).to.be.equal(two_days_delay);
  });
}
