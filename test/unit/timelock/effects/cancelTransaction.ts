import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanCancelTransaction(): void {
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
          .cancelTransaction(this.target, this.value, this.signature, this.data, eta)
      ).to.be.revertedWithCustomError(timelock, "Timelock__TxNoQueued");
    });

    it("should emit CancelTransaction", async function () {
      const { timelock } = this.contracts;
      const twoHours = time.duration.hours(2);

      // 2 hrs after delay
      const eta = (await time.latest()) + this.delay + twoHours;

      const queueTx = await timelock
        .connect(this.admin)
        .queueTransaction(this.target, this.value, this.signature, this.data, eta);
      await queueTx.wait();

      await time.increaseTo(eta);

      const cancelTx = await timelock
        .connect(this.admin)
        .cancelTransaction(this.target, this.value, this.signature, this.data, eta);

      const txHash = calcTxHash(this.target, this.value, this.signature, this.data, eta);

      await expect(cancelTx)
        .to.emit(timelock, "CancelTransaction")
        .withArgs(txHash, this.target, this.value, this.signature, this.data, eta);
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
          .cancelTransaction(this.target, this.value, this.signature, this.data, eta)
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
