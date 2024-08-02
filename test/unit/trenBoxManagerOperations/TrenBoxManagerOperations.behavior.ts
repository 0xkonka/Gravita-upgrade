import shouldBehaveLikeAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeBatchLiquidateTrenBoxes from "./effects/batchLiquidateTrenBoxes";
import shouldBehaveLikeLiquidate from "./effects/liquidate";
import shouldBehaveLikeLiquidateTrenBoxes from "./effects/liquidateTrenBoxes";
import shouldBehaveLikeRedistributeTrenBoxes from "./effects/redistributeTrenBoxes";
import shouldBehaveLikeComputeNominalCR from "./view/computeNominalCR";
import shouldBehaveLikeNamed from "./view/constants/name";
import shouldBehaveLikePercentagePrecision from "./view/constants/percentagePrecision";
import shouldBehaveLikeGetApproxHint from "./view/getApproxHint";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeTrenBoxManagerOperationsContract(): void {
  describe("TrenBoxManagerOperations", function () {
    describe("Constants", function () {
      describe("#NAME", function () {
        shouldBehaveLikeNamed();
      });

      describe("#PERCENTAGE_PRECISION", function () {
        shouldBehaveLikePercentagePrecision();
      });
    });

    describe("View Functions", function () {
      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });

      describe("#getApproxHint", function () {
        shouldBehaveLikeGetApproxHint();
      });

      describe("#computeNominalCR", function () {
        shouldBehaveLikeComputeNominalCR();
      });
    });

    describe("Effects Functions", function () {
      describe("#liquidate", function () {
        shouldBehaveLikeLiquidate();
      });

      describe("#liquidateTrenBoxes", function () {
        shouldBehaveLikeLiquidateTrenBoxes();
      });

      describe("#batchLiquidateTrenBoxes", function () {
        shouldBehaveLikeBatchLiquidateTrenBoxes();
      });

      describe("#redistributeTrenBoxes", function () {
        shouldBehaveLikeRedistributeTrenBoxes();
      });

      describe("#authorizeUpgrade", function () {
        shouldBehaveLikeAuthorizeUpgrade();
      });
    });
  });
}
