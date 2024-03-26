import shouldBehaveLikeCanSetOracle from "./effects/setOracle";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeOwner from "./view/owner";
import shouldHaveFetchPrice from "./view/fetchPrice";
import shouldHaveIsAddressSetupInitialized from "./view/isAddressSetupInitialized";

export function shouldBehaveLikePriceFeedContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function() {
      shouldBehaveLikeOwner();
    });

    describe("#fetchPrice", function() {
      shouldHaveFetchPrice();
    });

    describe("#isAddressSetupInitialized", function() {
      shouldHaveIsAddressSetupInitialized();
    });
  });

  describe("Effects Functions", function() {
    describe("#setOracle", function () {
      shouldBehaveLikeCanSetOracle();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
