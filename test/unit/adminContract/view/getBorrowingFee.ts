import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveGetBorrowingFee(): void {
  context("for active collateral", function () {
    it("should return correct borrowing fee", async function () {
      const { wETH } = this.collaterals.active;

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(wETH.address);

      expect(borrowingFee).to.be.equal(wETH.borrowingFee);
    });
  });

  context("for inactive collateral", function () {
    it("should return BORROWING_FEE_DEFAULT", async function () {
      const { dai } = this.collaterals.inactive;

      const expectedBorrowingFee = await this.contracts.adminContract.BORROWING_FEE_DEFAULT();
      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(dai.address);

      expect(borrowingFee).to.be.equal(expectedBorrowingFee);
    });
  });

  context("for non-existent collateral", function () {
    it("should return ZERO", async function () {
      const nonExistentCollateral = ethers.ZeroAddress;

      const borrowingFee =
        await this.contracts.adminContract.getBorrowingFee(nonExistentCollateral);

      expect(borrowingFee).to.be.equal(0);
    });
  });
}
