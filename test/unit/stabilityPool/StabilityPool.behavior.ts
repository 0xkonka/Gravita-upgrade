import shouldBehaveLikeCanAddCollateralType from "./effects/addCollateralType";
import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeCanProvideToSP from "./effects/provideToSP";
import shouldBehaveLikeCanReceivedERC20 from "./effects/receivedERC20";

// import shouldHavePublicConstant from "./view/Contracts";
// import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeStabilityPoolContract(): void {
  // describe("View functions", function () {
  //   shouldHavePublicConstant();

  //   describe("#owner", function () {
  //     shouldBehaveLikeOwner();
  //   });
  // });

  describe("Effects Functions", function () {
    describe("#addCollateralType", function () {
      shouldBehaveLikeCanAddCollateralType();
    });
    describe("#provideToSP", function () {
      shouldBehaveLikeCanProvideToSP();
    });
    describe("#receivedERC20", function () {
      shouldBehaveLikeCanReceivedERC20();
    });
    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
