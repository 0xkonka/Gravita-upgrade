import { shouldBehaveLikeSortedTrenBoxesContract } from "./SortedTrenBoxes.behavior";

export function testSortedTrenBoxes(): void {
  describe("ActivePool", function () {
    beforeEach(async function () { });

    shouldBehaveLikeSortedTrenBoxesContract();
  });
}
