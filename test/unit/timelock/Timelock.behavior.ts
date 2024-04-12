import shouldBehaveLikeCanAcceptAdmin from "./effects/acceptAdmin";
import shouldBehaveLikeCanCancelTransaction from "./effects/cancelTransaction";
import shouldBehaveLikeCanExecuteTransaction from "./effects/executeTransaction";
import shouldBehaveLikeCanQueueTransaction from "./effects/queueTransaction";
import shouldBehaveLikeCanReceiveEth from "./effects/receive";
import shouldBehaveLikeCanSetDelay from "./effects/setDelay";
import shouldBehaveLikeCanSetPendingAdmin from "./effects/setPendingAdmin";
import shouldBehaveLikeHaveAdmin from "./view/admin";
import shouldHavePublicConstant from "./view/constants";
import shouldBehaveLikeHaveDelay from "./view/delay";
import shouldBehaveLikeHavePendingAdmin from "./view/pendingAdmin";

export function shouldBehaveLikeTimelockContract(): void {
  describe.only("View Functions", function () {
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

    describe("#executeTransaction", function () {
      shouldBehaveLikeCanExecuteTransaction();
    });

    describe("#cancelTransaction", function () {
      shouldBehaveLikeCanCancelTransaction();
    });

    describe("#setPendingAdmin", function () {
      shouldBehaveLikeCanSetPendingAdmin();
    });

    describe("#acceptAdmin", function () {
      shouldBehaveLikeCanAcceptAdmin();
    });

    describe("#setDelay", function () {
      shouldBehaveLikeCanSetDelay();
    });
  });
}
