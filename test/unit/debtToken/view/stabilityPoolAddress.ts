import { expect } from "chai";

export default function shouldBehaveLikeHaveStabilityPoolAddress(): void {
  it("should retrieve correct stabilityPoolAddress", async function () {
    expect(await this.contracts.debtToken.stabilityPoolAddress()).to.be.equal(
      await this.contracts.stabilityPool.getAddress()
    );
  });
}
