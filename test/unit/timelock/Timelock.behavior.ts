import shouldBehaveLikeCanQueueTransaction from "./effects/queueTransaction";
import shouldBehaveLikeCanReceiveEth from "./effects/receive";
import shouldBehaveLikeHaveAdmin from "./view/admin";
import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeHaveDelay from "./view/delay";
import shouldBehaveLikeHavePendingAdmin from "./view/pendingAdmin";

export function shouldBehaveLikeTimelockContract(): void {
  describe("View Functions", function () {
    shouldHavePublicConstant();

    describe("#admin", function () {
      shouldBehaveLikeHaveAdmin();
    });

    describe("#delay", function () {
      shouldBehaveLikeHaveDelay();
    });

    describe("#pendingAdmin", function () {
      shouldBehaveLikeHavePendingAdmin();
    });
  });

  describe("Effects Functions", function () {
    describe("#receive", function () {
      shouldBehaveLikeCanReceiveEth();
    });

    describe("#queueTransaction", function () {
      shouldBehaveLikeCanQueueTransaction();
    });
  });
}
