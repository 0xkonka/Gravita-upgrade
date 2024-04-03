import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeOwner from "./view/owner";
import shouldBehaveLikeGetCollateral from "./view/getCollateral";
import shouldBehaveLikeGetAllCollateral from "./view/getAllCollateral";
import shouldBehaveLikeGetTotalDebtTokenDeposits from "./view/getTotalDebtTokenDeposits";
import shouldBehaveLikeGetDepositorTRENGain from "./view/getDepositorTRENGain";
import shouldBehaveLikeGetSnapshot from "./view/getSnapShot";
import shouldBehaveLikeGetCompoundedDebtTokenDeposits from "./view/getCompoundedDebtTokenDeposits";

import shouldBehaveLikeCanAddCollateralType from "./effects/addCollateralType";
import shouldBehaveLikeCanProvideToSP from "./effects/provideToSP";
import shouldBehaveLikeCanWithdrawFromSP from "./effects/withdrawFromSP";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";
import shouldBehaveLikeOffset from "./effects/offset";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";

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


