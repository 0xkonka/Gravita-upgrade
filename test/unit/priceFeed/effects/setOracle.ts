import { expect } from "chai";
import { ERC20Test, MockAggregator } from "../../../../types";
import type {
  SignerWithAddress,
} from "@nomicfoundation/hardhat-ethers/signers";

const DefaultOracleOptions = {
  providerType: 0, // IPriceFeed.sol::enum ProviderType.Chainlink
  timeoutSeconds: 3600,
  isEthIndexed: false,
  isFallback: false,
}

export default function shouldBehaveLikeCanSetOracle(): void {
  context("when caller is not owner and the oracle is first set", function () {
    it("should revert", async function () {
      const notOwner = this.signers.accounts[1];
      const { erc20, mockAggregator } = this.testContracts;

      await expect(
        this.redeployedContracts.priceFeed
          .connect(notOwner)
          .setOracle(
            await erc20.getAddress(),
            await mockAggregator.getAddress(),
            DefaultOracleOptions.providerType,
            DefaultOracleOptions.timeoutSeconds,
            DefaultOracleOptions.isEthIndexed,
            DefaultOracleOptions.isFallback
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "OwnableUnauthorizedAccount"
      );
    });
  });

  context("when caller is not owner and the oracle is not first set", function () {
    it("should revert", async function () {
      const owner = this.signers.deployer;
      const { erc20, mockAggregator } = this.testContracts;
      await this.redeployedContracts.priceFeed.connect(owner).setOracle(
        await erc20.getAddress(),
        await mockAggregator.getAddress(),
        DefaultOracleOptions.providerType,
        DefaultOracleOptions.timeoutSeconds,
        DefaultOracleOptions.isEthIndexed,
        DefaultOracleOptions.isFallback
      );

      // oracle is not first set
      // caller is not owner
      const notOwner = this.signers.accounts[1];
      await expect(
        this.redeployedContracts.priceFeed
          .connect(notOwner)
          .setOracle(
            await erc20.getAddress(),
            await mockAggregator.getAddress(),
            DefaultOracleOptions.providerType,
            DefaultOracleOptions.timeoutSeconds,
            DefaultOracleOptions.isEthIndexed,
            DefaultOracleOptions.isFallback
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__TimelockOnlyError"
      );
    });
  });

  context("when caller is owner and the oracle is first set", function () {
    let owner: SignerWithAddress;
    let erc20: ERC20Test, mockAggregator: MockAggregator;

    beforeEach(async function () {
      owner = this.signers.deployer;
      erc20 = this.testContracts.erc20;
      mockAggregator = this.testContracts.mockAggregator;
    });

    it("should revert when fallback is true", async function () {
      await expect(
        this.redeployedContracts.priceFeed
          .connect(owner)
          .setOracle(
            await erc20.getAddress(),
            await mockAggregator.getAddress(),
            DefaultOracleOptions.providerType,
            DefaultOracleOptions.timeoutSeconds,
            DefaultOracleOptions.isEthIndexed,
            !DefaultOracleOptions.isFallback
          )
      ).to.be.revertedWithCustomError(
        this.redeployedContracts.priceFeed,
        "PriceFeed__ExistingOracleRequired"
      );
    });

    it("should emit NewOracleRegistered", async function () {
      await expect(this.redeployedContracts.priceFeed.connect(owner).setOracle(
        await erc20.getAddress(),
        await mockAggregator.getAddress(),
        DefaultOracleOptions.providerType,
        DefaultOracleOptions.timeoutSeconds,
        DefaultOracleOptions.isEthIndexed,
        DefaultOracleOptions.isFallback
      )).to.emit(this.redeployedContracts.priceFeed, "NewOracleRegistered")
      .withArgs(
        await erc20.getAddress(),
        await mockAggregator.getAddress(),
        DefaultOracleOptions.isEthIndexed,
        DefaultOracleOptions.isFallback
      );
    });
  });
}
