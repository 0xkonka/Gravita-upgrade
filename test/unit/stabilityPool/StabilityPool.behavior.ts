import shouldBehaveLikeCanAddCollateralType from "./effects/addCollateralType";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeOffset from "./effects/offset";
import shouldBehaveLikeCanProvideToSP from "./effects/provideToSP";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldBehaveLikeCanWithdrawFromSP from "./effects/withdrawFromSP";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeGetAllCollateral from "./view/getAllCollateral";
import shouldBehaveLikeGetCollateral from "./view/getCollateral";
import shouldBehaveLikeGetCompoundedDebtTokenDeposits from "./view/getCompoundedDebtTokenDeposits";
import shouldBehaveLikeGetDepositorTRENGain from "./view/getDepositorTRENGain";
import shouldBehaveLikeGetSnapshot from "./view/getSnapShot";
import shouldBehaveLikeGetTotalDebtTokenDeposits from "./view/getTotalDebtTokenDeposits";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeStabilityPoolContract(): void {
  describe("View functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
    describe("#NAME", function () {
      shouldHaveName();
    });
    describe("#getCollateral", function () {
      shouldBehaveLikeGetCollateral();
    });
    describe("#getAllCollateral", function () {
      shouldBehaveLikeGetAllCollateral();
    });
    describe("#getTotalDebtTokenDeposits", function () {
      shouldBehaveLikeGetTotalDebtTokenDeposits();
    });
    describe("#getDepositorTRENGain", function () {
      shouldBehaveLikeGetDepositorTRENGain();
    });
    describe("#getSnapshot", function () {
      shouldBehaveLikeGetSnapshot();
    });
    describe("#getCompoundedDebtTokenDeposits", function () {
      shouldBehaveLikeGetCompoundedDebtTokenDeposits();
    });
  });

  describe("Effects Functions", function () {
    describe("#addCollateralType", function () {
      shouldBehaveLikeCanAddCollateralType();
    });
    describe("#receivedERC20", function () {
      shouldBehaveLikeCanReceivedERC20();
    });
    describe("#provideToSP", function () {
      shouldBehaveLikeCanProvideToSP();
    });
    describe("#withdrawFromSP", function () {
      shouldBehaveLikeCanWithdrawFromSP();
    });
    describe("#offset", function () {
      shouldBehaveLikeOffset();
    });
    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
