// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "../Interfaces/IFlashLoan.sol";
import "../Interfaces/IFlashLoanReceiver.sol";

contract FlashLoanTester is IFlashLoanReceiver {
    address public flashLoan;

    constructor(address _flashLoan) {
        flashLoan = _flashLoan;
    }

    function executeFlashLoan(uint256 _amount) external {
        IFlashLoan(flashLoan).flashLoan(_amount);
    }

    function executeOperation(uint256 _amount, uint256 _fee, address _tokenAddress) external {
        // Here you can do anything what you want

        IERC20(_tokenAddress).transfer(msg.sender, _amount + _fee);
    }

    function withdrawTokens(address _tokenAddress, address _receiver) external {
        uint256 _amount = IERC20(_tokenAddress).balanceOf(address(this));
        IERC20(_tokenAddress).transfer(_receiver, _amount);
    }
}
