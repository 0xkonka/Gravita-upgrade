import { shouldBehaveLikeTrenBoxManagerOperationsContract } from "./TrenBoxManagerOperations.behavior";

export function testTrenBoxManagerOperations(): void {
  describe("trenBoxManagerOperations", function () {
    beforeEach(async function () {});

    shouldBehaveLikeTrenBoxManagerOperationsContract();
  });
}
