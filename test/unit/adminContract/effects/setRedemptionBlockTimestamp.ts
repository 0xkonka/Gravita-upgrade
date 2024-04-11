import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldBehaveLikeCanSetRedemptionBlockTimestamp(): void {
  context("when modifying redemption fee floor on active collateral", function () {
    it("set redemption fee floor should match value", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionBlockTimestamp = (await time.latestBlock()) + 1000;

      await this.contracts.adminContract.setRedemptionBlockTimestamp(
        collateralAddress,
        redemptionBlockTimestamp
      );

      expect(
        await this.contracts.adminContract.getRedemptionBlockTimestamp(collateralAddress)
      ).to.be.equal(redemptionBlockTimestamp);
    });

    it("should emit RedemptionBlockTimestampChanged event", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;

      const redemptionBlockTimestamp = (await time.latestBlock()) + 1000;

      await expect(
        this.contracts.adminContract.setRedemptionBlockTimestamp(
          collateralAddress,
          redemptionBlockTimestamp
        )
      )
        .to.emit(this.contracts.adminContract, "RedemptionBlockTimestampChanged")
        .withArgs(collateralAddress, redemptionBlockTimestamp);
    });

    it("only owner can set redemption fee floor", async function () {
      const collateralAddress = this.collaterals.active.wETH.address;
      const redemptionBlockTimestamp = (await time.latestBlock()) + 1000;

      const anotherAccount = this.signers.accounts[0];

      await expect(
        this.contracts.adminContract
          .connect(anotherAccount)
          .setRedemptionBlockTimestamp(collateralAddress, redemptionBlockTimestamp)
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });

  context("when modifying redemption fee floor on inactive collateral", function () {
    it.skip("set redemption fee floor should revert", async function () {
      const collateralAddress = ethers.ZeroAddress;
      const redemptionBlockTimestamp = (await time.latestBlock()) + 1000;

      await expect(
        this.contracts.adminContract.setRedemptionBlockTimestamp(
          collateralAddress,
          redemptionBlockTimestamp
        )
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralNotConfigured"
      );
    });
  });
}
