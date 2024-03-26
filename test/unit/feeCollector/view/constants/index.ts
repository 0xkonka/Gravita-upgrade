import shouldHaveName from "./name";

export default function shouldHavePublicConstant(): void {
  describe("View Functions", function () {
    describe("#NAME", function () {
      shouldHaveName();
    });
  });
}
