import shouldHaveGracePeriod from "./gracePeriod";
import shouldHaveMaximumDelay from "./maximumDelay";
import shouldHaveMinimumDelay from "./minimumDelay";
import shouldHaveName from "./name";

export default function shouldHavePublicConstant(): void {
  describe("Constants", function () {
    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("#GRACE_PERIOD", function () {
      shouldHaveGracePeriod();
    });

    describe("#MINIMUM_DELAY", function () {
      shouldHaveMinimumDelay();
    });

    describe("#MAXIMUM_DELAY", function () {
      shouldHaveMaximumDelay();
    });
  });
}
