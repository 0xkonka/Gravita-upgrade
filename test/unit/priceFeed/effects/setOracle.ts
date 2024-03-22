import { expect } from "chai";
import { ERC20Test, MockAggregator } from "../../../../types";
import type {
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";

export default function shouldBehaveLikeCanSetOracle(): void {
  beforeEach(async function () {
    this.defaultOracleOptions = {
      providerType: 0, // enum ProviderType.Chainlink
      timeoutSeconds: 3600,
      isEthIndexed: false,
      isFallback: false,
    }

    this.owner = this.signers.deployer;
    this.notOwner = this.signers.accounts[1];

    this.erc20Address = await this.testContracts.erc20.getAddress();
    this.mockAggregatorAddress = await this.testContracts.mockAggregator.getAddress();
  });

  context("when caller is not owner and the oracle is first set", function () {
    it("should revert", async function () {
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
  });

  context("when caller is not owner and the oracle is not first set", function () {
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
    });

    it("should revert", async function () {
      // oracle is not first set
      // caller is not owner
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
        "PriceFeed__TimelockOnlyError"
      );
    });
  });

  context("when caller is owner and the oracle is first set", function () {
    it("should revert when fallback is true", async function () {
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
        "PriceFeed__ExistingOracleRequired"
      );
    });

    it("should emit NewOracleRegistered", async function () {
      await expect(this.redeployedContracts.priceFeed.connect(this.owner).setOracle(
        this.erc20Address,
        this.mockAggregatorAddress,
        this.defaultOracleOptions.providerType,
        this.defaultOracleOptions.timeoutSeconds,
        this.defaultOracleOptions.isEthIndexed,
        this.defaultOracleOptions.isFallback
      )).to.emit(this.redeployedContracts.priceFeed, "NewOracleRegistered")
      .withArgs(
        this.erc20Address,
        this.mockAggregatorAddress,
        this.defaultOracleOptions.isEthIndexed,
        this.defaultOracleOptions.isFallback
      );
    });
  });
}
