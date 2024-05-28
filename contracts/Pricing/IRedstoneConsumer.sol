// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IRedstoneConsumer {
    function getTimestampsFromLatestUpdate()
        external
        view
        returns (uint128 dataTimestamp, uint128 blockTimestamp);

    function getValueForDataFeed(bytes32 dataFeedId) external view returns (uint256);
}
