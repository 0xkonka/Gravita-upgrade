import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeHaveDecMul(): void {
  it("should retrieve correct decimal multiplication", async function () {
    const DECIMAL_PRECISION = ethers.WeiPerEther;
    const x: bigint = BigInt(10 ** 15);
    const y: bigint = BigInt(10 ** 16);
    const prod_xy = x * y;

    const expectedProd = (prod_xy + DECIMAL_PRECISION / BigInt(2)) / DECIMAL_PRECISION;

    expect(await this.testContracts.trenMathTester.decMul(x, y)).to.equal(expectedProd);
  });
}
