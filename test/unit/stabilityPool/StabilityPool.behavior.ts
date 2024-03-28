import * as effects from "./effects/index";

// import * as view from "./view/index";

export function shouldBehaveLikeStabilityPoolContract(): void {
  // describe("View functions", function () {
  //   view.shouldHavePublicConstant();

  //   describe("#owner", function () {
  //     view.shouldBehaveLikeOwner();
  //   });

  // });

  describe("Effects Functions", function () {
    describe("#addCollateralType", function () {
      effects.shouldBehaveLikeCanAddCollateralType();
    });
    describe("#provideToSP", function () {
      effects.shouldBehaveLikeCanProvideToSP();
    });
    describe("#receivedERC20", function () {
      effects.shouldBehaveLikeCanReceivedERC20();
    });
    describe("#authorizeUpgrade", function () {
      effects.shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
