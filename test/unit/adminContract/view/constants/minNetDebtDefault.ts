import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveMinNetDebtDefault(): void {
  it("should retrieve correct MIN_NET_DEBT_DEFAULT", async function () {
    const minNetDebt = ethers.parseEther("2000");

    expect(await this.contracts.adminContract.MIN_NET_DEBT_DEFAULT()).to.be.equal(minNetDebt);
  });
}
