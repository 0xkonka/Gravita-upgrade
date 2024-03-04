// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { IPool } from "./IPool.sol";

interface IDefaultPool is IPool {
    // --- Events ---
    event DefaultPoolDebtUpdated(address _asset, uint256 _debt);
    event DefaultPoolAssetBalanceUpdated(address _asset, uint256 _balance);

    // --- Functions ---
    function sendAssetToActivePool(address _asset, uint256 _amount) external;
}
