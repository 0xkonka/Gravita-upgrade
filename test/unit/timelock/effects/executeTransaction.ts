import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { ethers } from "hardhat";

import { Timelock } from "../../../../types";

export default function shouldBehaveLikeCanExecuteTransaction(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.user = this.signers.accounts[1];
  });

  context("when caller is admin", function () {
    it("should revert if tx is not queued", async function () {
      const { timelock } = this.contracts;
      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const twoHours = BigInt(time.duration.hours(2));
      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(target, value, signature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxNoQueued");
    });

    it("should revert if tx is still locked", async function () {
      const { timelock } = this.contracts;
      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const twoHours = BigInt(time.duration.hours(2));
      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(target, value, signature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxStillLocked");
    });

    it("should revert if tx is expired", async function () {
      const { timelock } = this.contracts;
      const gracePeriod = await timelock.GRACE_PERIOD();

      const { value, signature, data, target, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const twoHours = BigInt(time.duration.hours(2));
      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();

      const expiredTime = eta_TwoHoursAfterDelay + gracePeriod;
      await time.increaseTo(expiredTime);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(target, value, signature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxExpired");
    });

    it("should revert if signature is empty string", async function () {
      const { timelock } = this.contracts;
      const twoHours = BigInt(time.duration.hours(2));
      const emptySignature = "";

      const { value, data, target, delay, now } = await getTransactionData(timelock, this.admin);

      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, emptySignature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();

      await time.increaseTo(eta_TwoHoursAfterDelay);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(target, value, emptySignature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should revert if signature is invalid", async function () {
      const { timelock } = this.contracts;
      const twoHours = BigInt(time.duration.hours(2));
      const invalidSignature = "setPendingAdmin()";

      const { value, data, target, delay, now } = await getTransactionData(timelock, this.admin);

      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, invalidSignature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();
      await queueTx.wait();

      await time.increaseTo(eta_TwoHoursAfterDelay);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(target, value, invalidSignature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should emit ExecuteTransaction", async function () {
      const { timelock } = this.contracts;
      const twoHours = BigInt(time.duration.hours(2));
      const { value, data, target, signature, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_TwoHoursAfterDelay = now + delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();

      await time.increaseTo(eta_TwoHoursAfterDelay);

      const executeTx = await timelock
        .connect(this.admin)
        .executeTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);

      const txHash = calcTxHash(target, value, signature, data, eta_TwoHoursAfterDelay);

      await expect(executeTx)
        .to.emit(timelock, "ExecuteTransaction")
        .withArgs(txHash, target, value, signature, data, eta_TwoHoursAfterDelay);
    });
  });

  context("when caller is not admin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;
      const twelveHours = BigInt(time.duration.hours(2));
      const { value, data, target, signature, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_TwelveHoursAfterDelay = now + delay + twelveHours;

      await expect(
        timelock
          .connect(this.user)
          .executeTransaction(target, value, signature, data, eta_TwelveHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__OnlyAdmin");
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
