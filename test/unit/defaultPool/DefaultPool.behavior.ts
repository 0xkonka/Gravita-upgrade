import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanDecreaseDebt from "./effects/decreaseDebt";
import shouldBehaveLikeCanIncreaseDebt from "./effects/increaseDebt";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldBehaveLikeCanSendAssetToActivePool from "./effects/sendAssetToActivePool";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetAssetBalance from "./view/getAssetBalance";
import shouldBehaveLikeGetDebtTokenBalance from "./view/getDebtTokenBalance";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeDefaultPoolContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
    describe("#name", function () {
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

    describe("#increaseDebt", function () {
      shouldBehaveLikeCanIncreaseDebt();
    });

    describe("#decreaseDebt", function () {
      shouldBehaveLikeCanDecreaseDebt();
    });

    describe("#receivedERC20", function () {
      shouldBehaveLikeCanReceivedERC20();
    });

    // describe("#sendAssetToActivePool", function () {
    //   shouldBehaveLikeCanSendAssetToActivePool();
    // });

    // describe("#authorizeUpgrade", function () {
    //   shouldBehaveLikeCanAuthorizeUpgrade();
    // });
  });
}
