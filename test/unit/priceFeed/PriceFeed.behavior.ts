import shouldHavePublicConstant from "./view/constants";

export function shouldBehaveLikePriceFeedContract(): void {
    describe("View Functions", function () {
      shouldHavePublicConstant();
    });
    describe("Effects Functions", function () {});
}
