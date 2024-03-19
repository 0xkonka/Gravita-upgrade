import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanDecreaseDebt from "./effects/decreaseDebt";
import shouldBehaveLikeCanIncreaseDebt from "./effects/increaseDebt";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldBehaveLikeCanSendAsset from "./effects/sendAsset";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetAssetBalance from "./view/getAssetBalance";
import shouldBehaveLikeGetDebtTokenBalance from "./view/getDebtTokenBalance";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeActivePoolContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#getAssetBalance", function () {
      shouldBehaveLikeGetAssetBalance();
    });

    describe("#getDebtTokenBalance", function () {
      shouldBehaveLikeGetDebtTokenBalance();
    });
  });

  describe("Effects Functions", function () {
    describe("#decreaseDebt", function () {
      shouldBehaveLikeCanDecreaseDebt();
    });

    describe("#increaseDebt", function () {
      shouldBehaveLikeCanIncreaseDebt();
    });

    describe("#receivedERC20", function () {
      shouldBehaveLikeCanReceivedERC20();
    });

    describe("#sendAsset", function () {
      shouldBehaveLikeCanSendAsset();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
