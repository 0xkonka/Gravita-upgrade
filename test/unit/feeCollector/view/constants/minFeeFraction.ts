import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveMinFeeFraction(): void {
  it("should retrieve correct MIN_FEE_FRACTION", async function () {
    const minFeeFraction = ethers.parseEther("0.038461538");

    expect(await this.contracts.feeCollector.MIN_FEE_FRACTION()).to.be.equal(minFeeFraction);
  });
}
