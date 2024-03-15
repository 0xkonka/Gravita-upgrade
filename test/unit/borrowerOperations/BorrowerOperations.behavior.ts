import shouldBehaveLikeOwner from "./view/owner";

export function shouldBehaveLikeBorrowerOperationsContract(): void {
  describe("BorrowerOperations", function () {
    describe("View Functions", function () {
      describe("#owner", function () {
        shouldBehaveLikeOwner();
      });
    });
    describe("Effects Functions", function () {});
  });
}
