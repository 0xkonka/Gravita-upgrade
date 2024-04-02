import { expect } from "chai";

export default function shouldBehaveLikeComputeNominalCR(): void {
  context("when execute with trenBox owners count", function () {
    it("should return correct value when debt is not zero", async function () {
      const collamount = 100n;
      const debt = 2n;

      const tx = await this.contracts.trenBoxManagerOperations.computeNominalCR(collamount, debt);

      // coll * NICR_PRECISION (1e20) / debt

      const res = BigInt(5 * 10 ** 21);
      expect(tx).to.be.equal(res);
    });
  });

  context("when execute with trenBox owners count", function () {
    it("should return type(uint256).max when debt is zero", async function () {
      const collamount = 100n;

      const tx = await this.contracts.trenBoxManagerOperations.computeNominalCR(collamount, 0);

      const res = BigInt(2 ** 256);
      expect(tx).to.be.equal(res - 1n);
    });
  });
}
