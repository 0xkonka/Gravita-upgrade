import { expect } from "chai";

const DEBT_TOKEN_DECIMALS = 18;

export default function shouldBehaveLikeDecimals(): void {
  it("should retrieve correct decimals", async function () {
    expect(await this.contracts.debtToken.decimals()).to.be.equal(DEBT_TOKEN_DECIMALS);
  });
}
