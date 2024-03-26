import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveFetchPrice(): void {
  beforeEach(async function () {
    this.defaultOracleOptions = {
      providerType: 0, // Chainlink
      timeoutSeconds: 3600,
      isEthIndexed: false,
      isFallback: false,
    }

    this.api3OracleOptions = {
      providerType: 1, // API3
      timeoutSeconds: 7200,
      isEthIndexed: false,
      isFallback: true, // fallback = true
    };

    this.owner = this.signers.deployer;
    this.impostor = this.signers.accounts[1]; // mock timelock

    this.mockAggregator = this.testContracts.mockAggregator;
    this.mockApi3 = this.testContracts.mockApi3;
    this.erc20Address = await (this.testContracts.erc20).getAddress();
    this.mockAggregatorAddress = await this.mockAggregator.getAddress();
    this.mockApi3Address = await this.mockApi3.getAddress();
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

  context("for known asset", function () {
    beforeEach(async function () {
      // set primary oracle
      await this.redeployedContracts.priceFeed.connect(this.owner).setOracle(
        this.erc20Address,
        this.mockAggregatorAddress,
        this.defaultOracleOptions.providerType,
        this.defaultOracleOptions.timeoutSeconds,
        this.defaultOracleOptions.isEthIndexed,
        this.defaultOracleOptions.isFallback
      );

      // set fallback oracle
      await this.redeployedContracts.priceFeed.connect(this.owner).setOracle(
        this.erc20Address,
        this.mockApi3Address,
        this.api3OracleOptions.providerType,
        this.api3OracleOptions.timeoutSeconds,
        this.api3OracleOptions.isEthIndexed,
        this.api3OracleOptions.isFallback
      );

      // set ETH/USD oracle
      await this.redeployedContracts.priceFeed.connect(this.owner).setOracle(
        ethers.ZeroAddress,
        this.mockAggregatorAddress,
        this.defaultOracleOptions.providerType,
        this.defaultOracleOptions.timeoutSeconds,
        this.defaultOracleOptions.isEthIndexed,
        this.defaultOracleOptions.isFallback
      );

      // set timelock
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        timelock: this.impostor,
      });
      await this.redeployedContracts.priceFeed.setAddresses(addressesForSetAddresses);
    });

    it("should return erc20 oracle price", async function () {
      const price = await this.redeployedContracts.priceFeed.fetchPrice(
        this.erc20Address
      );

      const roundData = await this.mockAggregator.latestRoundData();
      expect(price).to.be.equal(ethers.parseUnits(roundData[1].toString(), 18 - 8));
    });

    it("should return ETH-indexed oracle price", async function () {
      // set ERC20/ETH indexed oracle
      const ethAmount = ethers.parseEther("1");
      await this.mockApi3.setValue(ethAmount);
      await this.redeployedContracts.priceFeed.connect(this.impostor).setOracle(
        this.erc20Address,
        this.mockApi3Address,
        this.api3OracleOptions.providerType,
        this.api3OracleOptions.timeoutSeconds,
        !this.api3OracleOptions.isEthIndexed,
        !this.api3OracleOptions.isFallback
      );

      const roundData = await this.mockAggregator.latestRoundData();

      const price = await this.redeployedContracts.priceFeed.fetchPrice(
        this.erc20Address
      );

      expect(price).to.be.equal(ethers.parseUnits(roundData[1].toString(), 18 - 8));
    });

    it("should return fallback oracle price", async function () {
      await this.mockAggregator.setPrice(0);
      const price = await this.redeployedContracts.priceFeed.fetchPrice(
        this.erc20Address
      );

      const priceData = await this.mockApi3.read();
      expect(price).to.equal(priceData[0]);
    });

    it("should revert if price is zero", async function () {
      await this.mockAggregator.setPrice(0);
      await this.mockApi3.setValue(0);
      await expect(
        this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidOracleResponseError"
      );
    });
  });
}
