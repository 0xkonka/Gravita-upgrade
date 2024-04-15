import shouldHaveFeeExpirationSeconds from "./feeExpirationSeconds";
import shouldHaveMinFeeDays from "./minFeeDays";
import shouldHaveMinFeeFraction from "./minFeeFraction";
import shouldHaveName from "./name";

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
  });
}
