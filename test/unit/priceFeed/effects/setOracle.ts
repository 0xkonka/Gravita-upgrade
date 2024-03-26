import { expect } from "chai";

export default function shouldBehaveLikeCanSetOracle(): void {
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
    this.notOwner = this.signers.accounts[1];
    this.timelockImpostor = this.signers.accounts[2];

    const { mockAggregator, mockApi3 } = this.testContracts;
    this.erc20Address = await this.testContracts.erc20.getAddress();
    this.mockAggregatorAddress = await mockAggregator.getAddress();
    this.mockApi3Address = await mockApi3.getAddress();
  });

  context("when the oracle is first set", function () {
    it("should revert if caller is EOA", async function () {
      await expect(
        this.redeployedContracts.priceFeed
          .connect(this.notOwner)
          .setOracle(
            this.erc20Address,
            this.mockAggregatorAddress,
            this.defaultOracleOptions.providerType,
            this.defaultOracleOptions.timeoutSeconds,
            this.defaultOracleOptions.isEthIndexed,
            this.defaultOracleOptions.isFallback
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
            this.api3OracleOptions.providerType,
            this.api3OracleOptions.timeoutSeconds,
            this.api3OracleOptions.isEthIndexed,
            this.api3OracleOptions.isFallback
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
            this.defaultOracleOptions.providerType,
            this.defaultOracleOptions.timeoutSeconds,
            this.defaultOracleOptions.isEthIndexed,
            this.defaultOracleOptions.isFallback
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
            this.defaultOracleOptions.providerType,
            this.defaultOracleOptions.timeoutSeconds,
            this.defaultOracleOptions.isEthIndexed,
            this.defaultOracleOptions.isFallback
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
            this.api3OracleOptions.providerType,
            this.api3OracleOptions.timeoutSeconds,
            this.api3OracleOptions.isEthIndexed,
            !this.api3OracleOptions.isFallback
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__InvalidOracleResponseError"
      );
    });

    it("should set primary oracle", async function () {
      await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          this.erc20Address,
          this.mockAggregatorAddress,
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          this.defaultOracleOptions.isFallback
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
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          this.defaultOracleOptions.isFallback
        );

      // set fallback oracle
      await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          this.erc20Address,
          this.mockApi3Address,
          this.api3OracleOptions.providerType,
          this.api3OracleOptions.timeoutSeconds,
          this.api3OracleOptions.isEthIndexed,
          this.api3OracleOptions.isFallback
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
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          this.defaultOracleOptions.isFallback
        );

      // set fallback oracle as api3
      await this.redeployedContracts.priceFeed
        .connect(this.owner)
        .setOracle(
          this.erc20Address,
          this.mockApi3Address,
          this.api3OracleOptions.providerType,
          this.api3OracleOptions.timeoutSeconds,
          this.api3OracleOptions.isEthIndexed,
          this.api3OracleOptions.isFallback
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
            this.api3OracleOptions.providerType,
            this.api3OracleOptions.timeoutSeconds,
            this.api3OracleOptions.isEthIndexed,
            !this.api3OracleOptions.isFallback
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
            this.api3OracleOptions.providerType,
            this.api3OracleOptions.timeoutSeconds,
            this.api3OracleOptions.isEthIndexed,
            !this.api3OracleOptions.isFallback
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
          this.api3OracleOptions.providerType,
          this.api3OracleOptions.timeoutSeconds,
          this.api3OracleOptions.isEthIndexed,
          !this.api3OracleOptions.isFallback
        );
      const oracle = await this.redeployedContracts.priceFeed.oracles(this.erc20Address);
      expect(oracle.oracleAddress).to.equal(this.mockApi3Address);
    });

    it("should update fallback oracle if caller is timelock", async function () {
      await this.redeployedContracts.priceFeed
        .connect(this.timelockImpostor)
        .setOracle(
          this.erc20Address,
          this.mockAggregatorAddress,
          this.defaultOracleOptions.providerType,
          this.defaultOracleOptions.timeoutSeconds,
          this.defaultOracleOptions.isEthIndexed,
          !this.defaultOracleOptions.isFallback
        );
      const fallback = await this.redeployedContracts.priceFeed.fallbacks(this.erc20Address);
      expect(fallback.oracleAddress).to.equal(this.mockAggregatorAddress);
    });
  });
}
