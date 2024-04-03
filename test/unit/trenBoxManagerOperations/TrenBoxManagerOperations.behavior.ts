import shouldBehaveLikeAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeBatchLiquidateTrenBoxes from "./effects/batchLiquidateTrenBoxes";
import shouldBehaveLikeLiquidate from "./effects/liquidate";
import shouldBehaveLikeLiquidateTrenBoxes from "./effects/liquidateTrenBoxes";
import shouldBehaveLikeRedeemCollateral from "./effects/redeemCollateral";
import shouldBehaveLikeSetRedemptionSofteningParam from "./effects/setRedemptionSofteningParam";
import shouldBehaveLikeComputeNominalCR from "./view/computeNominalCR";
import shouldBehaveLikeBatchSizeLimit from "./view/constants/batchSizeLimit";
import shouldBehaveLikeNamed from "./view/constants/name";
import shouldBehaveLikePercentagePrecision from "./view/constants/percentagePrecision";
import shouldBehaveLikeGetApproxHint from "./view/getApproxHint";
import shouldBehaveLikeGetRedemptionHints from "./view/getRedemptionHints";
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

      describe("#BATCH_SIZE_LIMIT", function () {
        shouldBehaveLikeBatchSizeLimit();
      });
    });

    describe("View Functions", function () {
      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });

      describe("#getRedemptionHints", function () {
        shouldBehaveLikeGetRedemptionHints();
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

      describe("#redeemCollateral", function () {
        shouldBehaveLikeRedeemCollateral();
      });

      describe("#setRedemptionSofteningParam", function () {
        shouldBehaveLikeSetRedemptionSofteningParam();
      });

      describe("#authorizeUpgrade", function () {
        shouldBehaveLikeAuthorizeUpgrade();
      });
    });
  });
}
