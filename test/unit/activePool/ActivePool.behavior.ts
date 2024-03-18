import shouldBehaveLikeGetAssetBalance from "./view/getAssetBalance";
import shouldBehaveLikeGetDebtTokenBalance from "./view/getDebtTokenBalance";
import shouldBehaveLikeCanSendAsset from "./effects/sendAsset";
import shouldBehaveLikeCanIncreaseDebt from "./effects/increaseDebt";
import shouldBehaveLikeCanDecreaseDebt from "./effects/decreaseDebt";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";

export function shouldBehaveLikeActivePoolContract(): void {
  describe("View Functions", function () {
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
