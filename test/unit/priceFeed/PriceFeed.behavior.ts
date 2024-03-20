import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikePriceFeedContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
  });

  describe("Effects Functions", function () {});
}
