import shouldBehaveLikeCanAddTrenBoxOwnerToArray from "./addTrenBoxOwnerToArray";
import shouldBehaveLikeCanApplyPendingRewards from "./applyPendingRewards";
import shouldBehaveLikeCanAuthorizeUpgrade from "./authorizeUpgrade";
import shouldBehaveLikeCanCloseTrenBox from "./closeTrenBox";
import shouldBehaveLikeCanCloseTrenBoxLiquidation from "./closeTrenBoxLiquidation";
import shouldBehaveLikeCanDecreaseTrenBoxColl from "./decreaseTrenBoxColl";
import shouldBehaveLikeCanDecreaseTrenBoxDebt from "./decreaseTrenBoxDebt";
import shouldBehaveLikeCanExecuteFullRedemption from "./executeFullRedemption";
import shouldBehaveLikeCanExecutePartialRedemption from "./executePartialRedemption";
import shouldBehaveLikeCanFinalizeRedemption from "./finalizeRedemption";
import shouldBehaveLikeCanIncreaseTrenBoxColl from "./increaseTrenBoxColl";
import shouldBehaveLikeCanIncreaseTrenBoxDebt from "./increaseTrenBoxDebt";
import shouldBehaveLikeCanMovePendingTrenBoxRewardsFromLiquidatedToActive from "./movePendingTrenBoxRewardsFromLiquidatedToActive";
import shouldBehaveLikeCanRedistributeDebtAndColl from "./redistributeDebtAndColl";
import shouldBehaveLikeCanRemoveStake from "./removeStake";
import shouldBehaveLikeCanSendGasCompensation from "./sendGasCompensation";
import shouldBehaveLikeCanSetTrenBoxStatus from "./setTrenBoxStatus";
import shouldBehaveLikeCanUpdateBaseRateFromRedemption from "./updateBaseRateFromRedemption";
import shouldBehaveLikeCanUpdateStakeAndTotalStakes from "./updateStakeAndTotalStakes";
import shouldBehaveLikeCanUpdateSystemSnapshots_excludeCollRemainder from "./updateSystemSnapshots_excludeCollRemainder";
import shouldBehaveLikeCanUpdateTrenBoxRewardSnapshots from "./updateTrenBoxRewardSnapshots";

export {
  shouldBehaveLikeCanAddTrenBoxOwnerToArray,
  shouldBehaveLikeCanExecuteFullRedemption,
  shouldBehaveLikeCanExecutePartialRedemption,
  shouldBehaveLikeCanFinalizeRedemption,
  shouldBehaveLikeCanUpdateBaseRateFromRedemption,
  shouldBehaveLikeCanApplyPendingRewards,
  shouldBehaveLikeCanMovePendingTrenBoxRewardsFromLiquidatedToActive,
  shouldBehaveLikeCanUpdateTrenBoxRewardSnapshots,
  shouldBehaveLikeCanUpdateStakeAndTotalStakes,
  shouldBehaveLikeCanRemoveStake,
  shouldBehaveLikeCanRedistributeDebtAndColl,
  shouldBehaveLikeCanUpdateSystemSnapshots_excludeCollRemainder,
  shouldBehaveLikeCanCloseTrenBox,
  shouldBehaveLikeCanCloseTrenBoxLiquidation,
  shouldBehaveLikeCanSendGasCompensation,
  shouldBehaveLikeCanSetTrenBoxStatus,
  shouldBehaveLikeCanIncreaseTrenBoxColl,
  shouldBehaveLikeCanDecreaseTrenBoxColl,
  shouldBehaveLikeCanIncreaseTrenBoxDebt,
  shouldBehaveLikeCanDecreaseTrenBoxDebt,
  shouldBehaveLikeCanAuthorizeUpgrade,
};
