import { expect } from "chai";

const DEBT_TOKEN_NAME = "TREN Debt Token";

export default function shouldBehaveLikeNamed(): void {
  it("should retrieve correct NAME", async function () {
    expect(await this.contracts.debtToken.NAME()).to.be.equal(DEBT_TOKEN_NAME);
  });
}
