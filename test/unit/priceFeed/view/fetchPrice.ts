import { expect } from "chai";
import { ethers } from "hardhat";

export default function shouldHaveFetchPrice(): void {
  beforeEach(async function () {
    const providerType = {
      Chainlink: 0,
      API3: 1,
    };

    this.defaultOracleOptions = {
      providerType: providerType.Chainlink,
      timeoutSeconds: 3600,
      isEthIndexed: false,
      isFallback: false,
    };

    this.api3OracleOptions = {
      providerType: providerType.API3,
      timeoutSeconds: 7200,
      isEthIndexed: false,
      isFallback: true,
    };

    this.owner = this.signers.deployer;
    this.timelockImpostor = this.signers.accounts[1];

    this.mockAggregator = this.testContracts.mockAggregator;
    this.mockApi3 = this.testContracts.mockApi3;
    this.erc20Address = await this.testContracts.erc20.getAddress();
    this.mockAggregatorAddress = await this.mockAggregator.getAddress();
    this.mockApi3Address = await this.mockApi3.getAddress();
  });

  context("for unknown asset", function () {
    it("should revert", async function () {
      await expect(
        this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address)
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__UnknownAssetError"
      );
    });
  });

  context("for known asset", function () {
    beforeEach(async function () {
      const setPrimaryOracleTx = await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          this.erc20Address,
          this.mockAggregatorAddress,
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          this.defaultOracleOptions.isFallback
        );

      await setPrimaryOracleTx.wait();

      const setFallbackOracleTx = await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          this.erc20Address,
          this.mockApi3Address,
          this.api3OracleOptions.providerType,
          this.api3OracleOptions.timeoutSeconds,
          this.api3OracleOptions.isEthIndexed,
          this.api3OracleOptions.isFallback
        );

      await setFallbackOracleTx.wait();

      const setETHtoUSDOracleTx = await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          ethers.ZeroAddress,
          this.mockAggregatorAddress,
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          this.defaultOracleOptions.isFallback
        );
      await setETHtoUSDOracleTx.wait();

      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        timelock: this.timelockImpostor,
      });
      await this.redeployedContracts.priceFeed.setAddresses(addressesForSetAddresses);
    });

    context("when Chainlink oracle is primary oracle for asset", function () {
      it("should return erc20 oracle price, decimal < 18", async function () {
        const { mockAggregator } = this.testContracts;

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const roundData = await mockAggregator.latestRoundData();
        const priceFeedAnswer = roundData[1];

        const expectedPrice = priceFeedAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should return different scaled price, decimal > 18", async function () {
        const { mockAggregator } = this.testContracts;

        await mockAggregator.setDecimals(20);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            this.defaultOracleOptions.providerType,
            this.defaultOracleOptions.timeoutSeconds,
            this.defaultOracleOptions.isEthIndexed,
            this.defaultOracleOptions.isFallback
          );
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const roundData = await mockAggregator.latestRoundData();
        const priceFeedAnswer = roundData[1];

        const expectedPrice = priceFeedAnswer / 10n ** 2n;

        expect(price).to.be.equal(expectedPrice);
      });

      it.skip("should return ETH-indexed oracle price", async function () {});

      it("should return fallback oracle price", async function () {
        await this.mockAggregator.setPrice(0);
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const [expectedPrice] = await this.mockApi3.read();

        expect(price).to.equal(expectedPrice);
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

    context("when API3 oracle is when Chainlink oracle is primary oracle for asset", function () {
      beforeEach(async function () {});
      it.skip("should return erc20 oracle price, decimal < 18", async function () {});
      it.skip("should return different scaled price, decimal > 18", async function () {});
      it.skip("should return fallback Chainlink oracle price when its set as fallback", async function () {});
      it("should return ETH-indexed oracle price", async function () {
        // set ERC20/ETH indexed oracle
        const ethAmount = ethers.WeiPerEther;
        await this.mockApi3.setValue(ethAmount);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            this.api3OracleOptions.providerType,
            this.api3OracleOptions.timeoutSeconds,
            !this.api3OracleOptions.isEthIndexed,
            !this.api3OracleOptions.isFallback
          );

        const roundData = await this.mockAggregator.latestRoundData();

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const priceAnswer = roundData[1];
        const expectedPrice = priceAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });
      it.skip("should revert if price is zero", async function () {});
    });
  });
}
