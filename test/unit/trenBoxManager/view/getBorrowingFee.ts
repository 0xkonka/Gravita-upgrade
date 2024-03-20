import { expect } from "chai";

export default function shouldBehaveLikeGetBorrowingFee(): void {
  context("for active collateral", function () {
    it("should return correct borrowing rate", async function () {
      const { wETH } = this.collaterals.active;
      const debtAmount = 100n;

      expect(await this.contracts.trenBoxManager.getBorrowingFee(wETH.address, debtAmount))
        .to.be.equal(1n);
    });
  });

  context("for inactive collateral", function () {
    it("should return zero", async function () {
      const { dai } = this.collaterals.inactive;
      const debtAmount = 100n;

      expect(await this.contracts.trenBoxManager.getBorrowingFee(dai.address, debtAmount))
        .to.be.equal(0n);
    });
  });

  context("for non-existent collateral", function () {
    it("should return zero", async function () {
      const { testCollateral } = this.collaterals.notAdded;
      const debtAmount = 100n;

      expect(await this.contracts.trenBoxManager.getBorrowingFee(testCollateral.address, debtAmount))
        .to.be.equal(0n);
    });
  });
}
