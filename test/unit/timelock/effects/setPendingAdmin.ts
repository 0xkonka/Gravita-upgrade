import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetPendingAdmin(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.pendingAdmin = this.signers.accounts[1];
  });

  context("when caller is timelock", function () {
    it("should emit NewPendingAdmin", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);

      const delay = Number(await timelock.delay());

      const target = await timelock.getAddress();
      const value = 0;
      const signature = "setPendingAdmin(address)";

      const abi = new ethers.AbiCoder();
      const encodedData = abi.encode(["address"], [this.pendingAdmin.address]);

      // 2 hrs after delay
      const eta = (await time.latest()) + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, encodedData, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      const setPendingAdminTx = await timelock
        .connect(this.admin)
        .executeTransaction(target, value, signature, encodedData, eta);

      await expect(setPendingAdminTx)
        .to.emit(timelock, "NewPendingAdmin")
        .withArgs(this.pendingAdmin.address);
    });
  });

  context("when caller is not timelock", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;

      await expect(
        timelock.connect(this.admin).setPendingAdmin(this.pendingAdmin)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TimelockOnly");
    });
  });
}
