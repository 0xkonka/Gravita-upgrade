import { expect } from "chai";

export default function shouldBehaveLikeCanSetIsActive(): void {
  context("when the caller is the owner", function () {
    context("when collateral is active", function () {
      it("should set collateral to inactive", async function () {
        const { wETH } = this.collaterals.active;

        await this.contracts.adminContract.setIsActive(wETH.address, false);

        const isActive = await this.contracts.adminContract.getIsActive(wETH.address);

        expect(isActive).to.be.equal(false);
      });
    });

    context("when collateral is inactive", function () {
      it("should set collateral to active", async function () {
        const { dai } = this.collaterals.inactive;

        await this.contracts.adminContract.setIsActive(dai.address, true);

        const isActive = await this.contracts.adminContract.getIsActive(dai.address);

        expect(isActive).to.be.equal(true);
      });
    });

    context("when collateral does not exist", function () {
      it("should revert with custom error AdminContract__CollateralDoesNotExist", async function () {
        const { testCollateral } = this.collaterals.notAdded;

        await expect(
          this.contracts.adminContract.setIsActive(testCollateral.address, true)
        ).to.be.revertedWithCustomError(
          this.contracts.adminContract,
          "AdminContract__CollateralDoesNotExist"
        );
      });
    });
  });

  context("when the caller is not the owner", function () {
    it("should revert with custom error AdminContract__OnlyOwner", async function () {
      const { dai } = this.collaterals.inactive;

      const nonOwner = this.signers.accounts[1];

      await expect(
        this.contracts.adminContract.connect(nonOwner).setIsActive(dai.address, false)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });
}
