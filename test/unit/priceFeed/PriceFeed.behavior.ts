import shouldBehaveLikeCanSetOracle from "./effects/setOracle";
import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeOwner from "./view/owner";
import shouldHaveFetchPrice from "./view/fetchPrice";

export function shouldBehaveLikePriceFeedContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function() {
      shouldBehaveLikeOwner();
    });

    describe("#fetchPrice", function() {
      shouldHaveFetchPrice();
    })
  });

  describe("Effects Functions", function() {
    describe("#setOracle", function () {
      shouldBehaveLikeCanSetOracle();
    });
  });
}
