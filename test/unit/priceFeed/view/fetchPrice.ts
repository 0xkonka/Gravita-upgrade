import { expect } from "chai";
import { BytesLike, ZeroHash } from "ethers";
import { ethers } from "hardhat";

import { MockPythPriceFeed } from "../../../../types";

const PROVIDER_TYPE = {
  Chainlink: 0,
  API3: 1,
  Pyth: 2,
  Redstone: 3
};

type OracleOptions = {
  providerType: (typeof PROVIDER_TYPE)[keyof typeof PROVIDER_TYPE];
  timeoutSeconds: number;
  isEthIndexed: boolean;
  isFallback: boolean;
  additionalData: BytesLike;
};

const DEFAULT_ORACLE_OPTIONS: OracleOptions = {
  providerType: PROVIDER_TYPE.Chainlink,
  timeoutSeconds: 3600,
  isEthIndexed: false,
  isFallback: false,
  additionalData: ZeroHash,
};

const API3_ORACLE_OPTIONS: OracleOptions = {
  providerType: PROVIDER_TYPE.API3,
  timeoutSeconds: 7200,
  isEthIndexed: false,
  isFallback: true,
  additionalData: ZeroHash,
};

const PYTH_ORACLE_OPTIONS: OracleOptions = {
  providerType: PROVIDER_TYPE.Pyth,
  timeoutSeconds: 7200,
  isEthIndexed: false,
  isFallback: true,
  additionalData: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
};

const REDSTONE_ORACLE_OPTIONS: OracleOptions = {
  providerType: PROVIDER_TYPE.Redstone,
  timeoutSeconds: 3600,
  isEthIndexed: false,
  isFallback: true,
  additionalData: ZeroHash,
};

