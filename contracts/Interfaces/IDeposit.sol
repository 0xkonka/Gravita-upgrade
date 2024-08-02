// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

interface IDeposit {
    function receivedERC20(address _asset, uint256 _amount) external;
}
