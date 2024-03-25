import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeContains from "./view/contains";
// import shouldBehaveLikeGetDebtTokenBalance from "./view/getDebtTokenBalance";
import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeSortedTrenBoxesContract(): void {
  describe("View Functions", function () {
    describe("#owner", function () {
      shouldBehaveLikeOwner();
    });
    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#contains", function () {
      shouldBehaveLikeContains();
    });

    // describe("#isEmpty", function () {
    //   shouldBehaveLikeGetDebtTokenBalance();
    // });

    // describe("#getSize", function () {
    //   shouldBehaveLikeGetAssetBalance();
    // });

    // describe("#getFirst", function () {
    //   shouldBehaveLikeGetDebtTokenBalance();
    // });

    // describe("#getLast", function () {
    //   shouldBehaveLikeGetAssetBalance();
    // });

    // describe("#getNext", function () {
    //   shouldBehaveLikeGetDebtTokenBalance();
    // });

    // describe("#getPrev", function () {
    //   shouldBehaveLikeGetAssetBalance();
    // });

    // describe("#validInsertPosition", function () {
    //   shouldBehaveLikeGetDebtTokenBalance();
    // });

    // describe("#findInsertPosition", function () {
    //   shouldBehaveLikeGetDebtTokenBalance();
    // });
  });

  describe("Effects Functions", function () {
    // describe("#insert", function () {
    //   shouldBehaveLikeCanDecreaseDebt();
    // });

    // describe("#remove", function () {
    //   shouldBehaveLikeCanIncreaseDebt();
    // });

    // describe("#reinsert", function () {
    //   shouldBehaveLikeCanReceivedERC20();
    // });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
