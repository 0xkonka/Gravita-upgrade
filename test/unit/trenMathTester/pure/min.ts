import { expect } from "chai";

export default function shouldBehaveLikeHaveMin(): void {
  it("should retrieve correct min", async function () {
    const a = BigInt(10 ** 15);
    const b = BigInt(10 ** 16);
    const expectedMin = a < b ? a : b;

    expect(await this.testContracts.trenMathTester.min(a, b)).to.equal(expectedMin);
  });
}
