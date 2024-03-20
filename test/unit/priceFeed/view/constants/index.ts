import shouldHaveName from "./name";
import shouldHaveTargetDigits from "./targetDigits";

export default function shouldHavePublicConstant(): void {
  describe("View Functions", function () {
    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#TARGET_DIGITS", function () {
      shouldHaveTargetDigits();
    });
  });
}
