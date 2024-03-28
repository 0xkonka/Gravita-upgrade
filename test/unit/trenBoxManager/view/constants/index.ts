import shouldHaveBeta from "./beta";
import shouldHaveMinuteDecayFactor from "./minuteDecayFactor";
import shouldHaveName from "./name";
import shouldHaveSecondsInOneMinute from "./secondsInOneMinute";

export default function shouldHavePublicConstant(): void {
  describe("Constants", function () {
    describe("#SECONDS_IN_ONE_MINUTE", function () {
      shouldHaveSecondsInOneMinute();
    });

    describe("#NAME", function () {
      shouldHaveName();
    });

    describe("MINUTE_DECAY_FACTOR", function () {
      shouldHaveMinuteDecayFactor();
    });

    describe("BETA", function () {
      shouldHaveBeta();
    });
  });
}
