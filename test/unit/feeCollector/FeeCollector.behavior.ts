import shouldHavePublicConstant from "./view/constants";

export function shouldBehaveLikeFeeCollectorContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();
  });
  describe("Effects Functions", function () {});
}
