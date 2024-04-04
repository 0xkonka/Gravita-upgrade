import { expect } from "chai";

export default function shouldBehaveLikeHaveAdmin(): void {
  it("should retrieve correct admin", async function () {
    const admin = this.signers.deployer;
    expect(await this.contracts.timelock.admin()).to.be.equal(admin.address);
  });
}
