import { expect } from "chai";

export default function shouldHaveBeta(): void {
  it("should retrieve correct BETA", async function () {
    const number = 2n;

    expect(await this.contracts.trenBoxManager.BETA()).to.be.equal(number);
  });
}
