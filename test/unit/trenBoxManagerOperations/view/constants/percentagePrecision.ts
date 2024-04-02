import { expect } from "chai";

export default function shouldBehaveLikePercentagePrecision(): void {
  it("should retrieve correct PERCENTAGE_PRECISION", async function () {
    expect(await this.contracts.trenBoxManagerOperations.PERCENTAGE_PRECISION()).to.be.equal(
      10000n
    );
  });
}
