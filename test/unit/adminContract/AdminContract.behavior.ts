import shouldBehaveLikeCanSetBorrowingFee from "./effects/setBorrowingFee";
import shouldBehaveLikeCanSetCriticalCollateralRatio from "./effects/setCriticalCollateralRatio";
import shouldBehaveLikeCanSetMinNetDebt from "./effects/setMinNetDebt";
import shouldBehaveLikeCanSetMinimumCollateralRatio from "./effects/setMinimumCollateralRatio";
import shouldBehaveLikeCanSetMintCap from "./effects/setMintCap";
import shouldBehaveLikeCanSetPercentDivisor from "./effects/setPercentDivisor";
import shouldBehaveLikeCanSetRedemptionFeeFloor from "./effects/setRedemptionFeeFloor";
import shouldHaveDecimalPrecision from "./view/decimalPrecision";
import shouldHaveHunderdPercent from "./view/oneHundredPercent";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeAdminContractContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#DECIMAL_PRECISION", function () {
      shouldHaveDecimalPrecision();
    });

    describe("#_100pct", function () {
      shouldHaveHunderdPercent();
    });
  });

  describe("Effects Functions", function () {
    describe("#setBorrowingFee", function () {
      shouldBehaveLikeCanSetBorrowingFee();
    });

    describe("#setCCR", function () {
      shouldBehaveLikeCanSetCriticalCollateralRatio();
    });

    describe("#setMCR", function () {
      shouldBehaveLikeCanSetMinimumCollateralRatio();
    });

    describe("#setMinNetDebt", function () {
      shouldBehaveLikeCanSetMinNetDebt();
    });

    describe("#setMintCap", function () {
      shouldBehaveLikeCanSetMintCap();
    });

    describe("#setPercentDivisor", function () {
      shouldBehaveLikeCanSetPercentDivisor();
    });

    describe("#setRedemptionFeeFloor", function () {
      shouldBehaveLikeCanSetRedemptionFeeFloor();
    });
  });
}
