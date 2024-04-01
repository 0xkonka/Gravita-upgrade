import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanDecreaseDebt from "./effects/decreaseDebt";
import shouldBehaveLikeCanIncreaseDebt from "./effects/increaseDebt";
import shouldHavePublicConstant from "./view/constants";
import shouldHaveGetProtocolRevenueDestination from "./view/getProtocolRevenueDestination";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeFeeCollectorContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#getProtocolRevenueDestination", function () {
      shouldHaveGetProtocolRevenueDestination();
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
  });
}
