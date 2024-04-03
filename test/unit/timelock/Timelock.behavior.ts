import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeHaveAdmin from "./view/admin";

export function shouldBehaveLikeTimelockContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#admin", function () {
      shouldBehaveLikeHaveAdmin();
    });
  });

  describe("Effects Functions", function () {
  });
}
