import { expect } from "chai";

export default function shouldBehaveLikeHaveTrenBoxManagerAddress(): void {
  it("should retrieve correct trenBoxManagerAddress", async function () {
    expect(await this.contracts.debtToken.trenBoxManagerAddress()).to.be.equal(
      await this.contracts.trenBoxManager.getAddress()
    );
  });
}
