import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeCanReceiveEth(): void {
  it("should receive eth", async function () {
    const user = this.signers.accounts[1];
    const amountToSend = ethers.WeiPerEther;
    const timelockAddress = await this.contracts.timelock.getAddress();

    const topUpTimelockWithEthTx = await user.sendTransaction({
      to: timelockAddress,
      value: amountToSend,
    });
    await topUpTimelockWithEthTx.wait();

    await expect(topUpTimelockWithEthTx).to.changeEtherBalances(
      [user, this.contracts.timelock],
      [-amountToSend, amountToSend]
    );
  });
}
