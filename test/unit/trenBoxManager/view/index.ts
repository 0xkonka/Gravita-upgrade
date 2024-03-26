import shouldHavePublicConstant from "./constants";
import shouldBehaveLikeOwner from "./owner";
import shouldHaveIsSetupInitialized from "./isSetupInitialized";
import shouldBehaveLikeIsValidFirstRedemptionHint from "./isValidFirstRedemptionHint";
import shouldBehaveLikeGetNominalICR from "./getNominalICR";
import shouldBehaveLikeGetCurrentICR from "./getCurrentICR";
import shouldBehaveLikeGetPendingAssetReward from "./getPendingAssetReward";
import shouldBehaveLikeGetPendingDebtTokenReward from "./getPendingDebtTokenReward";
import shouldBehaveLikeHasPendingRewards from "./hasPendingRewards";
import shouldBehaveLikeGetEntireDebtAndColl from "./getEntireDebtAndColl";
import shouldBehaveLikeIsTrenBoxActive from "./isTrenBoxActive";
import shouldBehaveLikeGetTCR from "./getTCR";
import shouldBehaveLikeCheckRecoveryMode from "./checkRecoveryMode";
import shouldBehaveLikeGetBorrowingRate from "./getBorrowingRate";
import shouldBehaveLikeGetBorrowingFee from "./getBorrowingFee";
import shouldBehaveLikeGetRedemptionFee from "./getRedemptionFee";
import shouldBehaveLikeGetRedemptionFeeWithDecay from "./getRedemptionFeeWithDecay";
import shouldBehaveLikeGetRedemptionRate from "./getRedemptionRate";
import shouldBehaveLikeGetRedemptionRateWithDecay from "./getRedemptionRateWithDecay";
import shouldBehaveLikeGetTrenBoxStatus from "./getTrenBoxStatus";
import shouldBehaveLikeGetTrenBoxStake from "./getTrenBoxStake";
import shouldBehaveLikeGetTrenBoxDebt from "./getTrenBoxDebt";
import shouldBehaveLikeGetTrenBoxColl from "./getTrenBoxColl";
import shouldBehaveLikeGetTrenBoxOwnersCount from "./getTrenBoxOwnersCount";
import shouldBehaveLikeGetTrenBoxFromTrenBoxOwnersArray from "./getTrenBoxFromTrenBoxOwnersArray";
import shouldBehaveLikeGetNetDebt from "./getNetDebt";

export {
  shouldHavePublicConstant,
  shouldBehaveLikeOwner,
  shouldHaveIsSetupInitialized,
  shouldBehaveLikeIsValidFirstRedemptionHint,
  shouldBehaveLikeGetNominalICR,
  shouldBehaveLikeGetCurrentICR,
  shouldBehaveLikeGetPendingAssetReward,
  shouldBehaveLikeGetPendingDebtTokenReward,
  shouldBehaveLikeHasPendingRewards,
  shouldBehaveLikeGetEntireDebtAndColl,
  shouldBehaveLikeIsTrenBoxActive,
  shouldBehaveLikeGetTCR,
  shouldBehaveLikeCheckRecoveryMode,
  shouldBehaveLikeGetBorrowingRate,
  shouldBehaveLikeGetBorrowingFee,
  shouldBehaveLikeGetRedemptionFee,
  shouldBehaveLikeGetRedemptionFeeWithDecay,
  shouldBehaveLikeGetRedemptionRate,
  shouldBehaveLikeGetRedemptionRateWithDecay,
  shouldBehaveLikeGetTrenBoxStatus,
  shouldBehaveLikeGetTrenBoxStake,
  shouldBehaveLikeGetTrenBoxDebt,
  shouldBehaveLikeGetTrenBoxColl,
  shouldBehaveLikeGetTrenBoxOwnersCount,
  shouldBehaveLikeGetTrenBoxFromTrenBoxOwnersArray,
  shouldBehaveLikeGetNetDebt,
}