import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveCriticalCollteralRatioDefault(): void {
  it("should retrieve correct CCR_DEFAULT", async function () {
    const oneHundredFiftyPercent = ethers.parseEther("1.5");

    expect(await this.contracts.adminContract.CCR_DEFAULT()).to.be.equal(oneHundredFiftyPercent);
  });
}
