import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeHavePendingAdmin(): void {
  context("when pendingAdmin is not set", function () {
    it("should retrieve correct pendingAdmin", async function () {
      const no_pending_admin = ethers.ZeroAddress;
      expect(await this.contracts.timelock.pendingAdmin()).to.be.equal(no_pending_admin);
    });
  });
}
