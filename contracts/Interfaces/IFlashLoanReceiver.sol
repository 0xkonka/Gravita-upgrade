// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

interface IFlashLoanReceiver {
    function executeOperation(uint256 _amount, uint256 _fee, address _debtToken) external;
}
