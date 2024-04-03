import { expect } from "chai";

export default function shouldBehaveLikeOwner(): void {
  it("should retrieve correct owner", async function () {
    const owner = this.signers.deployer;

    expect(await this.contracts.feeCollector.owner()).to.be.equal(owner.address);
  });
}
