import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveRedemptionBlockTimestampDefault(): void {
  it("should retrieve correct REDEMPTION_BLOCK_TIMESTAMP_DEFAULT", async function () {
    const never = ethers.MaxUint256;

    expect(await this.contracts.adminContract.REDEMPTION_BLOCK_TIMESTAMP_DEFAULT()).to.be.equal(
      never
    );
  });
}
