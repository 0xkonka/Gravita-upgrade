import { expect } from "chai";
import { ethers } from "ethers";

const MIN_PERCENT_DIVISOR = 2n;
const MAX_PERCENT_DIVISOR = 200n;

export default function shouldBehaveLikeCanSetPercentDivisor(): void {
  context("when modifying percent divisor on active collateral", function () {
    it("set percent divisor should match value", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const percentDivisor = 10n;

      await this.contracts.adminContract.setPercentDivisor(collateralAddress, percentDivisor);

      expect(await this.contracts.adminContract.getPercentDivisor(collateralAddress)).to.be.equal(
        percentDivisor
      );
    });

    it("should emit PercentDivisorChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const oldPercentDivisor =
        await this.contracts.adminContract.getPercentDivisor(collateralAddress);

      const percentDivisor = 10n;

      await expect(
        this.contracts.adminContract.setPercentDivisor(collateralAddress, percentDivisor)
      )
        .to.emit(this.contracts.adminContract, "PercentDivisorChanged")
        .withArgs(oldPercentDivisor, percentDivisor);
    });

    it("setting percent divisor too high should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const percentDivisor = MAX_PERCENT_DIVISOR + 1n;

      await expect(
        this.contracts.adminContract.setPercentDivisor(collateralAddress, percentDivisor)
      )
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("Percent Divisor", percentDivisor, MIN_PERCENT_DIVISOR, MAX_PERCENT_DIVISOR);
    });

    it("setting percent divisor too low should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const percentDivisor = MIN_PERCENT_DIVISOR - 1n;

      await expect(
        this.contracts.adminContract.setPercentDivisor(collateralAddress, percentDivisor)
      )
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs("Percent Divisor", percentDivisor, MIN_PERCENT_DIVISOR, MAX_PERCENT_DIVISOR);
    });

    it("only owner can set percent divisor", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const percentDivisor = 10n;

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract
          .connect(anotherAccount)
          .setPercentDivisor(collateralAddress, percentDivisor)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying percent divisor on inactive collateral", function () {
    it("set percent divisor should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const percentDivisor = 10n;

      await expect(
        this.contracts.adminContract.setPercentDivisor(collateralAddress, percentDivisor)
      ).to.be.revertedWith("Collateral is not configured, use setCollateralParameters");
    });
  });
}
