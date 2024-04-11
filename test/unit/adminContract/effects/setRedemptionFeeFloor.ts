import { expect } from "chai";
import { ethers } from "ethers";

const MIN_REDEMPTION_FEE_FLOOR = ethers.parseEther("0.001");
const MAX_REDEMPTION_FEE_FLOOR = ethers.parseEther("0.1");

export default function shouldBehaveLikeCanSetRedemptionFeeFloor(): void {
  context("when modifying redemption fee floor on active collateral", function () {
    it("set redemption fee floor should match value", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionFeeFloor = ethers.parseEther("0.005");

      await this.contracts.adminContract.setRedemptionFeeFloor(
        collateralAddress,
        redemptionFeeFloor
      );

      expect(
        await this.contracts.adminContract.getRedemptionFeeFloor(collateralAddress)
      ).to.be.equal(redemptionFeeFloor);
    });

    it("should emit RedemptionFeeFloorChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const oldRedemptionFeeFloor =
        await this.contracts.adminContract.getRedemptionFeeFloor(collateralAddress);

      const redemptionFeeFloor = ethers.parseEther("0.005");

      await expect(
        this.contracts.adminContract.setRedemptionFeeFloor(collateralAddress, redemptionFeeFloor)
      )
        .to.emit(this.contracts.adminContract, "RedemptionFeeFloorChanged")
        .withArgs(oldRedemptionFeeFloor, redemptionFeeFloor);
    });

    it("setting redemption fee floor too high should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionFeeFloor = MAX_REDEMPTION_FEE_FLOOR + 1n;

      await expect(
        this.contracts.adminContract.setRedemptionFeeFloor(collateralAddress, redemptionFeeFloor)
      )
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs(
          "Redemption Fee Floor",
          redemptionFeeFloor,
          MIN_REDEMPTION_FEE_FLOOR,
          MAX_REDEMPTION_FEE_FLOOR
        );
    });

    it("setting redemption fee floor too low should revert", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionFeeFloor = MIN_REDEMPTION_FEE_FLOOR - 1n;

      await expect(
        this.contracts.adminContract.setRedemptionFeeFloor(collateralAddress, redemptionFeeFloor)
      )
        .to.be.revertedWithCustomError(this.contracts.adminContract, "SafeCheckError")
        .withArgs(
          "Redemption Fee Floor",
          redemptionFeeFloor,
          MIN_REDEMPTION_FEE_FLOOR,
          MAX_REDEMPTION_FEE_FLOOR
        );
    });

    it("only owner can set redemption fee floor", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionFeeFloor = ethers.parseEther("0.005");

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract
          .connect(anotherAccount)
          .setRedemptionFeeFloor(collateralAddress, redemptionFeeFloor)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying redemption fee floor on inactive collateral", function () {
    it("set redemption fee floor should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const redemptionFeeFloor = ethers.parseEther("0.005");

      await expect(
        this.contracts.adminContract.setRedemptionFeeFloor(collateralAddress, redemptionFeeFloor)
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralNotConfigured"
      );
    });
  });
}
