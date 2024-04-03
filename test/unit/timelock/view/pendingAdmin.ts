import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeHavePendingAdmin(): void {
  it("should retrieve correct pendingAdmin", async function () {
    expect(await this.contracts.timelock.pendingAdmin()).to.be.equal(ethers.ZeroAddress);
  });
}
