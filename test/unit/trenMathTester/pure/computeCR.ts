import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldBehaveLikeComputeCR(): void {
  context("when debt is not zero", function () {
    it("should return correct nominal CR", async function () {
      const coll = ethers.WeiPerEther;
      const debt = ethers.parseEther("0.5");
      const price = BigInt(10 ** 8);

      const newCollRatio = (coll * price) / debt;

      expect(await this.testContracts.trenMathTester.computeCR(coll, debt, price)).to.equal(
        newCollRatio
      );
    });
  });

  context("when debt is zero", function () {
    it("should return maximal value for uint256", async function () {
      const coll = ethers.WeiPerEther;
      const debt = 0n;
      const price = BigInt(10 ** 8);

      const expectedResult = ethers.MaxUint256;

      expect(await this.testContracts.trenMathTester.computeCR(coll, debt, price)).to.equal(
        expectedResult
      );
    });
  });
}
