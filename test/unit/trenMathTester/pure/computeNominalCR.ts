import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeComputeNominalCR(): void {
  context("when debt is not zero", function () {
    it("should return correct nominal CR", async function () {
      const coll = ethers.WeiPerEther;
      const debt = ethers.parseEther("0.5");

      const nicrPrecision = BigInt(10 ** 20);
      const expectedResult = (coll * nicrPrecision) / debt;

      expect(await this.testContracts.trenMathTester.computeNominalCR(coll, debt)).to.equal(
        expectedResult
      );
    });
  });

  context("when debt is zero", function () {
    it("should return maximal value for uint256", async function () {
      const coll = ethers.WeiPerEther;
      const debt = 0n;

      const expectedResult = ethers.MaxUint256;

      expect(await this.testContracts.trenMathTester.computeNominalCR(coll, debt)).to.equal(
        expectedResult
      );
    });
  });
}
