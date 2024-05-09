// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IFeeCollector {
    /**
     * @dev Struct for storing fee records of specific collateral asset.
     * @param from The timestamp in seconds when the decay of refundable fee started.
     * @param to The timestamp in seconds when the decay of refundable fee expired.
     * @param _amount The amount of refundable fee.
     */
    struct FeeRecord {
        uint256 from;
        uint256 to;
        uint256 amount;
    }

    /**
     * @dev Emitted when the fee record is updated.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _from The timestamp in seconds when the decay of refundable fee started.
     * @param _to The timestamp in seconds when the decay of refundable fee expired.
     * @param _amount The amount of refundable fee
     */
    event FeeRecordUpdated(
        address indexed _borrower,
        address indexed _asset,
        uint256 _from,
        uint256 _to,
        uint256 _amount
    );

    /**
     * @dev Emitted when the collected fees are transferred to either the treasury
     * or the TRENStaking contract.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _collector The address of destination.
     * @param _amount The amount of collected fees (debt tokens).
     */
    event FeeCollected(
        address indexed _borrower,
        address indexed _asset,
        address indexed _collector,
        uint256 _amount
    );

    /**
     * @dev Emitted when the fees are refunded to the borrower.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _amount The amount of refunded fees.
     */
    event FeeRefunded(address indexed _borrower, address indexed _asset, uint256 _amount);

    /**
     * @dev Emitted when the redemption fees are collected.
     * @param _asset The address of collateral asset.
     * @param _amount The amount of collected fees.
     */
    event RedemptionFeeCollected(address indexed _asset, uint256 _amount);

    /**
     * @dev Emitted when the lengths of array parameters are mismatched.
     */
    error FeeCollector__ArrayMismatch();

    /**
     * @dev Emitted when the caller is not BorrowerOperations.
     * @param _sender The address of caller.
     * @param _expected The address of BorrowerOperations.
     */
    error FeeCollector__BorrowerOperationsOnly(address _sender, address _expected);

    /**
     * @dev Emitted when the caller is neither BorrowerOperations nor TrenBoxManager.
     * @param _sender The address of caller.
     * @param _expected1 The address of BorrowerOperations.
     * @param _expected2 The address of TrenBoxManager.
     */
    error FeeCollector__BorrowerOperationsOrTrenBoxManagerOnly(
        address _sender, address _expected1, address _expected2
    );

    /**
     * @dev Emitted when the caller is not TrenBoxManager.
     * @param _sender The address of caller.
     * @param _expected The address of TrenBoxManager.
     */
    error FeeCollector__TrenBoxManagerOnly(address _sender, address _expected);

    /**
     * @notice Triggered when a TrenBox is created and again whenever the borrower acquires
     * additional loans.
     * Collects the minimum fee to the platform, for which there is no refund; holds on to the
     * remaining fees until debt is paid, liquidated, or expired.
     * @dev Attention: this method assumes that (debt token) _feeAmount has already been minted and
     * transferred to this contract.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _feeAmount The amount of fees to collect.
     */
    function increaseDebt(address _borrower, address _asset, uint256 _feeAmount) external;

    /**
     * @notice Triggered when a trenBox is adjusted or closed, and the borrower
     *  has paid back ordecreased his loan.
     */
    function decreaseDebt(address _borrower, address _asset, uint256 _paybackFraction) external;

    function closeDebt(address _borrower, address _asset) external;

    function liquidateDebt(address _borrower, address _asset) external;

    function simulateRefund(
        address _borrower,
        address _asset,
        uint256 _paybackFraction
    )
        external
        returns (uint256);

    function collectFees(address[] calldata _borrowers, address[] calldata _assets) external;

    function handleRedemptionFee(address _asset, uint256 _amount) external;

    function getProtocolRevenueDestination() external view returns (address);
}
