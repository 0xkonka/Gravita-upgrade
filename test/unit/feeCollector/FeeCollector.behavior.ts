import shouldHavePublicConstant from "./view/constants";
import shouldHaveGetProtocolRevenueDestination from "./view/getProtocolRevenueDestination";
import shouldBehaveLikeOwner from "./view/owner";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";

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
  });
}
