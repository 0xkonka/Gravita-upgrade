import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanSetOracle from "./effects/setOracle";
import shouldHavePublicConstant from "./view/constants";
import shouldHaveFetchPrice from "./view/fetchPrice";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikePriceFeedContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#fetchPrice", function () {
      shouldHaveFetchPrice();
    });
  });

  describe("Effects Functions", function () {
    describe("#setOracle", function () {
      shouldBehaveLikeCanSetOracle();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
