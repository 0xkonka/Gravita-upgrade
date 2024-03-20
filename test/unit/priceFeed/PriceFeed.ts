import { shouldBehaveLikePriceFeedContract } from "./PriceFeed.behavior";

export function testPriceFeed(): void {
  describe("PriceFeed", function () {
    beforeEach(async function () {});

    shouldBehaveLikePriceFeedContract();
  });
}
