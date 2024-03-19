import { shouldBehaveLikeBorrowerOperationsContract } from "./BorrowerOperations.behavior";

export function testBorrowerOperations(): void {
  describe("DebtToken", function () {
    beforeEach(async function () {});

    shouldBehaveLikeBorrowerOperationsContract();
  });
}
