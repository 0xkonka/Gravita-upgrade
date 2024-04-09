import { expect } from "chai";

export default function shouldBehaveLikeGetAbsoluteDifference(): void {
  it("should retrieve correct absolute difference", async function () {
    const a = BigInt(10 ** 15);
    const b = BigInt(10 ** 16);
    const expectedResult = a >= b ? a - b : b - a;

    expect(await this.testContracts.trenMathTester.getAbsoluteDifference(a, b)).to.equal(
      expectedResult
    );
  });
}
