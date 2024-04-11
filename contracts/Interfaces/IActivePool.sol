// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IPool } from "./IPool.sol";

interface IActivePool is IPool {
    event ActivePoolDebtUpdated(address _asset, uint256 _debtTokenAmount);
    event ActivePoolAssetBalanceUpdated(address _asset, uint256 _balance);

    error ActivePool__NotAuthorizedContract();

    function sendAsset(address _asset, address _account, uint256 _amount) external;
}
