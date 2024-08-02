// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

/**
 * @dev Chainlink aggregator interface
 * @author From
 * https://github.com/smartcontractkit/chainlink/blob/develop/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol
 */
interface ChainlinkAggregatorV3Interface {
    function decimals() external view returns (uint8);

    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );
}

/**
 * @title IPriceFeed
 * @notice Defines the basic interface for a PriceFeed contract.
 */
interface IPriceFeed {
    /**
     * @dev Enum for storing provider type for price feed.
     * @param Chainlink The chainlink price feed.
     * @param API3 The The api3 price feed.
     */
    enum ProviderType {
        Chainlink,
        API3,
        Pyth
    }

    /**
     * @dev Struct for storing information for price oracle.
     * @param oracleAddress The oracle address.
     * @param providerType The provider type.
     * @param timeoutSeconds The maximum period that lasts a stale price.
     * @param decimals The decimal precision of price oracle.
     * @param isEthIndexed The flag to indicate whether to fetch price based on ETH.
     * @param additionalData The additional data required by the specific oracle type.
     */
    struct OracleRecord {
        address oracleAddress;
        ProviderType providerType;
        uint256 timeoutSeconds;
        uint256 decimals;
        bool isEthIndexed;
        bytes32 additionalData;
    }

    /// @dev Error emitted when setting up fallback oracle without no existing primary oracle.
    error PriceFeed__ExistingOracleRequired();

    /// @dev Error emitted when the decimal precision of price oracle is zero.
    error PriceFeed__InvalidDecimalsError();

    /// @dev Error emitted when the fetched price for a specific token is zero.
    /// @param _token The token address to fetch price.
    error PriceFeed__InvalidOracleResponseError(address _token);

    /// @dev Error emitted when the caller is not Timelock contract.
    error PriceFeed__TimelockOnlyError();

    /// @dev Error emitted when returning oracle address for unknown asset.
    error PriceFeed__UnknownAssetError();

    /// @dev Error emitted when the price feed is missing Pyth feed id.
    error PriceFeed__MissingPythFeedId();

    /**
     * @dev Emitted when new oracle for a specific asset is registered.
     * @param _token The asset address.
     * @param _oracleAddress The oracle address.
     * @param _isEthIndexed The flag to indicate whether to fetch price based on ETH.
     * @param _isFallback The flag to indicate whether to set as fallback oracle.
     */
    event NewOracleRegistered(
        address _token, address _oracleAddress, bool _isEthIndexed, bool _isFallback
    );

    /**
     * @notice Fetches the price for an asset from a previously configured oracle.
     * @dev Callers:
     *    - BorrowerOperations.openTrenBox()
     *    - BorrowerOperations.adjustTrenBox()
     *    - BorrowerOperations.closeTrenBox()
     *    - TrenBoxManagerOperations.liquidateTrenBoxes()
     *    - TrenBoxManagerOperations.batchLiquidateTrenBoxes()
     *    - TrenBoxManagerOperations.redeemCollateral()
     * @param _token The asset address.
     */
    function fetchPrice(address _token) external view returns (uint256);

    /**
     * @notice Sets an oracle information for a specific asset.
     * @param _token The asset address.
     * @param _oracle The oracle address.
     * @param _type The provider type.
     * @param _timeoutSeconds The maximum period that lasts a stale price.
     * @param _isEthIndexed The flag to indicate whether to fetch price based on ETH.
     * @param _isFallback The flag to indicate whether to set as fallback oracle.
     * @param _additionalData The additional data required by the oracle provider.
     */
    function setOracle(
        address _token,
        address _oracle,
        ProviderType _type,
        uint256 _timeoutSeconds,
        bool _isEthIndexed,
        bool _isFallback,
        bytes32 _additionalData
    )
        external;
}
