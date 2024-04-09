// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IFlashLoan {
    error FlashLoan__SetupIsInitialized();
    error FlashLoan__ZeroAddresses();
    error FlashLoan__LoanIsNotRepayable();
    error FlashLoan__AmountBeyondMin();
    error FlashLoan__AmountBeyondMax();
    error FlashLoan__CollateralIsNotActive();

    event FlashLoanExecuted(
        address indexed _borrower, uint256 indexed _debtAmount, uint256 _feeAmount
    );
    event AddressesSet(address _stableCoin, address _swapRouter);

    function flashLoan(uint256 _amount) external;
}
