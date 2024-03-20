import { shouldBehaveLikePriceFeedContract } from "./PriceFeed.behavior";
import { ethers } from "hardhat";

export function testPriceFeed(): void {
  describe("PriceFeed", function () {
    beforeEach(async function () {
      const PriceFeedFactory = await ethers.getContractFactory("PriceFeed");
      const priceFeed = await PriceFeedFactory.connect(this.signers.deployer).deploy();
      await priceFeed.waitForDeployment();
      await priceFeed.initialize();

      this.redeployedContracts.priceFeed = priceFeed;
    });

    shouldBehaveLikePriceFeedContract();
  });
}
