import { expect } from "chai";

export default function shouldBehaveLikeHaveMax(): void {
  it("should retrieve correct max", async function () {
    const a = BigInt(10 ** 15);
    const b = BigInt(10 ** 16);
    const expectedMax = a >= b ? a : b;

    expect(await this.testContracts.trenMathTester.max(a, b)).to.equal(expectedMax);
  });
}
