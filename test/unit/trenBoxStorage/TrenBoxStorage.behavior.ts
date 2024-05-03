import shouldBehaveLikeCanDecreaseActiveCollateral from "./effects/decreaseActiveCollateral";
import shouldBehaveLikeCanDecreaseActiveDebt from "./effects/decreaseActiveDebt";
import shouldBehaveLikeCanDecreaseLiquidatedCollateral from "./effects/decreaseLiquidatedCollateral";
import shouldBehaveLikeCanDecreaseLiquidatedDebt from "./effects/decreaseLiquidatedDebt";
import shouldBehaveLikeCanIncreaseActiveCollateral from "./effects/increaseActiveCollateral";
import shouldBehaveLikeCanIncreaseActiveDebt from "./effects/increaseActiveDebt";
import shouldBehaveLikeCanIncreaseLiquidatedCollateral from "./effects/increaseLiquidatedCollateral";
import shouldBehaveLikeCanIncreaseLiquidatedDebt from "./effects/increaseLiquidatedDebt";
import shouldBehaveLikeCanSendAsset from "./effects/sendAsset";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetActiveCollateralBalance from "./view/getActiveCollateralBalance";
import shouldBehaveLikeGetActiveDebtBalance from "./view/getActiveDebtBalance";
import shouldBehaveLikeGetLiquidatedCollateralBalance from "./view/getLiquidatedCollateralBalance";
import shouldBehaveLikeGetLiquidatedDebtBalance from "./view/getLiquidatedDebtBalance";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeTrenBoxStorageContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#name", function () {
      shouldHaveName();
    });

    describe("#getAssetBalance", function () {
      shouldBehaveLikeGetActiveCollateralBalance();
    });

    describe("#getActiveDebtBalance", function () {
      shouldBehaveLikeGetActiveDebtBalance();
    });

    describe("#getLiquidatedCollateralBalance", function () {
      shouldBehaveLikeGetLiquidatedCollateralBalance();
    });

    describe("#getLiquidatedDebtBalance", function () {
      shouldBehaveLikeGetLiquidatedDebtBalance();
    });
  });

  describe("Effects Functions", function () {
    describe("#increaseActiveDebt", function () {
      shouldBehaveLikeCanIncreaseActiveDebt();
    });

    describe("#decreaseActiveDebt", function () {
      shouldBehaveLikeCanDecreaseActiveDebt();
    });

    describe("#increaseLiquidatedDebt", function () {
      shouldBehaveLikeCanIncreaseLiquidatedDebt();
    });

    describe("#decreaseLiquidatedDebt", function () {
      shouldBehaveLikeCanDecreaseLiquidatedDebt();
    });

    describe("#increaseActiveCollateral", function () {
      shouldBehaveLikeCanIncreaseActiveCollateral();
    });

    describe("#decreaseActiveCollateral", function () {
      shouldBehaveLikeCanDecreaseActiveCollateral();
    });

    describe("#increaseLiquidatedCollateral", function () {
      shouldBehaveLikeCanIncreaseLiquidatedCollateral();
    });

    describe("#decreaseLiquidatedCollateral", function () {
      shouldBehaveLikeCanDecreaseLiquidatedCollateral();
    });

    describe("#sendAsset", function () {
      shouldBehaveLikeCanSendAsset();
    });
  });
}
