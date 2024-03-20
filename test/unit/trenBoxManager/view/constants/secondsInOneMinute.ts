import { expect } from "chai";

export default function shouldHaveSecondsInOneMinute(): void {
  it("should retrieve correct SECONDS_IN_ONE_MINUTE", async function () {
    expect(await this.contracts.trenBoxManager.SECONDS_IN_ONE_MINUTE()).to.be.equal(60n);
  });
}
