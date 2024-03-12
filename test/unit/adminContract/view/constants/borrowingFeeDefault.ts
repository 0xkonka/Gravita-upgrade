import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveBorrowingFeeDefault(): void {
  it("should retrieve correct BORROWING_FEE_DEFAULT", async function () {
    const fivePromille = ethers.parseEther("0.005");

    expect(await this.contracts.adminContract.BORROWING_FEE_DEFAULT()).to.be.equal(fivePromille);
  });
}
