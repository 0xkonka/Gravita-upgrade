import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanSetBorrowingFee(): void {
  context("when modifying borrowing fee on active collateral", function () {
    it("setting borrowing fee should match value", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const borrowingFee = (0.005e18).toString();

      await this.contracts.adminContract.setBorrowingFee(collateralAddress, borrowingFee);

      expect(await this.contracts.adminContract.getBorrowingFee(collateralAddress)).to.be.equal(
        borrowingFee
      );
    });

    it("should emit BorrowingFeeChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const oldBorrowingFee = await this.contracts.adminContract.getBorrowingFee(collateralAddress);

      const borrowingFee = (0.005e18).toString();

      await expect(this.contracts.adminContract.setBorrowingFee(collateralAddress, borrowingFee))
        .to.emit(this.contracts.adminContract, "BorrowingFeeChanged")
        .withArgs(oldBorrowingFee, borrowingFee);
    });

    it("setting borrowing fee too high should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const borrowingFee = (1e18).toString();
      const zeroPercent = 0n;
      const maxBorrowingFee = ethers.parseEther("0.1");

      await expect(this.contracts.adminContract.setBorrowingFee(collateralAddress, borrowingFee))
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("Borrowing Fee", borrowingFee, zeroPercent, maxBorrowingFee);
    });

    it("only owner can set borrowing fee", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const borrowingFee = (0.005e18).toString();

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract
          .connect(anotherAccount)
          .setBorrowingFee(collateralAddress, borrowingFee)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifiyng borrowing fee on inactive collateral", function () {
    it("should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const borrowingFee = (0.005e18).toString();

      await expect(
        this.contracts.adminContract.setBorrowingFee(collateralAddress, borrowingFee)
      ).to.be.revertedWith("Collateral is not configured, use setCollateralParameters");
    });
  });
}