export default function shouldHaveFetchPrice(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.timelockImpostor = this.signers.accounts[1];

    this.mockAggregator = this.testContracts.mockAggregator;
    this.mockApi3 = this.testContracts.mockApi3;
    this.mockRedstone = this.testContracts.mockRedstone;
    this.erc20Address = await this.testContracts.erc20.getAddress();
    this.mockAggregatorAddress = await this.mockAggregator.getAddress();
    this.mockApi3Address = await this.mockApi3.getAddress();
    this.mockRedstoneAddress = await this.mockRedstone.getAddress();
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
      // set ETH:USD chainlink oracle
      const setETHtoUSDOracleTx = await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          ethers.ZeroAddress,
          this.mockAggregatorAddress,
          DEFAULT_ORACLE_OPTIONS.providerType,
          DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
          DEFAULT_ORACLE_OPTIONS.isEthIndexed,
          DEFAULT_ORACLE_OPTIONS.isFallback,
          DEFAULT_ORACLE_OPTIONS.additionalData
        );
      await setETHtoUSDOracleTx.wait();

      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        timelock: this.timelockImpostor,
      });
      await this.redeployedContracts.priceFeed.setAddresses(addressesForSetAddresses);
    });

    context("when Chainlink oracle is primary oracle for asset", function () {
      beforeEach(async function () {
        const setPrimaryOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          );

        await setPrimaryOracleTx.wait();

        const setFallbackOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          );

        await setFallbackOracleTx.wait();
      });

      it("should return erc20 oracle price, decimal < 18", async function () {
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const roundData = await this.mockAggregator.latestRoundData();
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
            await mockAggregator.getAddress(),
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          );
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const roundData = await mockAggregator.latestRoundData();
        const priceFeedAnswer = roundData[1];

        const expectedPrice = priceFeedAnswer / 10n ** 2n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should return ETH-indexed oracle price", async function () {
        // set ERC20/ETH indexed oracle
        const ethAmount = ethers.WeiPerEther;
        const { mockAggregator } = this.testContracts;
        await mockAggregator.setPrice(ethAmount);
        await mockAggregator.setDecimals(18);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            await mockAggregator.getAddress(),
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            !DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          );

        const ethUsdRoundData = await this.mockAggregator.latestRoundData();

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const priceAnswer = ethUsdRoundData[1];
        const expectedPrice = priceAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });

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

    context("when API3 oracle is primary oracle for asset", function () {
      beforeEach(async function () {
        const setPrimaryOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            !API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          );

        await setPrimaryOracleTx.wait();

        const setFallbackOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            !DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          );

        await setFallbackOracleTx.wait();
      });

      it("should return fallback Chainlink oracle price when its set as fallback", async function () {
        await this.mockApi3.setValue(0);
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const roundData = await this.mockAggregator.latestRoundData();
        const expectedPrice = roundData[1] * 10n ** 10n;

        expect(price).to.equal(expectedPrice);
      });

      it("should return ETH-indexed oracle price", async function () {
        // set ERC20/ETH indexed oracle
        const ethAmount = ethers.WeiPerEther;
        const { mockApi3 } = this.testContracts;
        await mockApi3.setValue(ethAmount);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            await mockApi3.getAddress(),
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            !API3_ORACLE_OPTIONS.isEthIndexed,
            !API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          );

        const ethUsdRoundData = await this.mockAggregator.latestRoundData();

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const priceAnswer = ethUsdRoundData[1];
        const expectedPrice = priceAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
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

    context("when Pyth oracle is primary oracle for asset", function () {
      async function setPrice(mockPyth: MockPythPriceFeed, price: bigint, exponent: number = -8) {
        mockPyth.getValidTimePeriod;

        const now = Math.floor(Date.now() / 1000);
        const pythPriceFeedData = await mockPyth.createPriceFeedUpdateData(
          PYTH_ORACLE_OPTIONS.additionalData,
          price,
          224843971,
          exponent,
          price,
          224843971,
          now,
          now - 1
        );

        const updatePriceOnPythMockTx = await mockPyth.updatePriceFeed(pythPriceFeedData);
        await updatePriceOnPythMockTx.wait();
      }

      beforeEach(async function () {
        const { mockPyth } = this.testContracts;
        await setPrice(mockPyth, 100n);

        const pythOracleAddress = await mockPyth.getAddress();

        const setPrimaryOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            pythOracleAddress,
            PYTH_ORACLE_OPTIONS.providerType,
            PYTH_ORACLE_OPTIONS.timeoutSeconds,
            PYTH_ORACLE_OPTIONS.isEthIndexed,
            !PYTH_ORACLE_OPTIONS.isFallback,
            PYTH_ORACLE_OPTIONS.additionalData
          );

        await setPrimaryOracleTx.wait();

        const setFallbackOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            !DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          );

        await setFallbackOracleTx.wait();
      });

      it("should return fallback Chainlink oracle price when its set as fallback", async function () {
        await setPrice(this.testContracts.mockPyth, 0n);

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const roundData = await this.mockAggregator.latestRoundData();
        const expectedPrice = roundData[1] * 10n ** 10n;

        expect(price).to.equal(expectedPrice);
      });

      it("should return Pyth oracle price", async function () {
        const ethAmount = ethers.WeiPerEther;
        const { mockPyth } = this.testContracts;
        await setPrice(mockPyth, ethAmount, -18);

        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            await mockPyth.getAddress(),
            PYTH_ORACLE_OPTIONS.providerType,
            PYTH_ORACLE_OPTIONS.timeoutSeconds,
            true,
            false,
            PYTH_ORACLE_OPTIONS.additionalData
          );

        const ethUsdRoundData = await this.mockAggregator.latestRoundData();

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const priceAnswer = ethUsdRoundData[1];
        const expectedPrice = priceAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should revert if price is zero", async function () {
        await setPrice(this.testContracts.mockPyth, 0n);
        await this.mockAggregator.setPrice(0);

        await expect(
          this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address)
        ).to.be.revertedWithCustomError(
          this.redeployedContracts.priceFeed,
          "PriceFeed__InvalidOracleResponseError"
        );
      });
    });

    context("when Redstone oracle is primary oracle for asset", function () {
      beforeEach(async function () {
        const setPrimaryOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockRedstoneAddress,
            REDSTONE_ORACLE_OPTIONS.providerType,
            REDSTONE_ORACLE_OPTIONS.timeoutSeconds,
            REDSTONE_ORACLE_OPTIONS.isEthIndexed,
            !REDSTONE_ORACLE_OPTIONS.isFallback,
            REDSTONE_ORACLE_OPTIONS.additionalData
          );

        await setPrimaryOracleTx.wait();

        const setFallbackOracleTx = await this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          );

        await setFallbackOracleTx.wait();
      });

      it("should return erc20 oracle price, decimal < 18", async function () {
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const roundData = await this.mockRedstone.latestRoundData();
        const priceFeedAnswer = roundData[1];

        const expectedPrice = priceFeedAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should return different scaled price, decimal > 18", async function () {
        const { mockRedstone } = this.testContracts;

        await mockRedstone.setDecimals(20);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            await mockRedstone.getAddress(),
            REDSTONE_ORACLE_OPTIONS.providerType,
            REDSTONE_ORACLE_OPTIONS.timeoutSeconds,
            REDSTONE_ORACLE_OPTIONS.isEthIndexed,
            !REDSTONE_ORACLE_OPTIONS.isFallback,
            REDSTONE_ORACLE_OPTIONS.additionalData
          );
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const roundData = await mockRedstone.latestRoundData();
        const priceFeedAnswer = roundData[1];

        const expectedPrice = priceFeedAnswer / 10n ** 2n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should return ETH-indexed oracle price", async function () {
        // set ERC20/ETH indexed oracle
        const ethAmount = ethers.WeiPerEther;
        const { mockRedstone } = this.testContracts;
        await mockRedstone.setPrice(ethAmount);
        await mockRedstone.setDecimals(18);
        await this.redeployedContracts.priceFeed
          .connect(this.timelockImpostor)
          .setOracle(
            this.erc20Address,
            await mockRedstone.getAddress(),
            REDSTONE_ORACLE_OPTIONS.providerType,
            REDSTONE_ORACLE_OPTIONS.timeoutSeconds,
            !REDSTONE_ORACLE_OPTIONS.isEthIndexed,
            REDSTONE_ORACLE_OPTIONS.isFallback,
            REDSTONE_ORACLE_OPTIONS.additionalData
          );

        const ethUsdRoundData = await this.mockRedstone.latestRoundData();

        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);
        const priceAnswer = ethUsdRoundData[1];
        const expectedPrice = priceAnswer * 10n ** 10n;

        expect(price).to.be.equal(expectedPrice);
      });

      it("should return fallback oracle price", async function () {
        await this.mockRedstone.setPrice(0);
        const price = await this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address);

        const [expectedPrice] = await this.mockApi3.read();

        expect(price).to.equal(expectedPrice);
      });

      it("should revert if price is zero", async function () {
        await this.mockRedstone.setPrice(0);
        await this.mockApi3.setValue(0);
        await expect(
          this.redeployedContracts.priceFeed.fetchPrice(this.erc20Address)
        ).to.be.revertedWithCustomError(
          this.redeployedContracts.priceFeed,
          "PriceFeed__InvalidOracleResponseError"
        );
      });
    });
  });
}
