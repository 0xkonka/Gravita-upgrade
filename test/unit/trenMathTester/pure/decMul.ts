import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeHaveDecMul(): void {
  it("should retrieve correct decimal multiplication", async function () {
    const decimalPrecision = ethers.WeiPerEther;
    const x = BigInt(10 ** 15);
    const y = BigInt(10 ** 16);
    const prod_xy = x * y;

    const expectedProd = (prod_xy + decimalPrecision / 2n) / decimalPrecision;

    expect(await this.testContracts.trenMathTester.decMul(x, y)).to.equal(expectedProd);
  });
}
