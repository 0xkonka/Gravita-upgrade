import shouldBehaveLikeHaveDecMul from "./pure/decMul";
import shouldBehaveLikeHaveMax from "./pure/max";
import shouldBehaveLikeHaveMin from "./pure/min";

export function shouldBehaveLikeTrenMathTesterContract(): void {
  describe("Pure Functions", function () {
    describe("#min", function () {
      shouldBehaveLikeHaveMin();
    });

    describe("#max", function () {
      shouldBehaveLikeHaveMax();
    });

    describe("#decMul", function () {
      shouldBehaveLikeHaveDecMul();
    });
  });
}
