import { expect } from "chai";

export default function shouldHaveGracePeriod(): void {
  it("should retrieve correct GRACE_PERIOD", async function () {
    const GRACE_PERIOD = 14 * 24 * 3600;
    expect(await this.contracts.timelock.GRACE_PERIOD()).to.be.equal(GRACE_PERIOD);
  });
}
