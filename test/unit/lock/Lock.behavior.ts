import shouldBehaveLikeConstructor from "./effects/constructor";
import shouldBehaveLikeWithdraw from "./effects/withdraw";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeLockContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
  });

  describe("Effects Functions", function () {
    describe("#constructor", function () {
      shouldBehaveLikeConstructor();
    });
    describe("#withdraw", function () {
      shouldBehaveLikeWithdraw();
    });
  });
}
