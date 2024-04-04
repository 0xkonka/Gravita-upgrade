import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { ethers } from "hardhat";

import { Timelock } from "../../../../types";

export default function shouldBehaveLikeCanQueueTransaction(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.user = this.signers.accounts[1];
  });

  context("when caller is admin", function () {
    it("should revert if eta is earlier than delay", async function () {
      const { timelock } = this.contracts;

      const { value, signature, data, target, delay } = await getTransactionData(
        timelock,
        this.admin
      );

      const twoHours = BigInt(time.duration.hours(2));
      const now = BigInt(await time.latest());
      const eta_beforeDelay = now + delay - twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .queueTransaction(target, value, signature, data, eta_beforeDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__ETAMustSatisfyDelay");
    });

    it("should revert if eta is later than grace period", async function () {
      const { timelock } = this.contracts;
      const gracePeriod = await timelock.GRACE_PERIOD();
      const twoHours = BigInt(time.duration.hours(2));

      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_twoHoursAfterGracePeriod = now + delay + gracePeriod + twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .queueTransaction(target, value, signature, data, eta_twoHoursAfterGracePeriod)
      ).to.be.revertedWithCustomError(timelock, "Timelock__ETAMustSatisfyDelay");
    });

    it("should emit QueueTransaction event", async function () {
      const { timelock } = this.contracts;
      const { value, signature, data, target, delay } = await getTransactionData(
        timelock,
        this.admin
      );

      const twoHours = BigInt(time.duration.hours(2));
      const now = BigInt(await time.latest());
      const eta_twoHoursAfterDelay = now + delay + twoHours;

      const txHash = calcTxHash(target, value, signature, data, eta_twoHoursAfterDelay);

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_twoHoursAfterDelay);

      await expect(queueTx)
        .to.emit(timelock, "QueueTransaction")
        .withArgs(txHash, target, value, signature, data, eta_twoHoursAfterDelay);
    });

    it("should revert if tx is already queued", async function () {
      const { timelock } = this.contracts;

      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );
      const twoHours = BigInt(time.duration.hours(2));

      const eta_twoHoursAfterDelay = now + delay + twoHours;

      const firstTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_twoHoursAfterDelay);
      await firstTx.wait();

      const duplicatedTx = timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_twoHoursAfterDelay);

      await expect(duplicatedTx).to.be.revertedWithCustomError(
        timelock,
        "Timelock__TxAlreadyQueued"
      );
    });
  });

  context("when caller is not admin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;

      const twoHours = BigInt(time.duration.hours(2));

      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );
      const eta_twoHoursAfterDelay = now + delay + twoHours;

      await expect(
        timelock
          .connect(this.user)
          .queueTransaction(target, value, signature, data, eta_twoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__AdminOnly");
    });
  });
}

function encodeParameters(types: string[], values: string[]) {
  const abi = new ethers.AbiCoder();
  return abi.encode(types, values);
}

function calcTxHash(
  targetAddress: AddressLike,
  value: bigint,
  signature: string,
  data: string,
  eta: bigint
) {
  return ethers.keccak256(
    encodeParameters(
      ["address", "uint256", "string", "bytes", "uint256"],
      [targetAddress.toString(), value.toString(), signature, data, eta.toString()]
    )
  );
}

async function getTransactionData(
  timelock: Timelock,
  admin: HardhatEthersSigner
): Promise<{
  value: bigint;
  signature: string;
  data: string;
  target: AddressLike;
  delay: bigint;
  now: bigint;
}> {
  const target = await timelock.getAddress();
  const delay = await timelock.delay();
  const now = BigInt(await time.latest());

  return {
    value: 0n,
    signature: "setPendingAdmin(address)",
    data: encodeParameters(["address"], [admin.address]),
    target,
    delay,
    now,
  };
}
