import { expect } from "chai";
import { ethers } from "ethers";

export default function shouldHaveFetchPrice(): void {
  context("for unknown asset", function () {
    it("should revert", async function () {
      const erc20 = this.testContracts.erc20;
      await expect(
        this.redeployedContracts.priceFeed.fetchPrice(await erc20.getAddress())
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed, "PriceFeed__UnknownAssetError"
      );
    });
  });

  context("for known asset when isEthIndexed is false", function () {
    it("should return chainlink price", async function () {
      const owner = this.signers.deployer;
      const erc20 = this.testContracts.erc20;
      const mockAggregator = this.testContracts.mockAggregator;

      const DefaultOracleOptions = {
        providerType: 0, // IPriceFeed.sol::enum ProviderType.Chainlink
        timeoutSeconds: 3600,
        isEthIndexed: false,
        isFallback: false,
      }

		  await this.redeployedContracts.priceFeed.connect(owner).setOracle(
        await erc20.getAddress(),
        await mockAggregator.getAddress(),
        DefaultOracleOptions.providerType,
        DefaultOracleOptions.timeoutSeconds,
        DefaultOracleOptions.isEthIndexed,
        DefaultOracleOptions.isFallback
      );

      const price = await this.redeployedContracts.priceFeed.fetchPrice(
        await erc20.getAddress()
      );

      const roundData = await mockAggregator.latestRoundData();
      expect(price).to.be.equal(ethers.parseUnits(roundData[1].toString(), 10));
    });
  });
}
