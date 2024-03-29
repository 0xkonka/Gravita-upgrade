import { expect } from "chai";

export default function shouldBehaveLikeOwner(): void {
  it("should retrieve correct owner", async function () {
    expect(await this.redeployedContracts.priceFeed.owner()).to.be.equal(
      this.signers.deployer.address
    );
  });
}
