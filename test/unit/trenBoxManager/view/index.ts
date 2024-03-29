import shouldBehaveLikeCheckRecoveryMode from "./checkRecoveryMode";
import shouldHavePublicConstant from "./constants";
import shouldBehaveLikeGetBorrowingFee from "./getBorrowingFee";
import shouldBehaveLikeGetBorrowingRate from "./getBorrowingRate";
import shouldBehaveLikeGetCurrentICR from "./getCurrentICR";
import shouldBehaveLikeGetEntireDebtAndColl from "./getEntireDebtAndColl";
import shouldBehaveLikeGetNetDebt from "./getNetDebt";
import shouldBehaveLikeGetNominalICR from "./getNominalICR";
import shouldBehaveLikeGetPendingAssetReward from "./getPendingAssetReward";
import shouldBehaveLikeGetPendingDebtTokenReward from "./getPendingDebtTokenReward";
import shouldBehaveLikeGetRedemptionFee from "./getRedemptionFee";
import shouldBehaveLikeGetRedemptionFeeWithDecay from "./getRedemptionFeeWithDecay";
import shouldBehaveLikeGetRedemptionRate from "./getRedemptionRate";
import shouldBehaveLikeGetRedemptionRateWithDecay from "./getRedemptionRateWithDecay";
import shouldBehaveLikeGetTCR from "./getTCR";
import shouldBehaveLikeGetTrenBoxColl from "./getTrenBoxColl";
import shouldBehaveLikeGetTrenBoxDebt from "./getTrenBoxDebt";
import shouldBehaveLikeGetTrenBoxFromTrenBoxOwnersArray from "./getTrenBoxFromTrenBoxOwnersArray";
import shouldBehaveLikeGetTrenBoxOwnersCount from "./getTrenBoxOwnersCount";
import shouldBehaveLikeGetTrenBoxStake from "./getTrenBoxStake";
import shouldBehaveLikeGetTrenBoxStatus from "./getTrenBoxStatus";
import shouldBehaveLikeHasPendingRewards from "./hasPendingRewards";
import shouldHaveIsSetupInitialized from "./isSetupInitialized";
import shouldBehaveLikeIsTrenBoxActive from "./isTrenBoxActive";
import shouldBehaveLikeIsValidFirstRedemptionHint from "./isValidFirstRedemptionHint";
import shouldBehaveLikeOwner from "./owner";

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
};
