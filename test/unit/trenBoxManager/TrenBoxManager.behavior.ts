import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeOwner from "./view/owner";
import shouldHaveIsSetupInitialized from "./view/isSetupInitialized";
import shouldBehaveLikeIsValidFirstRedemptionHint from "./view/isValidFirstRedemptionHint";
import shouldBehaveLikeGetNominalICR from "./view/getNominalICR";
import shouldBehaveLikeGetCurrentICR from "./view/getCurrentICR";
import shouldBehaveLikeGetPendingAssetReward from "./view/getPendingAssetReward";
import shouldBehaveLikeGetPendingDebtTokenReward from "./view/getPendingDebtTokenReward";
import shouldBehaveLikeHasPendingRewards from "./view/hasPendingRewards";
import shouldBehaveLikeGetEntireDebtAndColl from "./view/getEntireDebtAndColl";
import shouldBehaveLikeIsTrenBoxActive from "./view/isTrenBoxActive";
import shouldBehaveLikeGetTCR from "./view/getTCR";
import shouldBehaveLikeCheckRecoveryMode from "./view/checkRecoveryMode";
import shouldBehaveLikeGetBorrowingRate from "./view/getBorrowingRate";
import shouldBehaveLikeGetBorrowingFee from "./view/getBorrowingFee";
import shouldBehaveLikeGetRedemptionFee from "./view/getRedemptionFee";
import shouldBehaveLikeGetRedemptionFeeWithDecay from "./view/getRedemptionFeeWithDecay";
import shouldBehaveLikeGetRedemptionRate from "./view/getRedemptionRate";
import shouldBehaveLikeGetRedemptionRateWithDecay from "./view/getRedemptionRateWithDecay";

export function shouldBehaveLikeTrenBoxManagerContract(): void {
  describe("View functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    })

    describe("#IsSetupInitialized", function () {
      shouldHaveIsSetupInitialized();
    })

    describe("#isValidFirstRedemptionHint", function () {
      shouldBehaveLikeIsValidFirstRedemptionHint();
    });

    describe("#getNominalICR", function () {
      shouldBehaveLikeGetNominalICR();
    });

    describe("#getCurrentICR", function () {
      shouldBehaveLikeGetCurrentICR();
    });

    describe("#getPendingAssetReward", function () {
      shouldBehaveLikeGetPendingAssetReward();
    });

    describe("#getPendingDebtTokenReward", function () {
      shouldBehaveLikeGetPendingDebtTokenReward();
    });

    describe("#hasPendingRewards", function () {
      shouldBehaveLikeHasPendingRewards();
    });

    describe("#getEntireDebtAndColl", function () {
      shouldBehaveLikeGetEntireDebtAndColl();
    });

    describe("#isTrenBoxActive", function () {
      shouldBehaveLikeIsTrenBoxActive();
    });

    describe("#getTCR", function () {
      shouldBehaveLikeGetTCR();
    });

    describe("#checkRecoveryMode", function () {
      shouldBehaveLikeCheckRecoveryMode();
    });
    
    describe("#getBorrowingRate", function () {
      shouldBehaveLikeGetBorrowingRate();
    });

    describe("#getBorrowingFee", function () {
      shouldBehaveLikeGetBorrowingFee();
    });

    describe("#getRedemptionFee", function () {
      shouldBehaveLikeGetRedemptionFee();
    });

    describe("#getRedemptionFeeWithDecay", function () {
      shouldBehaveLikeGetRedemptionFeeWithDecay();
    });

    describe("#getRedemptionRate", function () {
      shouldBehaveLikeGetRedemptionRate();
    });

    describe("#getRedemptionRateWithDecay", function () {
      shouldBehaveLikeGetRedemptionRateWithDecay();
    });
  });

  describe("Effects Functions", function () {
    // describe("#decreaseDebt", function () {
    //   shouldBehaveLikeCanDecreaseDebt();
    // });

    
  });
}
