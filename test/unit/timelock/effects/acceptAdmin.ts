import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanAcceptAdmin(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.pendingAdmin = this.signers.accounts[1];

    const { timelock } = this.contracts;

    const twoHours = time.duration.hours(2);
    const delay = await timelock.delay();

    const target = await timelock.getAddress();
    const value = 0;
    const signature = "setPendingAdmin(address)";

    const abi = new ethers.AbiCoder();
    const encodedData = abi.encode(["address"], [this.pendingAdmin.address]);

    const eta = (await time.latest()) + Number(delay) + twoHours;

    const queueTx = await timelock
      .connect(this.admin)
      .queueTransaction(target, value, signature, encodedData, eta);
    await queueTx.wait();

    await time.increaseTo(eta);

    const executeTx = await timelock
      .connect(this.admin)
      .executeTransaction(target, value, signature, encodedData, eta);

    await executeTx.wait();
  });

  context("when caller is pendingAdmin", function () {
    it("should emit NewAdmin", async function () {
      const { timelock } = this.contracts;

      const acceptAdminTx = await timelock.connect(this.pendingAdmin).acceptAdmin();

      await expect(acceptAdminTx).to.emit(timelock, "NewAdmin").withArgs(this.pendingAdmin.address);
    });
  });

  context("when caller is not pendingAdmin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;

      await expect(timelock.connect(this.admin).acceptAdmin()).to.be.revertedWithCustomError(
        timelock,
        "Timelock__OnlyPendingAdmin"
      );
    });
  });
}
