// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IAdminContract {
    struct CollateralParams {
        uint256 index; // Maps to token address in validCollateral[]
        bool active;
        uint256 borrowingFee;
        uint256 ccr;
        uint256 mcr;
        uint256 debtTokenGasCompensation;
        uint256 minNetDebt; // Minimum amount of net debtToken a trenBox must have
        uint256 mintCap;
        uint256 percentDivisor;
        uint256 redemptionFeeFloor;
        uint256 redemptionBlockTimestamp;
    }

    struct FlashLoanParams {
        uint256 flashLoanFee; // 10 = 0,1%, 100 = 10% => 10 out of $1000 = $10
        uint256 flashLoanMinDebt; // min amount of trenUSD to mint for Flash Loan
        uint256 flashLoanMaxDebt; // max amount of trenUSD to mint for Flash Loan
    }

    error SafeCheckError(string parameter, uint256 valueEntered, uint256 minValue, uint256 maxValue);
    error AdminContract__OnlyOwner();
    error AdminContract__OnlyTimelock();
    error AdminContract__CollateralAlreadyInitialized();
    error AdminContract__CollateralExists();
    error AdminContract__CollateralDoesNotExist();
    error AdminContract__CollateralNotConfigured();

    event CollateralAdded(address _collateral);
    event MCRChanged(uint256 oldMCR, uint256 newMCR);
    event CCRChanged(uint256 oldCCR, uint256 newCCR);
    event MinNetDebtChanged(uint256 oldMinNet, uint256 newMinNet);
    event PercentDivisorChanged(uint256 oldPercentDiv, uint256 newPercentDiv);
    event BorrowingFeeChanged(uint256 oldBorrowingFee, uint256 newBorrowingFee);
    event RedemptionFeeFloorChanged(uint256 oldRedemptionFeeFloor, uint256 newRedemptionFeeFloor);
    event MintCapChanged(uint256 oldMintCap, uint256 newMintCap);
    event RedemptionBlockTimestampChanged(address _collateral, uint256 _blockTimestamp);
    event FlashLoanFeeChanged(uint256 oldFee, uint256 newFee);
    event FlashLoanMinDebtChanged(uint256 oldMinDebt, uint256 newMinDebt);
    event FlashLoanMaxDebtChanged(uint256 oldMaxDebt, uint256 newMaxDebt);

    /// @notice Returns decimal precision, 1 ether
    function DECIMAL_PRECISION() external view returns (uint256);

    /// @notice Returns the scaled number which means 100 percentage, 1 ether
    function _100pct() external view returns (uint256);

    /**
     * @notice Add new collateral asset
     * @param _collateral asset address
     * @param _debtTokenGasCompensation amount of debtToken to be locked on opening TrenBoxes
     * as liquidation reserve.
     */
    function addNewCollateral(address _collateral, uint256 _debtTokenGasCompensation) external;

    /**
     * @notice Set collateral parameters
     * @param _collateral asset address
     * @param borrowingFee one time fee charged on the loan amount and added to your debt
     * @param ccr critical collateral ratio to avoid liquidation during Recovery Mode
     * @param mcr minimum collateral ratio to avoid liquidation during Normal Mode
     * @param minNetDebt minimum amount of net debtToken a TrenBox must have
     * @param mintCap total TrenUSD amount to be allocated
     * @param percentDivisor divisor to be used in percent calculation
     * @param redemptionFeeFloor one time fee charged on the redeemed amount
     */
    function setCollateralParameters(
        address _collateral,
        uint256 borrowingFee,
        uint256 ccr,
        uint256 mcr,
        uint256 minNetDebt,
        uint256 mintCap,
        uint256 percentDivisor,
        uint256 redemptionFeeFloor
    )
        external;

    /**
     * @notice Set the minimum collateral ratio
     * @param _collateral asset address
     * @param newMCR minimum collateral ratio to avoid liquidations under normal operation
     */
    function setMCR(address _collateral, uint256 newMCR) external;

    /**
     * @notice Set the critical collateral ratio
     * @param _collateral asset address
     * @param newCCR critical collateral ratio. If the system's total collateral ratio (TCR) falls
     * below the CCR, Recovery Mode is triggered.
     */
    function setCCR(address _collateral, uint256 newCCR) external;

    /**
     * @notice Set the minimum amount of net debt
     * @param _collateral asset address
     * @param minNetDebt minimum amount of net debtToken a TrenBox must have
     */
    function setMinNetDebt(address _collateral, uint256 minNetDebt) external;

    /**
     * @notice Set the percent divisor
     * @param _collateral asset address
     * @param percentDivisor divisor to be used in percent calculation; min 2, max 200
     */
    function setPercentDivisor(address _collateral, uint256 percentDivisor) external;

    /**
     * @notice Set the borrowing fee
     * @param _collateral asset address
     * @param borrowingFee one time fee charged on the loan amount and added to your debt
     */
    function setBorrowingFee(address _collateral, uint256 borrowingFee) external;

    /**
     * @notice Set the redemption fee floor
     * @param _collateral asset address
     * @param redemptionFeeFloor fee charged on the redeemed amount(scaled by 1e18);
     * min 0.001(0.1%), max 0.1(10%)
     */
    function setRedemptionFeeFloor(address _collateral, uint256 redemptionFeeFloor) external;

    /**
     * @notice Set the total loan amount to be allocated
     * @param _collateral asset address
     * @param mintCap total loan amount that can be minted
     */
    function setMintCap(address _collateral, uint256 mintCap) external;

    /// @notice Set redemption block timestamp
    function setRedemptionBlockTimestamp(address _collateral, uint256 _blockTimestamp) external;

    /// @notice Switch the destination where collected fees go
    function switchRouteToTRENStaking() external;

    /// @notice Returns collateral index, which maps to token address in validCollateral
    function getIndex(address _collateral) external view returns (uint256);

    /// @notice Returns if collateral is active or not
    function getIsActive(address _collateral) external view returns (bool);

    /// @notice Returns list of all collateral types in collateralParams
    function getValidCollateral() external view returns (address[] memory);

    /// @notice Returns minimum collateral ratio
    function getMcr(address _collateral) external view returns (uint256);

    /// @notice Returns critical system collateral ratio
    function getCcr(address _collateral) external view returns (uint256);

    /// @notice Returns amount of debtToken to be locked on opening TrenBoxes
    /// as liquidation reserve.
    function getDebtTokenGasCompensation(address _collateral) external view returns (uint256);

    /// @notice Returns minimum amount of net debtToken a TrenBox must have
    function getMinNetDebt(address _collateral) external view returns (uint256);

    /// @notice Returns divisor to be used in percent calculation; min 2, max 200
    function getPercentDivisor(address _collateral) external view returns (uint256);

    /// @notice Returns one-time fee charged on the loan amount per collateral
    function getBorrowingFee(address _collateral) external view returns (uint256);

    /// @notice Returns redemption fee per collateral
    function getRedemptionFeeFloor(address _collateral) external view returns (uint256);

    /// @notice Returns redemption block timestamp per collateral
    function getRedemptionBlockTimestamp(address _collateral) external view returns (uint256);

    /// @notice Returns the total allocated amount of debtToken per collateral
    function getMintCap(address _collateral) external view returns (uint256);

    /// @notice Returns the current total amount of debtToken per collateral
    function getTotalAssetDebt(address _asset) external view returns (uint256);

    /// @notice Returns flash loan fee
    function getFlashLoanFee() external view returns (uint256);

    /// @notice Returns minimum amount of net debtToken for flash loan
    function getFlashLoanMinNetDebt() external view returns (uint256);

    /// @notice Returns maximum amount of net debtToken for flash loan
    function getFlashLoanMaxNetDebt() external view returns (uint256);

    /**
     * @notice Returns if collected fees go to stakers or treasury
     * if true, collected fees go to stakers; if false, to the treasury
     */
    function getRouteToTRENStaking() external view returns (bool);
}
