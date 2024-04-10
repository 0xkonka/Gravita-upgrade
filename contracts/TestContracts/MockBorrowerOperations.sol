// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

// This contract is for temporary replacement main BorrowerOpearations in testing
// flashLoanForRepay() in FlashLoan.sol
contract MockBorrowerOperations {
    function closeTrenBox(address _asset) external {
        IERC20(_asset).transfer(msg.sender, IERC20(_asset).balanceOf(address(this)));
    }
}
