import { shouldBehaveLikeBorrowerOperationsContract } from "./BorrowerOperations.behavior";

export function testBorrowerOperations(): void {
  describe("BorrowerOperations", function () {
    beforeEach(async function () {});

    shouldBehaveLikeBorrowerOperationsContract();
  });
}
