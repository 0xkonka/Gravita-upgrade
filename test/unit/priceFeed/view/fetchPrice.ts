import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveFetchPrice(): void {
  beforeEach(async function () {
    this.defaultOracleOptions = {
      providerType: 0,
      timeoutSeconds: 3600,
      isEthIndexed: false,
      isFallback: false,
    }

    this.owner = this.signers.deployer;
    this.erc20Address = await (this.testContracts.erc20).getAddress();
    this.mockAggregator = this.testContracts.mockAggregator;
    this.mockAggregatorAddress = await (this.testContracts.mockAggregator).getAddress();
  });

  context("for unknown asset", function () {
    it("should revert", async function () {
      await expect(
        this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed, "PriceFeed__UnknownAssetError"
      );
    });
  });

  context("for known asset when isEthIndexed is false", function () {
    beforeEach(async function () {
      // set primary oracle, isEthIndexed is false
      await this.redeployedContracts.priceFeed.connect(this.owner).setOracle(
        this.erc20Address,
        this.mockAggregatorAddress,
        this.defaultOracleOptions.providerType,
        this.defaultOracleOptions.timeoutSeconds,
        this.defaultOracleOptions.isEthIndexed,
        this.defaultOracleOptions.isFallback
      );
    });

    it("should return chainlink price", async function () {
      const price = await this.redeployedContracts.priceFeed.fetchPrice(
        await this.erc20Address
      );

      const roundData = await this.mockAggregator.latestRoundData();
      expect(price).to.be.equal(ethers.parseUnits(roundData[1].toString(), 18 - 8));
    });
  });
}
