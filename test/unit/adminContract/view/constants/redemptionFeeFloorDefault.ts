import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveRedemptionFeeFloorDefault(): void {
  it("should retrieve correct REDEMPTION_FEE_FLOOR_DEFAULT", async function () {
    const fivePercenilles = ethers.parseEther("0.005");

    expect(await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT()).to.be.equal(
      fivePercenilles
    );
  });
}
