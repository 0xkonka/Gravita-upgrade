import { expect } from "chai";

export default function shouldBehaveLikeCanSetCollateralParameters(): void {
  context("when setting collateral parameters on active collateral", function () {
    it("should set active flag to true", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const active = await this.contracts.adminContract.getIsActive(wETH.address);

      expect(active).to.be.true;
    });

    it("should set borrowing fee", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(wETH.address);

      expect(borrowingFee).to.be.equal(wETH.borrowingFee);
    });

    it("should set correct critical collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const CCR = await this.contracts.adminContract.getCcr(wETH.address);

      expect(CCR).to.be.equal(wETH.CCR);
    });

    it("should set correct minimum collateral rate", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const MCR = await this.contracts.adminContract.getMcr(wETH.address);

      expect(MCR).to.be.equal(wETH.MCR);
    });

    it("should set correct minimum net debt", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(wETH.address);

      expect(minNetDebt).to.be.equal(wETH.minNetDebt);
    });

    it("should set correct mint cap", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const mintCap = await this.contracts.adminContract.getMintCap(wETH.address);

      expect(mintCap).to.be.equal(wETH.mintCap);
    });

    it("should set correct percent divisor", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        wETH.address,
        wETH.borrowingFee,
        wETH.CCR,
        wETH.MCR,
        wETH.minNetDebt,
        wETH.mintCap,
        defaultPercentDivisor
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(wETH.address);

      expect(percentDivisor).to.be.equal(defaultPercentDivisor);
    });
  });

  context("when setting collateral parameters on inactive collateral", function () {
    it("should set active flag to true", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const active = await this.contracts.adminContract.getIsActive(dai.address);

      expect(active).to.be.true;
    });

    it("should set borrowing fee", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(dai.address);

      expect(borrowingFee).to.be.equal(dai.borrowingFee);
    });

    it("should set correct critical collateral rate", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const CCR = await this.contracts.adminContract.getCcr(dai.address);

      expect(CCR).to.be.equal(dai.CCR);
    });

    it("should set correct minimum collateral rate", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const MCR = await this.contracts.adminContract.getMcr(dai.address);

      expect(MCR).to.be.equal(dai.MCR);
    });

    it("should set correct minimum net debt", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const minNetDebt = await this.contracts.adminContract.getMinNetDebt(dai.address);

      expect(minNetDebt).to.be.equal(dai.minNetDebt);
    });

    it("should set correct mint cap", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const mintCap = await this.contracts.adminContract.getMintCap(dai.address);

      expect(mintCap).to.be.equal(dai.mintCap);
    });

    it("should set correct percent divisor", async function () {
      const { dai } = this.collaterals.inactive;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await this.contracts.adminContract.setCollateralParameters(
        dai.address,
        dai.borrowingFee,
        dai.CCR,
        dai.MCR,
        dai.minNetDebt,
        dai.mintCap,
        defaultPercentDivisor
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(dai.address);

      expect(percentDivisor).to.be.equal(defaultPercentDivisor);
    });
  });

  context("when setting collateral parameters on non-existent collateral", function () {
    it("should revert with custom error AdminContract__CollateralDoesNotExist", async function () {
      const nonExistentCollateral = this.collaterals.notAdded.testCollateral;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();

      await expect(
        this.contracts.adminContract.setCollateralParameters(
          nonExistentCollateral.address,
          nonExistentCollateral.borrowingFee,
          nonExistentCollateral.CCR,
          nonExistentCollateral.MCR,
          nonExistentCollateral.minNetDebt,
          nonExistentCollateral.mintCap,
          defaultPercentDivisor
        )
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralDoesNotExist"
      );
    });
  });
}
