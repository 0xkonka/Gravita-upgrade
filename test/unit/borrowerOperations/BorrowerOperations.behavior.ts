import shouldBehaveLikeCanAddColl from "./effects/addColl";
import shouldBehaveLikeCanCloseTrenBox from "./effects/closeTrenBox";
import shouldBehaveLikeCanOpenTrenBox from "./effects/openTrenBox";
import shouldBehaveLikeCanRepayDebtTokens from "./effects/repayDebtTokens";
import shouldBehaveLikeCanWithdrawColl from "./effects/withdrawColl";
import shouldBehaveLikeCanWithdrawDebtTokens from "./effects/withdrawDebtTokens";
import shouldBehaveLikeNamed from "./view/name";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeBorrowerOperationsContract(): void {
  describe("BorrowerOperations", function () {
    describe("View Functions", function () {
      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });
      describe("#NAME", function () {
        shouldBehaveLikeNamed();
      });
    });
    describe("Effects Functions", function () {
      describe("#openTrenBox", function () {
        shouldBehaveLikeCanOpenTrenBox();
      });

      describe("#addColl", function () {
        shouldBehaveLikeCanAddColl();
      });

      describe("#repayDebtTokens", function () {
        shouldBehaveLikeCanRepayDebtTokens();
      });

      describe("#withdrawColl", function () {
        shouldBehaveLikeCanWithdrawColl();
      });

      describe("#withdrawDebtTokens", function () {
        shouldBehaveLikeCanWithdrawDebtTokens();
      });

      describe("#closeTrenBox", function () {
        shouldBehaveLikeCanCloseTrenBox();
      });

      describe("#adjustTrenBox", function () {});
      describe("#claimCollateral", function () {});
    });

    describe("Upgradable", function () {});
  });
}
