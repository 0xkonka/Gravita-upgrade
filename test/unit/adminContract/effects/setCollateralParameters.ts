import { time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";

export default function shouldBehaveLikeCanSetCollateralParameters(): void {
  context("when setting collateral parameters on active collateral", function () {
    it("should set active flag to true", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const active = await this.contracts.adminContract.getIsActive(wETH.address);

      expect(active).to.be.true;
    });

    it("should set borrowing fee", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(wETH.address);

      expect(borrowingFee).to.be.equal(wETH.borrowingFee);
    });

    it("should set correct critical collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const CCR = await this.contracts.adminContract.getCcr(wETH.address);

      expect(CCR).to.be.equal(wETH.CCR);
    });

    it("should set correct minimum collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const MCR = await this.contracts.adminContract.getMcr(wETH.address);

      expect(MCR).to.be.equal(wETH.MCR);
    });

    it("should set correct minimum net debt", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(wETH.address);

      expect(minNetDebt).to.be.equal(wETH.minNetDebt);
    });

    it("should set correct mint cap", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const mintCap = await this.contracts.adminContract.getMintCap(wETH.address);

      expect(mintCap).to.be.equal(wETH.mintCap);
    });

    it("should set correct percent divisor", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(wETH.address);

      expect(percentDivisor).to.be.equal(defaultPercentDivisor);
    });

    it("should set correct redemption fee floor", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const redemptionFeeFloor = await this.contracts.adminContract.getRedemptionFeeFloor(
        wETH.address
      );

      expect(redemptionFeeFloor).to.be.equal(defaultRedemptionFeeFloor);
    });
  });

  context("when setting collateral parameters on inactive collateral", function () {
    it("should set active flag to true", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const active = await this.contracts.adminContract.getIsActive(dai.address);

      expect(active).to.be.true;
    });

    it("should set borrowing fee", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(dai.address);

      expect(borrowingFee).to.be.equal(dai.borrowingFee);
    });

    it("should set correct critical collateral rate", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const CCR = await this.contracts.adminContract.getCcr(dai.address);

      expect(CCR).to.be.equal(dai.CCR);
    });

    it("should set correct minimum collateral rate", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      await time.increase(time.duration.weeks(1));

      const MCR = await this.contracts.adminContract.getMcr(dai.address);

      expect(MCR).to.be.equal(dai.MCR);
    });

    it("should set correct minimum net debt", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(dai.address);

      expect(minNetDebt).to.be.equal(dai.minNetDebt);
    });

    it("should set correct mint cap", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const mintCap = await this.contracts.adminContract.getMintCap(dai.address);

      expect(mintCap).to.be.equal(dai.mintCap);
    });

    it("should set correct percent divisor", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(dai.address);

      expect(percentDivisor).to.be.equal(defaultPercentDivisor);
    });

    it("should set correct redemption fee floor", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const redemptionFeeFloor = await this.contracts.adminContract.getRedemptionFeeFloor(
        dai.address
      );

      expect(redemptionFeeFloor).to.be.equal(defaultRedemptionFeeFloor);
    });
  });

  context("when setting collateral parameters on non-existent collateral", function () {
    it.skip("should revert", async function () {
      const nonExistentCollateral = this.collaterals.notAdded.testCollateral;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await expect(
        this.contracts.adminContract.setCollateralParameters(
          nonExistentCollateral.address,
          nonExistentCollateral.borrowingFee,
          nonExistentCollateral.CCR,
          nonExistentCollateral.MCR,
          nonExistentCollateral.minNetDebt,
          nonExistentCollateral.mintCap,
          defaultPercentDivisor,
          defaultRedemptionFeeFloor
        )
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });
}
