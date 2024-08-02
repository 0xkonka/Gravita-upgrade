import shouldBehaveLikeCanAddNewAndInitializeCollateral from "./effects/addAndInitializeNewCollateral";
import shouldBehaveLikeCanAddNewCollateral from "./effects/addNewCollateral";
import shouldBehaveLikeCanSetBorrowingFee from "./effects/setBorrowingFee";
import shouldBehaveLikeCanSetCollateralParameters from "./effects/setCollateralParameters";
import shouldBehaveLikeCanSetCommunityIssuance from "./effects/setCommunityIssuance";
import shouldBehaveLikeCanSetCriticalCollateralRatio from "./effects/setCriticalCollateralRatio";
import shouldBehaveLikeCanSetIsActive from "./effects/setIsActive";
import shouldBehaveLikeCanSetMinNetDebt from "./effects/setMinNetDebt";
import shouldBehaveLikeCanSetMinimumCollateralRatio from "./effects/setMinimumCollateralRatio";
import shouldBehaveLikeCanSetMintCap from "./effects/setMintCap";
import shouldBehaveLikeCanSetPercentDivisor from "./effects/setPercentDivisor";
import shouldBehaveLikeCanSetRedemptionBlockTimestamp from "./effects/setRedemptionBlockTimestamp";
import shouldBehaveLikeCanSetRedemptionFeeFloor from "./effects/setRedemptionFeeFloor";
import shouldBehaveLikeCanSetTRENStaking from "./effects/setTRENStaking";
import shouldHavePublicConstant from "./view/constants";
import shouldHaveGetBorrowingFee from "./view/getBorrowingFee";
import shouldHaveGetCCR from "./view/getCriticalCollateralRate";
import shouldHaveGetDebtTokenGasCompensation from "./view/getDebtTokenGasCompensation";
import shouldHaveGetIndex from "./view/getIndex";
import shouldHaveGetIndices from "./view/getIndices";
import shouldHaveGetIsActive from "./view/getIsActive";
import shouldHaveGetMinNetDebt from "./view/getMinNetDebt";
import shouldHaveGetMCR from "./view/getMinimalCollateralRate";
import shouldHaveGetMintCap from "./view/getMintCap";
import shouldHaveGetPercentDivisor from "./view/getPercentDivisor";
import shouldHaveGetRedemptionBlockTimestamp from "./view/getRedemptionBlockTimestamp";
import shouldHaveGetRedemptionFeeFloor from "./view/getRedemptionFeeFloor";
import shouldHaveGetTotalAssetDebt from "./view/getTotalAssetDebt";
import shouldHaveValidCollateral from "./view/getValidCollateral";
import shouldHaveIsSetupInitialized from "./view/isSetupInitialized";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeAdminContractContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });

    describe("#getValidCollateral", function () {
      shouldHaveValidCollateral();
    });

    describe("#isSetupInitialized", function () {
      shouldHaveIsSetupInitialized();
    });

    describe("#getIsActive", function () {
      shouldHaveGetIsActive();
    });

    describe("#getIndex", function () {
      shouldHaveGetIndex();
    });

    describe("#getIndices", function () {
      shouldHaveGetIndices();
    });

    describe("#getMcr", function () {
      shouldHaveGetMCR();
    });

    describe("#getCcr", function () {
      shouldHaveGetCCR();
    });

    describe("#getDebtTokenGasCompensation", function () {
      shouldHaveGetDebtTokenGasCompensation();
    });

    describe("#getMinNetDebt", function () {
      shouldHaveGetMinNetDebt();
    });

    describe("#getPercentDivisor", function () {
      shouldHaveGetPercentDivisor();
    });

    describe("#getBorrowingFee", function () {
      shouldHaveGetBorrowingFee();
    });

    describe("#getRedemptionFeeFloor", function () {
      shouldHaveGetRedemptionFeeFloor();
    });

    describe("#getRedemptionBlockTimestamp", function () {
      shouldHaveGetRedemptionBlockTimestamp();
    });

    describe("#getMintCap", function () {
      shouldHaveGetMintCap();
    });

    describe("#getTotalAssetDebt", function () {
      shouldHaveGetTotalAssetDebt();
    });
  });

  describe("Effects Functions", function () {
    describe("#setBorrowingFee", function () {
      shouldBehaveLikeCanSetBorrowingFee();
    });

    describe("#setCCR", function () {
      shouldBehaveLikeCanSetCriticalCollateralRatio();
    });

    describe("#setMCR", function () {
      shouldBehaveLikeCanSetMinimumCollateralRatio();
    });

    describe("#setMinNetDebt", function () {
      shouldBehaveLikeCanSetMinNetDebt();
    });

    describe("#setMintCap", function () {
      shouldBehaveLikeCanSetMintCap();
    });

    describe("#setPercentDivisor", function () {
      shouldBehaveLikeCanSetPercentDivisor();
    });

    describe("#setRedemptionFeeFloor", function () {
      shouldBehaveLikeCanSetRedemptionFeeFloor();
    });

    describe("#setRedemptionBlockTimestamp", function () {
      shouldBehaveLikeCanSetRedemptionBlockTimestamp();
    });

    describe("#addNewCollateral", function () {
      shouldBehaveLikeCanAddNewCollateral();
    });

    describe("#addAndInitializeNewCollateral", function () {
      shouldBehaveLikeCanAddNewAndInitializeCollateral();
    });

    describe("#setCollateralParameters", function () {
      shouldBehaveLikeCanSetCollateralParameters();
    });

    describe("#setIsActive", function () {
      shouldBehaveLikeCanSetIsActive();
    });

    describe("#setCommunityIssuance", function () {
      shouldBehaveLikeCanSetCommunityIssuance();
    });

    describe("#setTRENStaking", function () {
      shouldBehaveLikeCanSetTRENStaking();
    });
  });
}
