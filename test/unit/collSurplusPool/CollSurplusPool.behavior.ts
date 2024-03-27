import shouldBehaveLikeCanAccountSurplus from "./effects/accountSurplus";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanClaimColl from "./effects/claimColl";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetAssetBalance from "./view/getAssetBalance";
import shouldBehaveLikeGegetCollateral from "./view/getCollateral";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeCollSurplusPoolPoolContract(): void {
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

    describe("#getCollateral", function () {
      shouldBehaveLikeGegetCollateral();
    });
  });

  describe("Effects Functions", function () {
    describe("#accountSurplus", function () {
      shouldBehaveLikeCanAccountSurplus();
    });

    describe("#claimColl", function () {
      shouldBehaveLikeCanClaimColl();
    });

    describe("#receivedERC20", function () {
      shouldBehaveLikeCanReceivedERC20();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
