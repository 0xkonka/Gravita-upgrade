import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanSetDelay(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
  });

  context("when caller is timelock", function () {
    beforeEach(async function () {
      const { timelock } = this.contracts;
      this.delay = await timelock.delay();
      this.target = await timelock.getAddress();
      this.value = 0;
      this.signature = "setDelay(uint256)";
    });

    it("should revert if new delay does not exceed MINIMUM_DELAY", async function () {
      const { timelock } = this.contracts;
      const oneDay = time.duration.days(1);

      const newDelay = oneDay;

      const abi = new ethers.AbiCoder();
      const encodedData = abi.encode(["uint256"], [newDelay]);

      // 1 day after delay
      const eta = (await time.latest()) + Number(this.delay) + oneDay;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, encodedData, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, this.signature, encodedData, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should revert if new delay exceeds MAXIMUM_DELAY", async function () {
      const { timelock } = this.contracts;
      const oneDay = time.duration.days(1);
      const oneMonth = time.duration.days(30);

      const newDelay = oneMonth;

      const abi = new ethers.AbiCoder();
      const encodedData = abi.encode(["uint256"], [newDelay]);

      // 1 day after delay
      const eta = (await time.latest()) + Number(this.delay) + oneDay;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, encodedData, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, this.signature, encodedData, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should emit NewDelay", async function () {
      const { timelock } = this.contracts;
      const oneWeek = time.duration.days(7);

      const newDelay = oneWeek;

      const abi = new ethers.AbiCoder();
      const encodedData = abi.encode(["uint256"], [newDelay]);

      // 1 day after delay
      const eta = (await time.latest()) + Number(this.delay) + oneWeek;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, encodedData, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      const setDelayTx = await timelock
        .connect(this.admin)
        .executeTransaction(this.target, this.value, this.signature, encodedData, eta);

      await expect(setDelayTx).to.emit(timelock, "NewDelay").withArgs(newDelay);
    });
  });

  context("when caller is not timelock", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;
      const newDelay = time.duration.days(5);

      await expect(timelock.connect(this.admin).setDelay(newDelay)).to.be.revertedWithCustomError(
        timelock,
        "Timelock__TimelockOnly"
      );
    });
  });
}
