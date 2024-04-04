import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { AddressLike } from "ethers";
import { ethers } from "hardhat";

import { Timelock } from "../../../../types";

const TWO_HOURS = BigInt(time.duration.hours(2));

export default function shouldBehaveLikeCanCancelTransaction(): void {
  beforeEach(async function () {
    this.admin = this.signers.deployer;
    this.user = this.signers.accounts[1];
  });

  context("when caller is admin", function () {
    it("should revert if tx is not queued", async function () {
      const { timelock } = this.contracts;

      const { value, data, target, signature, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_TwoHoursAfterDelay = now + delay + TWO_HOURS;

      await expect(
        timelock
          .connect(this.admin)
          .cancelTransaction(target, value, signature, data, eta_TwoHoursAfterDelay)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxNoQueued");
    });

    it("should emit CancelTransaction", async function () {
      const { timelock } = this.contracts;
      const { value, data, target, signature, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_TwoHoursAfterDelay = now + delay + TWO_HOURS;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);
      await queueTx.wait();

      await time.increaseTo(eta_TwoHoursAfterDelay);

      const cancelTx = await timelock
        .connect(this.admin)
        .cancelTransaction(target, value, signature, data, eta_TwoHoursAfterDelay);

      const txHash = calcTxHash(target, value, signature, data, eta_TwoHoursAfterDelay);

      await expect(cancelTx)
        .to.emit(timelock, "CancelTransaction")
        .withArgs(txHash, target, value, signature, data, eta_TwoHoursAfterDelay);
    });
  });

  context("when caller is not admin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;
      const { value, data, target, signature, delay, now } = await getTransactionData(
        timelock,
        this.admin
      );

      const eta_TwoHoursAfterDelay = now + delay + TWO_HOURS;

      await expect(
        timelock
          .connect(this.user)
          .cancelTransaction(target, value, signature, data, eta_TwoHoursAfterDelay)
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
