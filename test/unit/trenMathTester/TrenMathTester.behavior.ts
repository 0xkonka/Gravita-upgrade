import shouldBehaveLikeComputeCR from "./pure/computeCR";
import shouldBehaveLikeComputeNominalCR from "./pure/computeNominalCR";
import shouldBehaveLikeHaveDecMul from "./pure/decMul";
import shouldBehaveLikeHaveDecPow from "./pure/decPow";
import shouldBehaveLikeGetAbsoluteDifference from "./pure/getAbsoluteDifference";
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

    describe("#decPow", function () {
      shouldBehaveLikeHaveDecPow();
    });

    describe("#getAbsoluteDifference", function () {
      shouldBehaveLikeGetAbsoluteDifference();
    });

    describe("#computeNominalCR", function () {
      shouldBehaveLikeComputeNominalCR();
    });

    describe("#computeCR", function () {
      shouldBehaveLikeComputeCR();
    });
  });
}
