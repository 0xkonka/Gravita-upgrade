import { expect } from "chai";

export default function shouldBehaveLikeHaveDelay(): void {
  it("should retrieve correct delay", async function () {
    const delay = 2 * 24 * 3600; // 2 days
    expect(await this.contracts.timelock.delay()).to.be.equal(delay);
  });
}
