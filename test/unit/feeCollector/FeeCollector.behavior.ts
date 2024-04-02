import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanDecreaseDebt from "./effects/decreaseDebt";
import shouldBehaveLikeCanHandleRedemptionFee from "./effects/handleRedemptionFee";
import shouldBehaveLikeCanIncreaseDebt from "./effects/increaseDebt";
import shouldBehaveLikeCanLiquidateDebt from "./effects/liquidateDebt";
import shouldHavePublicConstant from "./view/constants";
import shouldHaveGetProtocolRevenueDestination from "./view/getProtocolRevenueDestination";
import shouldBehaveLikeOwner from "./view/owner";
import shouldHaveSimulateRefund from "./view/simulateRefund";

export function shouldBehaveLikeFeeCollectorContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#getProtocolRevenueDestination", function () {
      shouldHaveGetProtocolRevenueDestination();
    });

    describe("#simulateRefund", function () {
      shouldHaveSimulateRefund();
    });
  });

  describe("Effects Functions", function () {
    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });

    describe("#increaseDebt", function () {
      shouldBehaveLikeCanIncreaseDebt();
    });

    describe("#decreaseDebt", function () {
      shouldBehaveLikeCanDecreaseDebt();
    });

    describe("#liquidateDebt", function () {
      shouldBehaveLikeCanLiquidateDebt();
    });

    describe("#handleRedemptionFee", function () {
      shouldBehaveLikeCanHandleRedemptionFee();
    });
  });
}
