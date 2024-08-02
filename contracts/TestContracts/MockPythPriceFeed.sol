// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { MockPyth } from "@pythnetwork/pyth-sdk-solidity/MockPyth.sol";
import { PythStructs } from "@pythnetwork/pyth-sdk-solidity/PythStructs.sol";

contract MockPythPriceFeed is MockPyth {
    constructor() MockPyth(100, 0) { }

    function updatePriceFeed(bytes calldata updateData) external {
        PythStructs.PriceFeed memory priceFeed = abi.decode(updateData, (PythStructs.PriceFeed));

        priceFeeds[priceFeed.id] = priceFeed;
        emit PriceFeedUpdate(
            priceFeed.id,
            uint64(priceFeed.price.publishTime),
            priceFeed.price.price,
            priceFeed.price.conf
        );
    }
}
