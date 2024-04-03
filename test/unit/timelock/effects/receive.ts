import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceiveEth(): void {
  it("should receive eth", async function () {
    const user = this.signers.accounts[1];
    const amountToSend = ethers.WeiPerEther;
    const timelockAddress = await this.contracts.timelock.getAddress();

    const ethBalanceBefore = await ethers.provider.getBalance(timelockAddress);

    // send 1 eth to the Timelock contract
    await user.sendTransaction({
      to: timelockAddress,
      value: amountToSend,
    });

    const ethBalanceAfter = await ethers.provider.getBalance(timelockAddress);

    expect(ethBalanceAfter).to.equal(ethBalanceBefore + amountToSend);
  });
}
