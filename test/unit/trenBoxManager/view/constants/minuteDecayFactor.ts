import { expect } from "chai";

export default function shouldHaveMinuteDecayFactor(): void {
  it("should retrieve correct MINUTE_DECAY_FACTOR", async function () {
    const number = 999037758833783000n;

    expect(await this.contracts.trenBoxManager.MINUTE_DECAY_FACTOR()).to.be.equal(number);
  });
}
