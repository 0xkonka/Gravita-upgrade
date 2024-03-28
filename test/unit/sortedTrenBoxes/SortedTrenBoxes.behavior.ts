import shouldBehaveLikeCanAuthorizeUpgrade from "./effects/authorizeUpgrade";
import shouldBehaveLikeInsert from "./effects/insert";
import shouldBehaveLikeCanReInsert from "./effects/reinsert";
import shouldBehaveLikeCanRemove from "./effects/remove";
import shouldHaveName from "./view/constants/name";
import shouldBehaveLikeContains from "./view/contains";
import shouldBehaveLikeFindValidInsertPosition from "./view/findInsertPosition";
import shouldBehaveLikeGetNodes from "./view/getNodes";
import shouldBehaveLikeGetSize from "./view/getSize";
import shouldBehaveLikeIsEmpty from "./view/isEmpty";
import shouldBehaveLikeOwner from "./view/owner";
import shouldBehaveLikeValidInsertPosition from "./view/validInsertPosition";

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

    describe("#isEmpty", function () {
      shouldBehaveLikeIsEmpty();
    });

    describe("#getSize", function () {
      shouldBehaveLikeGetSize();
    });

    describe("#getNodes", function () {
      shouldBehaveLikeGetNodes();
    });

    describe("#validInsertPosition", function () {
      shouldBehaveLikeValidInsertPosition();
    });

    describe("#findInsertPosition", function () {
      shouldBehaveLikeFindValidInsertPosition();
    });
  });

  describe("Effects Functions", function () {
    describe("#remove", function () {
      shouldBehaveLikeCanRemove();
    });

    describe("#insert", function () {
      shouldBehaveLikeInsert();
    });

    describe("#reinsert", function () {
      shouldBehaveLikeCanReInsert();
    });

    describe("#authorizeUpgrade", function () {
      shouldBehaveLikeCanAuthorizeUpgrade();
    });
  });
}
