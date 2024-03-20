import { expect } from "chai";

export default function shouldHaveName(): void {
  it("should retrieve correct NAME", async function () {
    expect(await this.contracts.defaultPool.NAME()).to.be.equal("DefaultPool");
  });
}
