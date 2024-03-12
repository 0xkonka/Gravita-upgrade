import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveMintCapDefault(): void {
  it("should retrieve correct MINT_CAP_DEFAULT", async function () {
    const mintCapDefault = ethers.parseEther("1000000");

    expect(await this.contracts.adminContract.MINT_CAP_DEFAULT()).to.be.equal(mintCapDefault);
  });
}
