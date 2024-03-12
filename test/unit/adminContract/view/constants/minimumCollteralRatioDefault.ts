import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveMinimumCollteralRatioDefault(): void {
  it("should retrieve correct MCR_DEFAULT", async function () {
    const oneHundredTenPercent = ethers.parseEther("1.1");

    expect(await this.contracts.adminContract.MCR_DEFAULT()).to.be.equal(oneHundredTenPercent);
  });
}
