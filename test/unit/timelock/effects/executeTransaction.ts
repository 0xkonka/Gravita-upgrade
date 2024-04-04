import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanExecuteTransaction(): void {
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
    it("should revert if tx is not queued", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxNoQueued");
    });

    it("should revert if tx is still locked", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);
      await queueTx.wait();

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxStillLocked");
    });

    it("should revert if tx is expired", async function () {
      const { timelock } = this.contracts;
      const gracePeriod = Number(await timelock.GRACE_PERIOD());

      const twoHours = time.duration.hours(2);

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);
      await queueTx.wait();

      const expiredTime = eta + gracePeriod;
      await time.increaseTo(expiredTime);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxExpired");
    });

    it("should revert if signature is empty string", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      const emptySignature = "";

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, emptySignature, this.data, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, emptySignature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should revert if signature is invalid", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      const invalidSignature = "setPendingAdmin()";

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, invalidSignature, this.data, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      await expect(
        timelock
          .connect(this.admin)
          .executeTransaction(this.target, this.value, invalidSignature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxReverted");
    });

    it("should emit ExecuteTransaction", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      const executeTx = await timelock
        .connect(this.admin)
        .executeTransaction(this.target, this.value, this.signature, this.data, eta);

      const txHash = calcTxHash(this.target, this.value, this.signature, this.data, eta);

      await expect(executeTx)
        .to.emit(timelock, "ExecuteTransaction")
        .withArgs(txHash, this.target, this.value, this.signature, this.data, eta);
    });
  });

  context("when caller is not admin", function () {
    it("should revert", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);
      // 12 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      await expect(
        timelock
          .connect(this.user)
          .executeTransaction(this.target, this.value, this.signature, this.data, eta)
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
