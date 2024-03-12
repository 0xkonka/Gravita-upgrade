import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveDecimalPrecision(): void {
  it("should retrieve correct DECIMAL_PRECISION", async function () {
    const oneEther = ethers.WeiPerEther;
    expect(await this.contracts.adminContract.DECIMAL_PRECISION()).to.be.equal(oneEther);
  });
}
