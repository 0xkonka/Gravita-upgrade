// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { AggregatorV3Interface } from
    "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @dev This contract was created to serve as a price feed for pairs that are fixed at a 1:1
 * rate.
 * Responses' roundId and updateTime will always be 2 minutes ago, while the previousRound will
 * be 5 min ago.
 */
contract FixedPriceAggregator is AggregatorV3Interface {
    uint8 private constant DECIMALS_VAL = 8;
    int256 private immutable PRICE;

    constructor(int256 _price) {
        PRICE = _price;
    }

    function decimals() external pure override returns (uint8) {
        return DECIMALS_VAL;
    }

    function description() external pure override returns (string memory) {
        return "FixedPriceAggregator";
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        uint256 timestamp = block.timestamp - 5 minutes;
        return (_roundId, PRICE, timestamp, timestamp, uint80(timestamp));
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        uint256 timestamp = block.timestamp - 2 minutes;
        return (uint80(timestamp), PRICE, timestamp, timestamp, uint80(timestamp));
    }

    function version() external pure override returns (uint256) {
        return 1;
    }
}
