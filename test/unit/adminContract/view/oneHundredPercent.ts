import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveHunderdPercent(): void {
  it("should retrieve correct _100pct", async function () {
    const oneEtherIs100percent = ethers.WeiPerEther;

    expect(await this.contracts.adminContract._100pct()).to.be.equal(oneEtherIs100percent);
  });
}
