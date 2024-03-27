import shouldHaveName from "./name";
import shouldHaveMinFeeDays from "./minFeeDays";
import shouldHaveMinFeeFraction from "./minFeeFraction";
import shouldHaveFeeExpirationSeconds from "./feeExpirationSeconds";
import shouldHaveRouteToTrenStaking from "./routeToTrenStaking";

export default function shouldHavePublicConstant(): void {
  describe("View Functions", function () {
    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#MIN_FEE_DAYS", function () {
      shouldHaveMinFeeDays();
    });

    describe("#MIN_FEE_FRACTION", function () {
      shouldHaveMinFeeFraction();
    });

    describe("#FEE_EXPIRATION_SECONDS", function () {
      shouldHaveFeeExpirationSeconds();
    });

    describe("#routeToTRENStaking", function () {
      shouldHaveRouteToTrenStaking();
    });
  });
}
