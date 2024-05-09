import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetNetDebt(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const debt = ethers.parseEther("200");

    expect(await this.contracts.trenBoxManager.getNetDebt(wETH.address, debt)).to.be.equal(0n);
  });

  it("should not return zero", async function () {
    const { wETH } = this.collaterals.active;
    const debt = ethers.parseEther("400");
    const res = ethers.parseEther("200");

    expect(await this.contracts.trenBoxManager.getNetDebt(wETH.address, debt)).to.be.equal(res);
  });
}
