import { expect } from "chai";

const TREN_DEBT_TOKEN_SYMBOL = "trenUSD";

export default function shouldBehaveLikeSymbol(): void {
  it("should retrieve correct SYMBOL", async function () {
    expect(await this.contracts.debtToken.SYMBOL()).to.be.equal(TREN_DEBT_TOKEN_SYMBOL);
  });
}
