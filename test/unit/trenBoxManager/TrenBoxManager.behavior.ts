import * as effects from "./effects/index";
import * as view from "./view/index";

export function shouldBehaveLikeTrenBoxManagerContract(): void {
  describe("View functions", function () {
    view.shouldHavePublicConstant();

    describe("#owner", function () {
      view.shouldBehaveLikeOwner();
    });

    describe("#isValidFirstRedemptionHint", function () {
      view.shouldBehaveLikeIsValidFirstRedemptionHint();
    });

    describe("#getNominalICR", function () {
      view.shouldBehaveLikeGetNominalICR();
    });

    describe("#getCurrentICR", function () {
      view.shouldBehaveLikeGetCurrentICR();
    });

    describe("#getPendingAssetReward", function () {
      view.shouldBehaveLikeGetPendingAssetReward();
    });

    describe("#getPendingDebtTokenReward", function () {
      view.shouldBehaveLikeGetPendingDebtTokenReward();
    });

    describe("#hasPendingRewards", function () {
      view.shouldBehaveLikeHasPendingRewards();
    });

    describe("#getEntireDebtAndColl", function () {
      view.shouldBehaveLikeGetEntireDebtAndColl();
    });

    describe("#isTrenBoxActive", function () {
      view.shouldBehaveLikeIsTrenBoxActive();
    });

    describe("#getTCR", function () {
      view.shouldBehaveLikeGetTCR();
    });

    describe("#checkRecoveryMode", function () {
      view.shouldBehaveLikeCheckRecoveryMode();
    });

    describe("#getBorrowingRate", function () {
      view.shouldBehaveLikeGetBorrowingRate();
    });

    describe("#getBorrowingFee", function () {
      view.shouldBehaveLikeGetBorrowingFee();
    });

    describe("#getRedemptionFee", function () {
      view.shouldBehaveLikeGetRedemptionFee();
    });

    describe("#getRedemptionFeeWithDecay", function () {
      view.shouldBehaveLikeGetRedemptionFeeWithDecay();
    });

    describe("#getRedemptionRate", function () {
      view.shouldBehaveLikeGetRedemptionRate();
    });

    describe("#getRedemptionRateWithDecay", function () {
      view.shouldBehaveLikeGetRedemptionRateWithDecay();
    });

    describe("#getTrenBoxStatus", function () {
      view.shouldBehaveLikeGetTrenBoxStatus();
    });

    describe("#getTrenBoxStake", function () {
      view.shouldBehaveLikeGetTrenBoxStake();
    });

    describe("#getTrenBoxDebt", function () {
      view.shouldBehaveLikeGetTrenBoxDebt();
    });

    describe("#getTrenBoxColl", function () {
      view.shouldBehaveLikeGetTrenBoxColl();
    });

    describe("#getTrenBoxOwnersCount", function () {
      view.shouldBehaveLikeGetTrenBoxOwnersCount();
    });

    describe("#getNetDebt", function () {
      view.shouldBehaveLikeGetNetDebt();
    });
  });

  describe("Effects Functions", function () {
    describe("#addTrenBoxOwnerToArray", function () {
      effects.shouldBehaveLikeCanAddTrenBoxOwnerToArray();
    });

    describe("#executeFullRedemption", function () {
      effects.shouldBehaveLikeCanExecuteFullRedemption();
    });

    describe("#executePartialRedemption", function () {
      effects.shouldBehaveLikeCanExecutePartialRedemption();
    });

    describe("#finalizeRedemption", function () {
      effects.shouldBehaveLikeCanFinalizeRedemption();
    });

    describe("#updateBaseRateFromRedemption", function () {
      effects.shouldBehaveLikeCanUpdateBaseRateFromRedemption();
    });

    describe("#applyPendingRewards", function () {
      effects.shouldBehaveLikeCanApplyPendingRewards();
    });

    describe("#movePendingTrenBoxRewardsToActivePool", function () {
      effects.shouldBehaveLikeCanMovePendingTrenBoxRewardsToActivePool();
    });

    describe("#updateTrenBoxRewardSnapshots", function () {
      effects.shouldBehaveLikeCanUpdateTrenBoxRewardSnapshots();
    });

    describe("#updateStakeAndTotalStakes", function () {
      effects.shouldBehaveLikeCanUpdateStakeAndTotalStakes();
    });

    describe("#removeStake", function () {
      effects.shouldBehaveLikeCanRemoveStake();
    });

    describe("#redistributeDebtAndColl", function () {
      effects.shouldBehaveLikeCanRedistributeDebtAndColl();
    });

    describe("#updateSystemSnapshots_excludeCollRemainder", function () {
      effects.shouldBehaveLikeCanUpdateSystemSnapshots_excludeCollRemainder();
    });

    describe("#closeTrenBox", function () {
      effects.shouldBehaveLikeCanCloseTrenBox();
    });

    describe("#closeTrenBoxLiquidation", function () {
      effects.shouldBehaveLikeCanCloseTrenBoxLiquidation();
    });

    describe("#sendGasCompensation", function () {
      effects.shouldBehaveLikeCanSendGasCompensation();
    });

    describe("#setTrenBoxStatus", function () {
      effects.shouldBehaveLikeCanSetTrenBoxStatus();
    });

    describe("#increaseTrenBoxColl", function () {
      effects.shouldBehaveLikeCanIncreaseTrenBoxColl();
    });

    describe("#decreaseTrenBoxColl", function () {
      effects.shouldBehaveLikeCanDecreaseTrenBoxColl();
    });

    describe("#increaseTrenBoxDebt", function () {
      effects.shouldBehaveLikeCanIncreaseTrenBoxDebt();
    });

    describe("#decreaseTrenBoxDebt", function () {
      effects.shouldBehaveLikeCanDecreaseTrenBoxDebt();
    });

    describe("#authorizeUpgrade", function () {
      effects.shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
