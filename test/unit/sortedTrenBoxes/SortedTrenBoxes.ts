import { shouldBehaveLikeSortedTrenBoxesContract } from "./SortedTrenBoxes.behavior";

export function testSortedTrenBoxes(): void {
  describe("SortedTrenBoxes", function () {
    beforeEach(async function () { });

    shouldBehaveLikeSortedTrenBoxesContract();
  });
}
