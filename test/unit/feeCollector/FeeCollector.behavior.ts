import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";

export function shouldBehaveLikeFeeCollectorContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();
  });
  describe("Effects Functions", function () {
    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
