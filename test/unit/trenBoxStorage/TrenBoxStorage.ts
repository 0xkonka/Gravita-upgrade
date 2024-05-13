import { shouldBehaveLikeTrenBoxStorageContract } from "./TrenBoxStorage.behavior";

export function testTrenBoxStorage(): void {
  describe("TrenBoxStorage", function () {
    beforeEach(async function () {});

    shouldBehaveLikeTrenBoxStorageContract();
  });
}
