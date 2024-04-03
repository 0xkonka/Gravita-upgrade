import shouldHaveName from "./name";
import shouldHaveGracePeriod from "./gracePeriod";
import shouldHaveMinimumDelay from "./minimumDelay";
import shouldHaveMaximumDelay from "./maximumDelay";

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
