import { expect } from "chai";

export default function shouldBehaveLikeCanAddNewAndInitializeCollateral(): void {
  context("when adding a new collateral", function () {
    it("should emit CollateralAdded", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      const addAndInitializeNewCollateralTx =
        await this.contracts.adminContract.addAndInitializeNewCollateral(
          testCollateral.address,
          testCollateral.gasCompensation,
          testCollateral.borrowingFee,
          testCollateral.CCR,
          testCollateral.MCR,
          testCollateral.minNetDebt,
          testCollateral.mintCap,
          defaultPercentDivisor,
          defaultRedemptionFeeFloor
        );

      const expectedAddress = testCollateral.address.toString();

      await expect(addAndInitializeNewCollateralTx)
        .to.emit(this.contracts.adminContract, "CollateralAdded")
        .withArgs(expectedAddress);
    });

    it("should add new collateral to validCollaterals", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const validCollaterals = await this.contracts.adminContract.getValidCollateral();

      expect(validCollaterals).to.include(testCollateral.address);
    });

    it("should set correct index", async function () {
      const { testCollateral } = this.collaterals.notAdded;
      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      const expectedIndex = (await this.contracts.adminContract.getValidCollateral()).length;

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const index = await this.contracts.adminContract.getIndex(testCollateral.address);

      expect(index).to.be.equal(expectedIndex);
    });

    it("should set correct gas compensation", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const gasCompensation = await this.contracts.adminContract.getDebtTokenGasCompensation(
        testCollateral.address
      );

      expect(gasCompensation).to.be.equal(testCollateral.gasCompensation);
    });

    it("should set active flag to true", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const isActive = await this.contracts.adminContract.getIsActive(testCollateral.address);

      expect(isActive).to.be.true;
    });

    it("should add collateral to StabilityPool", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const [tokensInStabilityPool] = await this.contracts.stabilityPool.getAllCollateral();

      expect(tokensInStabilityPool).to.include(testCollateral.address);
    });

    it("should set borrowing fee", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const borrowingFee = await this.contracts.adminContract.getBorrowingFee(
        testCollateral.address
      );

      expect(borrowingFee).to.be.equal(testCollateral.borrowingFee);
    });

    it("should set correct critical collateral rate with no grace period", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const CCR = await this.contracts.adminContract.getCcr(testCollateral.address);

      expect(CCR).to.be.equal(testCollateral.CCR);
    });

    it("should set correct minimum collateral rate with no grace period", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const MCR = await this.contracts.adminContract.getMcr(testCollateral.address);

      expect(MCR).to.be.equal(testCollateral.MCR);
    });

    it("should set correct mint cap", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const mintCap = await this.contracts.adminContract.getMintCap(testCollateral.address);

      expect(mintCap).to.be.equal(testCollateral.mintCap);
    });

    it("should set correct percent divisor", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const percentDivisor = await this.contracts.adminContract.getPercentDivisor(
        testCollateral.address
      );

      expect(percentDivisor).to.be.equal(defaultPercentDivisor);
    });

    it("should set correct redemption fee floor", async function () {
      const { testCollateral } = this.collaterals.notAdded;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await this.contracts.adminContract.addAndInitializeNewCollateral(
        testCollateral.address,
        testCollateral.gasCompensation,
        testCollateral.borrowingFee,
        testCollateral.CCR,
        testCollateral.MCR,
        testCollateral.minNetDebt,
        testCollateral.mintCap,
        defaultPercentDivisor,
        defaultRedemptionFeeFloor
      );

      const redemptionFeeFloor = await this.contracts.adminContract.getRedemptionFeeFloor(
        testCollateral.address
      );

      expect(redemptionFeeFloor).to.be.equal(defaultRedemptionFeeFloor);
    });
  });

  context("when adding an existing collateral", function () {
    it("should revert", async function () {
      const { wETH } = this.collaterals.active;

      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      await expect(
        this.contracts.adminContract.addAndInitializeNewCollateral(
          wETH.address,
          wETH.gasCompensation,
          wETH.borrowingFee,
          wETH.CCR,
          wETH.MCR,
          wETH.minNetDebt,
          wETH.mintCap,
          defaultPercentDivisor,
          defaultRedemptionFeeFloor
        )
      ).to.be.revertedWithCustomError(
        this.contracts.adminContract,
        "AdminContract__CollateralExists"
      );
    });
  });

  context("when not owner calls addNewCollateral", function () {
    it("should revert", async function () {
      const { testCollateral } = this.collaterals.notAdded;
      const defaultPercentDivisor = await this.contracts.adminContract.PERCENT_DIVISOR_DEFAULT();
      const defaultRedemptionFeeFloor =
        await this.contracts.adminContract.REDEMPTION_FEE_FLOOR_DEFAULT();

      const notOwner = this.signers.accounts[1];

      await expect(
        this.contracts.adminContract
          .connect(notOwner)
          .addAndInitializeNewCollateral(
            testCollateral.address,
            testCollateral.gasCompensation,
            testCollateral.borrowingFee,
            testCollateral.CCR,
            testCollateral.MCR,
            testCollateral.minNetDebt,
            testCollateral.mintCap,
            defaultPercentDivisor,
            defaultRedemptionFeeFloor
          )
      ).to.be.revertedWithCustomError(this.contracts.adminContract, "AdminContract__OnlyOwner");
    });
  });
}
