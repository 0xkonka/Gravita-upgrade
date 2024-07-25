// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { IPyth } from "@pythnetwork/pyth-sdk-solidity/IPyth.sol";
import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";

import { IPriceFeed, ChainlinkAggregatorV3Interface } from "./Interfaces/IPriceFeed.sol";
import { API3ProxyInterface } from "./Pricing/API3ProxyInterface.sol";

/**
 * @title PriceFeed
 * @notice Contains a directory of oracles for fetching prices for assets based on their addresses;
 * optionally fallback oracles can also be registered in case the primary source
 * fails or is stale.
 */
contract PriceFeed is IPriceFeed, OwnableUpgradeable, UUPSUpgradeable, ConfigurableAddresses {
    /// @notice The contract name.
    string public constant NAME = "PriceFeed";

    /// @notice Used to convert an oracle price answer to an 18-digit precision uint
    uint256 public constant TARGET_DIGITS = 18;

    /// @notice The mapping from an asset address to primary oracle record.
    mapping(address token => OracleRecord oracleRecord) public oracles;

    /// @notice The mapping from an asset address to fallback oracle record.
    mapping(address token => OracleRecord oracleRecord) public fallbacks;

    // Initializer
    // ------------------------------------------------------------------------------------------------------

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // Admin routines
    // ---------------------------------------------------------------------------------------------------

    /// @inheritdoc IPriceFeed
    function setOracle(
        address _token,
        address _oracle,
        ProviderType _type,
        uint256 _timeoutSeconds,
        bool _isEthIndexed,
        bool _isFallback,
        bytes32 _additionalData
    )
        external
        override
    {
        _requireOwnerOrTimelock(_token, _isFallback);
        if (_isFallback && oracles[_token].oracleAddress == address(0)) {
            // fallback setup requires an existing primary oracle for the asset
            revert PriceFeed__ExistingOracleRequired();
        }
        uint256 decimals = _fetchDecimals(_oracle, _type);
        if (decimals == 0) {
            revert PriceFeed__InvalidDecimalsError();
        }

        if (_type == ProviderType.Pyth && _additionalData == bytes32(0)) {
            revert PriceFeed__MissingPythFeedId();
        }

        OracleRecord memory newOracle = OracleRecord({
            oracleAddress: _oracle,
            providerType: _type,
            timeoutSeconds: _timeoutSeconds,
            decimals: decimals,
            isEthIndexed: _isEthIndexed,
            additionalData: _additionalData
        });
        uint256 price = _fetchOracleScaledPrice(newOracle);
        if (price == 0) {
            revert PriceFeed__InvalidOracleResponseError(_token);
        }
        if (_isFallback) {
            fallbacks[_token] = newOracle;
        } else {
            oracles[_token] = newOracle;
        }
        emit NewOracleRegistered(_token, _oracle, _isEthIndexed, _isFallback);
    }

    // Public functions
    // -------------------------------------------------------------------------------------------------

    /// @inheritdoc IPriceFeed
    function fetchPrice(address _token) public view virtual returns (uint256) {
        // Tries fetching the price from the oracle
        OracleRecord memory oracle = oracles[_token];
        uint256 price = _fetchOracleScaledPrice(oracle);
        if (price != 0) {
            return oracle.isEthIndexed ? _calcEthIndexedPrice(price) : price;
        }
        // If the oracle fails (and returns 0), try again with the fallback
        oracle = fallbacks[_token];
        price = _fetchOracleScaledPrice(oracle);
        if (price != 0) {
            return oracle.isEthIndexed ? _calcEthIndexedPrice(price) : price;
        }
        revert PriceFeed__InvalidOracleResponseError(_token);
    }

    // Internal functions
    // -----------------------------------------------------------------------------------------------

    /**
     * @dev Fetches the decimal precision of a specific oracle provider.
     * @param _oracle The oracle address.
     * @param _type The provider type.
     */
    function _fetchDecimals(address _oracle, ProviderType _type) internal view returns (uint8) {
        if (ProviderType.Chainlink == _type) {
            return ChainlinkAggregatorV3Interface(_oracle).decimals();
        } else if (ProviderType.API3 == _type) {
            return 18;
        } else if (ProviderType.Pyth == _type) {
            return 18;
        }
        return 0;
    }

    /**
     * @dev Fetches the scaled price by target decimal based on oracle answer.
     * @param oracle The oracle record information.
     */
    function _fetchOracleScaledPrice(OracleRecord memory oracle) internal view returns (uint256) {
        uint256 oraclePrice = 0;
        uint256 priceTimestamp = 0;

        if (oracle.oracleAddress == address(0)) {
            revert PriceFeed__UnknownAssetError();
        }

        if (ProviderType.Chainlink == oracle.providerType) {
            (oraclePrice, priceTimestamp) = _fetchChainlinkOracleResponse(oracle.oracleAddress);
        } else if (ProviderType.API3 == oracle.providerType) {
            (oraclePrice, priceTimestamp) = _fetchAPI3OracleResponse(oracle.oracleAddress);
        } else if (ProviderType.Pyth == oracle.providerType) {
            (oraclePrice, priceTimestamp) =
                _fetchPythOracleResponse(oracle.oracleAddress, oracle.additionalData);
        }

        if (oraclePrice != 0 && !_isStalePrice(priceTimestamp, oracle.timeoutSeconds)) {
            return _scalePriceByDigits(oraclePrice, oracle.decimals);
        }

        return 0;
    }

    /**
     * @dev Returns the flag to indicate if it is the latest or stale price.
     * @param _priceTimestamp The latest timestamp the price was updated.
     * @param _oracleTimeoutSeconds The maximum period that lasts a stale price.
     */
    function _isStalePrice(
        uint256 _priceTimestamp,
        uint256 _oracleTimeoutSeconds
    )
        internal
        view
        returns (bool)
    {
        return block.timestamp - _priceTimestamp > _oracleTimeoutSeconds;
    }

    /**
     * @dev Fetches the price and its updated timestamp from Chainlink oracle.
     * @param _oracleAddress The address of Chainlink oracle.
     */
    function _fetchChainlinkOracleResponse(address _oracleAddress)
        internal
        view
        returns (uint256 price, uint256 timestamp)
    {
        try ChainlinkAggregatorV3Interface(_oracleAddress).latestRoundData() returns (
            uint80 roundId,
            int256 answer,
            uint256, /* startedAt */
            uint256 updatedAt,
            uint80 /* answeredInRound */
        ) {
            if (roundId != 0 && updatedAt != 0 && answer != 0) {
                price = uint256(answer);
                timestamp = updatedAt;
            }
        } catch {
            // If call to Chainlink aggregator reverts, return a zero response
            price = 0;
            timestamp = 0;
        }
    }

    /**
     * @dev Fetches the price and its updated timestamp from Pyth oracle.
     * @param _oracleAddress The address of Pyth oracle.
     */
    function _fetchPythOracleResponse(
        address _oracleAddress,
        bytes32 _priceFeedId
    )
        internal
        view
        returns (uint256 price, uint256 timestamp)
    {
        IPyth pythOracle = IPyth(_oracleAddress);
        PythStructs.Price memory pythResponse = pythOracle.getPriceUnsafe(_priceFeedId);

        timestamp = pythResponse.publishTime;

        if(pythResponse.expo >= 0) {
            price = (uint256(uint64(pythResponse.price)) * (10 ** 18))
                * (10 ** uint8(uint32(pythResponse.expo)));
        } else {
            price = (uint256(uint64(pythResponse.price)) * (10 ** 18))
                / (10 ** uint8(uint32(-1 * pythResponse.expo)));
        }
    }

    /**
     * @dev Fetches the price and its updated timestamp from API3 oracle.
     * @param _oracleAddress The address of API3 oracle.
     */
    function _fetchAPI3OracleResponse(address _oracleAddress)
        internal
        view
        returns (uint256 price, uint256 timestamp)
    {
        (int224 _value, uint256 _timestamp) = API3ProxyInterface(_oracleAddress).read();
        if (_value > 0) {
            /// @dev negative check -> see API3ProxyInterface
            price = uint256(int256(_value));
            timestamp = _timestamp;
        }
    }

    /**
     * @dev Fetches the ETH:USD price (using the zero address as being the ETH asset), then
     * multiplies it by the indexed price. Assumes an oracle has been set for that purpose.
     * @param _ethAmount The asset price based on ETH.
     */
    function _calcEthIndexedPrice(uint256 _ethAmount) internal view returns (uint256) {
        uint256 ethPrice = fetchPrice(address(0));
        return (ethPrice * _ethAmount) / 1 ether;
    }

    /**
     * @dev Scales oracle's response up/down to target precision; returns unaltered price
     * if already on target digits.
     * @param _price The fetched price.
     * @param _priceDigits The price decimal.
     */
    function _scalePriceByDigits(
        uint256 _price,
        uint256 _priceDigits
    )
        internal
        pure
        returns (uint256)
    {
        unchecked {
            if (_priceDigits > TARGET_DIGITS) {
                return _price / (10 ** (_priceDigits - TARGET_DIGITS));
            } else if (_priceDigits < TARGET_DIGITS) {
                return _price * (10 ** (TARGET_DIGITS - _priceDigits));
            }
        }
        return _price;
    }

    // Access control functions
    // -----------------------------------------------------------------------------------------

    /**
     * @dev Requires the caller to be the contract owner when the oracle is first set. Subsequent
     * updates need to come through the timelock contract.
     * @param _token The asset address.
     * @param _isFallback The flag to indicate whether to set as fallback oracle.
     */
    function _requireOwnerOrTimelock(address _token, bool _isFallback) internal view {
        OracleRecord storage record = _isFallback ? fallbacks[_token] : oracles[_token];
        if (record.oracleAddress == address(0)) {
            _checkOwner();
        } else if (msg.sender != timelockAddress) {
            revert PriceFeed__TimelockOnlyError();
        }
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
