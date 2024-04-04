import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanQueueTransaction(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.user = this.signers.accounts[1];

    this.delay = Number(await this.contracts.timelock.delay());

    // Timelock contract
    this.target = await this.contracts.timelock.getAddress();
    this.value = 0;
    this.signature = "setPendingAdmin(address)";
    this.data = encodeParameters(["address"], [this.user.address]);
  });

  context("when caller is admin", function () {
    it("should revert if eta is earlier than delay", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);

      // 2 hrs before delay
      const eta = (await time.latest()) + this.delay - twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .queueTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__ETAMustSatisfyDelay");
    });

    it("should revert if eta is later than grace period", async function () {
      const { timelock } = this.contracts;
      const gracePeriod = Number(await timelock.GRACE_PERIOD());
      const twoHours = time.duration.hours(2);

      // 2 hrs after grace period
      const eta = (await time.latest()) + this.delay + gracePeriod + twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .queueTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__ETAMustSatisfyDelay");
    });

    it("should emit QueueTransaction event", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const txHash = calcTxHash(this.target, this.value, this.signature, this.data, eta);

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);

      await expect(queueTx)
        .to.emit(timelock, "QueueTransaction")
        .withArgs(txHash, this.target, this.value, this.signature, this.data, eta);
    });

    it("should revert if tx is already queued", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const firstTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);
      await firstTx.wait();

      // duplicate Tx
      await expect(
        timelock
          .connect(this.admin)
          .queueTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxAlreadyQueued");
    });
  });

  context("when caller is not admin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      await expect(
        timelock
          .connect(this.user)
          .queueTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__AdminOnly");
    });
  });
}

function encodeParameters(types: string[], values: string[]) {
  const abi = new ethers.AbiCoder();
  return abi.encode(types, values);
}

function calcTxHash(
  targetAddress: string,
  value: number,
  signature: string,
  data: string,
  eta: number
) {
  return ethers.keccak256(
    encodeParameters(
      ["address", "uint256", "string", "bytes", "uint256"],
      [targetAddress, value.toString(), signature, data, eta.toString()]
    )
  );
}
