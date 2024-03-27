import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeGetNetDebt(): void {
  it("should return zero", async function () {
    const { wETH } = this.collaterals.active;
    const debt = ethers.parseEther("300");

    expect(await this.contracts.trenBoxManager.getNetDebt(wETH.address, debt))
      .to.be.equal(0);
  });

  it("should not return zero", async function () {
    const { wETH } = this.collaterals.active;
    const debt = ethers.parseEther("400");
    const res = ethers.parseEther("100");

    expect(await this.contracts.trenBoxManager.getNetDebt(wETH.address, debt))
      .to.be.equal(res);
  });
}
