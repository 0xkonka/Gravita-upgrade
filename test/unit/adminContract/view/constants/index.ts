import shouldHaveBorrowingFeeDefault from "./borrowingFeeDefault";
import shouldHaveCriticalCollteralRatioDefault from "./criticalCollteralRatioDefault";
import shouldHaveDecimalPrecision from "./decimalPrecision";
import shouldHaveMinNetDebtDefault from "./minNetDebtDefault";
import shouldHaveMinimumCollteralRatioDefault from "./minimumCollteralRatioDefault";
import shouldHaveMintCapDefault from "./mintCapDefault";
import shouldHaveName from "./name";
import shouldHaveHunderdPercent from "./oneHundredPercent";
import shouldHavePercentDivisorDefault from "./percentDivisorDefault";
import shouldHaveRouteToTrenStaking from "./routeToTrenStaking";

export default function shouldHavePublicConstant(): void {
  describe("View Functions", function () {
    describe("#DECIMAL_PRECISION", function () {
      shouldHaveDecimalPrecision();
    });

    describe("#_100pct", function () {
      shouldHaveHunderdPercent();
    });

    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#BORROWING_FEE_DEFAULT", function () {
      shouldHaveBorrowingFeeDefault();
    });

    describe("#CCR_DEFAULT", function () {
      shouldHaveCriticalCollteralRatioDefault();
    });

    describe("#MCR_DEFAULT", function () {
      shouldHaveMinimumCollteralRatioDefault();
    });

    describe("#MIN_NET_DEBT_DEFAULT", function () {
      shouldHaveMinNetDebtDefault();
    });

    describe("#MINT_CAP_DEFAULT", function () {
      shouldHaveMintCapDefault();
    });

    describe("#PERCENT_DIVISOR_DEFAULT", function () {
      shouldHavePercentDivisorDefault();
    });

    describe("#routeToTRENStaking", function () {
      shouldHaveRouteToTrenStaking();
    });
  });
}
