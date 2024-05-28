import { expect } from "chai";
import { BytesLike, ZeroHash } from "ethers";

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
  isFallback: false,
  additionalData: "0xff61491a931112ddf1bd8147cd1b641375f79f5825126d665480874634fd0ace",
};

const REDSTONE_ORACLE_OPTIONS: OracleOptions = {
  providerType: PROVIDER_TYPE.Redstone,
  timeoutSeconds: 3600,
  isEthIndexed: false,
  isFallback: true,
  additionalData: ZeroHash,
};

export default function shouldBehaveLikeCanSetOracle(): void {
  beforeEach(async function () {
    this.owner = this.signers.deployer;
    this.notOwner = this.signers.accounts[1];
    this.timelockImpostor = this.signers.accounts[2];

    const { mockAggregator, mockApi3, mockRedstone } = this.testContracts;
    this.erc20Address = await this.testContracts.erc20.getAddress();
    this.mockAggregatorAddress = await mockAggregator.getAddress();
    this.mockApi3Address = await mockApi3.getAddress();
    this.mockRedstone = await mockRedstone.getAddress();
  });

  context("when the oracle is first set", function () {
    it("should revert if caller is EOA", async function () {
      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.notOwner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "OwnableUnauthorizedAccount"
      );
    });

    it("should revert if fallback is true", async function () {
      // since primary oracle is not set first
      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__ExistingOracleRequired"
      );
    });

    it("should revert if decimals is zero", async function () {
      const { mockAggregator } = this.testContracts;
      await mockAggregator.setDecimals(0);

      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidDecimalsError"
      );
    });

    it("should revert if chainlink price is zero", async function () {
      const { mockAggregator } = this.testContracts;
      await mockAggregator.setPrice(0);

      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            DEFAULT_ORACLE_OPTIONS.providerType,
            DEFAULT_ORACLE_OPTIONS.timeoutSeconds,
            DEFAULT_ORACLE_OPTIONS.isEthIndexed,
            DEFAULT_ORACLE_OPTIONS.isFallback,
            DEFAULT_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidOracleResponseError"
      );
    });

    it("should revert if api3 price is zero", async function () {
      const { mockApi3 } = this.testContracts;
      await mockApi3.setValue(0);

      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            !API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidOracleResponseError"
      );
    });

    it("should revert if pyth price is zero", async function () {
      const now = Math.floor(Date.now() / 1000);
      const { mockPyth } = this.testContracts;

      const initialPythPriceFeedData = await mockPyth.createPriceFeedUpdateData(
        PYTH_ORACLE_OPTIONS.additionalData,
        0,
        224843971,
        -8,
        0,
        224843971,
        now,
        0
      );
      await mockPyth.updatePriceFeeds([initialPythPriceFeedData]);
      const pythOracleAddress = await this.testContracts.mockPyth.getAddress();

      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            pythOracleAddress,
            PYTH_ORACLE_OPTIONS.providerType,
            PYTH_ORACLE_OPTIONS.timeoutSeconds,
            PYTH_ORACLE_OPTIONS.isEthIndexed,
            PYTH_ORACLE_OPTIONS.isFallback,
            PYTH_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidOracleResponseError"
      );
    });

    it("should revert when price feed id is not provided for pyth oracle", async function () {
      const emptyPythPriceFeedId = ZeroHash;
      const pythOracleAddress = await this.testContracts.mockPyth.getAddress();

      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            pythOracleAddress,
            PYTH_ORACLE_OPTIONS.providerType,
            PYTH_ORACLE_OPTIONS.timeoutSeconds,
            PYTH_ORACLE_OPTIONS.isEthIndexed,
            PYTH_ORACLE_OPTIONS.isFallback,
            emptyPythPriceFeedId
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__MissingPythFeedId"
      );
    });

    it("should set primary oracle", async function () {
      await this.redeployedContracts.priceFeed
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

      const oracles = await this.redeployedContracts.priceFeed.oracles(this.erc20Address);
      expect(oracles.oracleAddress).to.equal(this.mockAggregatorAddress);
    });

    it("should set fallback oracle", async function () {
      // set first primary oracle
      await this.redeployedContracts.priceFeed
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

      // set fallback oracle
      await this.redeployedContracts.priceFeed
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
      const fallback = await this.redeployedContracts.priceFeed.fallbacks(this.erc20Address);
      expect(fallback.oracleAddress).to.equal(this.mockApi3Address);
    });
  });

  context("when the oracle is not first set", function () {
    beforeEach(async function () {
      // set primary oracle as chainlink
      await this.redeployedContracts.priceFeed
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

      // set fallback oracle as api3
      await this.redeployedContracts.priceFeed
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

      // set timelock
      const addressesForSetAddresses = await this.utils.getAddressesForSetAddresses({
        timelock: this.timelockImpostor,
      });
      await this.redeployedContracts.priceFeed.setAddresses(addressesForSetAddresses);
    });

    it("should revert if caller is EOA", async function () {
      // caller should be a timelock
      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.notOwner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            !API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__TimelockOnlyError"
      );
    });

    it("should revert if caller is owner", async function () {
      // caller should be a timelock
      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.owner)
          .setOracle(
            this.erc20Address,
            this.mockApi3Address,
            API3_ORACLE_OPTIONS.providerType,
            API3_ORACLE_OPTIONS.timeoutSeconds,
            API3_ORACLE_OPTIONS.isEthIndexed,
            !API3_ORACLE_OPTIONS.isFallback,
            API3_ORACLE_OPTIONS.additionalData
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__TimelockOnlyError"
      );
    });

    it("should update primary oracle if caller is timelock", async function () {
      await this.redeployedContracts.priceFeed
        .connect(this.timelockImpostor)
        .setOracle(
          this.erc20Address,
          this.mockApi3Address,
          API3_ORACLE_OPTIONS.providerType,
          API3_ORACLE_OPTIONS.timeoutSeconds,
          API3_ORACLE_OPTIONS.isEthIndexed,
          !API3_ORACLE_OPTIONS.isFallback,
          API3_ORACLE_OPTIONS.additionalData
        );
      const oracle = await this.redeployedContracts.priceFeed.oracles(this.erc20Address);
      expect(oracle.oracleAddress).to.equal(this.mockApi3Address);
    });

    it("should update fallback oracle if caller is timelock", async function () {
      await this.redeployedContracts.priceFeed
        .connect(this.timelockImpostor)
        .setOracle(
          this.erc20Address,
          this.mockRedstone,
          REDSTONE_ORACLE_OPTIONS.providerType,
          REDSTONE_ORACLE_OPTIONS.timeoutSeconds,
          REDSTONE_ORACLE_OPTIONS.isEthIndexed,
          REDSTONE_ORACLE_OPTIONS.isFallback,
          REDSTONE_ORACLE_OPTIONS.additionalData
        );
      const fallback = await this.redeployedContracts.priceFeed.fallbacks(this.erc20Address);
      expect(fallback.oracleAddress).to.equal(this.mockRedstone);
    });
  });
}
