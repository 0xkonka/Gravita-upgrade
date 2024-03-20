import { expect } from "chai";

export default function shouldBehaveLikeGetBorrowingRate(): void {
  context("for active collateral", function () {
    it("should return correct borrowing rate", async function () {
      const { wETH } = this.collaterals.active;

      const borrowingFeeRate = await this.contracts.adminContract.getBorrowingFee(wETH.address);

      expect(await this.contracts.trenBoxManager.getBorrowingRate(wETH.address))
        .to.be.equal(borrowingFeeRate);
    });
  });

  context("for inactive collateral", function () {
    it("should return BORROWING_FEE_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedBorrowingFee = await this.contracts.adminContract.BORROWING_FEE_DEFAULT();
      const borrowingFeeRate = await this.contracts.trenBoxManager.getBorrowingRate(dai.address);

      expect(borrowingFeeRate).to.be.equal(expectedBorrowingFee);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const borrowingFee =
        await this.contracts.trenBoxManager.getBorrowingRate(testCollateral.address);

      expect(borrowingFee).to.be.equal(0);
    });
  });
}
