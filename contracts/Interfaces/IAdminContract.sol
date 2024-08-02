// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

/**
 * @title IAdminContract
 * @notice Defines the basic interface for AdminContract.
 */
interface IAdminContract {
    /**
     * @dev Struct for storing parameters of a specific collateral asset.
     * @param index The index to map to token address in collateral arrays.
     * @param active The status of collateral asset.
     * @param borrowingFee The one-time fee charged on the loan amount.
     * @param ccr Critical collateral ratio to trigger recovery mode.
     * @param previousCcr Critical collateral ratio before the update.
     * @param ccrUpdateDeadline The deadline before which the CCR will slowly update to the new
     * value.
     * @param mcr Minimum collateral ratio.
     * @param previousMcr Minimum collateral ratio before the update.
     * @param mcrUpdateDeadline The deadline before which the MCR will slowly update to the new
     * value.
     * @param debtTokenGasCompensation The amount of debt token to be locked
     * on opening TrenBoxes as liquidation reserve.
     * @param minNetDebt Minimum amount of debtToken a TrenBox must have.
     * @param mintCap The total amount of debt token that can be minted.
     * @param percentDivisor The liquidation fee.
     * @param redemptionFeeFloor The floor of redemption fee.
     * @param redemptionBlockTimestamp The timestamp which the redemption can be started from.
     */
    struct CollateralParams {
        uint256 index;
        bool active;
        uint256 borrowingFee;
        uint256 ccr;
        uint256 previousCcr;
        uint256 ccrUpdateDeadline;
        uint256 mcr;
        uint256 previousMcr;
        uint256 mcrUpdateDeadline;
        uint256 debtTokenGasCompensation;
        uint256 minNetDebt;
        uint256 mintCap;
        uint256 percentDivisor;
        uint256 redemptionFeeFloor;
        uint256 redemptionBlockTimestamp;
    }

    /**
     * @dev Struct for storing flash loan parameters.
     * @param flashLoanFee The flash loan fee. (10 = 0,1%, 100 = 10%)
     * @param flashLoanMinDebt The minimum amount of debt token to mint for flash loan.
     * @param flashLoanMaxDebt The maximum amount of debt token to mint for flash loan.
     */
    struct FlashLoanParams {
        uint256 flashLoanFee;
        uint256 flashLoanMinDebt;
        uint256 flashLoanMaxDebt;
    }

    /**
     * @dev Error emitted when the input value is not between min and max values.
     * @param _parameter The label of input parameter.
     * @param _valueEntered The input value.
     * @param _minValue The minimum value.
     * @param _maxValue The maximum value.
     */
    error SafeCheckError(
        string _parameter, uint256 _valueEntered, uint256 _minValue, uint256 _maxValue
    );

    /**
     * @dev Error emitted when the AdminContract is already initialized.
     */
    error AdminContract__AlreadyInitialized();

    /**
     * @dev Error emitted when the caller is not owner.
     */
    error AdminContract__OnlyOwner();

    /**
     * @dev Error emitted when the caller is not timelock contract.
     */
    error AdminContract__OnlyTimelock();

    /**
     * @dev Error emitted when the collateral asset already exists.
     */
    error AdminContract__CollateralExists();

    /**
     * @dev Error emitted when the collateral asset does not exist.
     */
    error AdminContract__CollateralDoesNotExist();

    /**
     * @dev Error emitted when the collateral asset is not active.
     */
    error AdminContract__CollateralNotConfigured();

    /**
     * @dev Emitted when the collateral asset is added.
     * @param _collateral The address of collateral asset.
     */
    event CollateralAdded(address _collateral);

    /**
     * @dev Emitted when the minimum collateral ratio is updated.
     * @param _oldMCR The old minimum collateral ratio.
     * @param _newMCR The new minimum collateral ratio.
     */
    event MCRChanged(uint256 _oldMCR, uint256 _newMCR);

    /**
     * @dev Emitted when the critical collateral ratio is updated.
     * @param _oldCCR The old critical collateral ratio.
     * @param _newCCR The new critical collateral ratio.
     */
    event CCRChanged(uint256 _oldCCR, uint256 _newCCR);

    /**
     * @dev Emitted when the minimum amount of debt token is updated.
     * @param _oldMinNet The old minimum amount of debt token.
     * @param _newMinNet The new minimum amount of debt token.
     */
    event MinNetDebtChanged(uint256 _oldMinNet, uint256 _newMinNet);

    /**
     * @dev Emitted when the liquidation fee is updated.
     * @param _oldPercentDiv The old liquidation fee.
     * @param _newPercentDiv The new liquidation fee.
     */
    event PercentDivisorChanged(uint256 _oldPercentDiv, uint256 _newPercentDiv);

    /**
     * @dev Emitted when the borrowing fee is updated.
     * @param _oldBorrowingFee The old borrowing fee.
     * @param _newBorrowingFee The new borrowing fee.
     */
    event BorrowingFeeChanged(uint256 _oldBorrowingFee, uint256 _newBorrowingFee);

    /**
     * @dev Emitted when the floor of redemption fee is updated.
     * @param _oldRedemptionFeeFloor The old floor of redemption fee.
     * @param _newRedemptionFeeFloor The new floor of redemption fee.
     */
    event RedemptionFeeFloorChanged(uint256 _oldRedemptionFeeFloor, uint256 _newRedemptionFeeFloor);

    /**
     * @dev Emitted when the mint cap is updated.
     * @param _oldMintCap The old mint cap.
     * @param _newMintCap The new mint cap.
     */
    event MintCapChanged(uint256 _oldMintCap, uint256 _newMintCap);

    /**
     * @dev Emitted when the redemption timestamp of specific collateral is updated.
     * @param _collateral The address of collateral asset.
     * @param _blockTimestamp The new redemption timestamp.
     */
    event RedemptionBlockTimestampChanged(address _collateral, uint256 _blockTimestamp);

    /**
     * @dev Emitted when the flash loan fee is updated.
     * @param _oldFee The old flash loan fee.
     * @param _newFee The new flash loan fee.
     */
    event FlashLoanFeeChanged(uint256 _oldFee, uint256 _newFee);

    /**
     * @dev Emitted when the minimum amount of debt token for flash loan is updated.
     * @param _oldMinDebt The old minimum amount of debt token.
     * @param _newMinDebt The new minimum amount of debt token.
     */
    event FlashLoanMinDebtChanged(uint256 _oldMinDebt, uint256 _newMinDebt);

    /**
     * @dev Emitted when the maximum amount of debt token for flash loan is updated.
     * @param _oldMaxDebt The old minimum amount of debt token.
     * @param _newMaxDebt The new minimum amount of debt token.
     */
    event FlashLoanMaxDebtChanged(uint256 _oldMaxDebt, uint256 _newMaxDebt);

    /**
     * @dev Emmited after deployment to indicate that the setup is initialized with all initial
     * collaterals
     */
    event SetupInitialized();

    /// @notice Returns decimal precision, 1 ether.
    function DECIMAL_PRECISION() external pure returns (uint256);

    /// @notice Returns the scaled number which means 100 percent, 1 ether.
    function _100pct() external view returns (uint256);

    /**
     * @notice Adds new collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _debtTokenGasCompensation The amount of debtToken to be locked on opening
     * TrenBoxes as liquidation reserve.
     */
    function addNewCollateral(address _collateral, uint256 _debtTokenGasCompensation) external;

    /**
     * @notice Adds and initializes new collateral asset. Does not apply grace period deadline for
     * CCR and MCR.
     * @param _collateral The address of collateral asset.
     * @param _debtTokenGasCompensation The amount of debtToken to be locked on opening
     * TrenBoxes as liquidation reserve.
     * @param _borrowingFee The one-time fee charged on the loan amount.
     * @param _ccr The critical collateral ratio to trigger recovery mode.
     * @param _mcr The minimum collateral ratio to avoid liquidation under normal mode.
     * @param _minNetDebt The minimum amount of debtToken a TrenBox must have.
     * @param _mintCap The total amount of debt tokens to be allocated.
     * @param _percentDivisor The liquidation fee.
     * @param _redemptionFeeFloor The floor of redemption fee.
     */
    function addAndInitializeNewCollateral(
        address _collateral,
        uint256 _debtTokenGasCompensation,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor,
        uint256 _redemptionFeeFloor
    )
        external;

    /**
     * @notice Sets collateral parameters. Apply grace period deadline for CCR and MCR.
     * @param _collateral The address of collateral asset.
     * @param _borrowingFee The one-time fee charged on the loan amount.
     * @param _ccr The critical collateral ratio to trigger recovery mode.
     * @param _mcr The minimum collateral ratio to avoid liquidation under normal mode.
     * @param _minNetDebt The minimum amount of debtToken a TrenBox must have.
     * @param _mintCap The total amount of debt tokens to be allocated.
     * @param _percentDivisor The liquidation fee.
     * @param _redemptionFeeFloor The floor of redemption fee.
     */
    function setCollateralParameters(
        address _collateral,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor,
        uint256 _redemptionFeeFloor
    )
        external;

    /**
     * @notice Set the status for the specific collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _active The status of collateral; true or false.
     */
    function setIsActive(address _collateral, bool _active) external;
    /**
     * @notice Sets the minimum collateral ratio.
     * @param _collateral The address of collateral asset.
     * @param _newMCR The minimum collateral ratio to avoid liquidations under normal mode.
     */
    function setMCR(address _collateral, uint256 _newMCR) external;

    /**
     * @notice Sets the critical collateral ratio.
     * @param _collateral The address of collateral asset.
     * @param _newCCR The new critical collateral ratio. If the system's total collateral ratio
     * (TCR) falls below the CCR, Recovery Mode is triggered.
     */
    function setCCR(address _collateral, uint256 _newCCR) external;

    /**
     * @notice Sets the minimum amount of debt token to mint when opening a TrenBox.
     * @param _collateral The address of collateral asset.
     * @param _minNetDebt The minimum amount of debt token a TrenBox must have.
     */
    function setMinNetDebt(address _collateral, uint256 _minNetDebt) external;

    /**
     * @notice Sets the liquidation fee.
     * @param _collateral The address of collateral asset.
     * @param _percentDivisor The new :(min 2, max 200).
     */
    function setPercentDivisor(address _collateral, uint256 _percentDivisor) external;

    /**
     * @notice Sets the borrowing fee.
     * @param _collateral The address of collateral asset.
     * @param _borrowingFee The one-time fee charged on the loan amount.
     */
    function setBorrowingFee(address _collateral, uint256 _borrowingFee) external;

    /**
     * @notice Sets the floor of redemption fee.
     * @param _collateral The address of collateral asset.
     * @param _redemptionFeeFloor The floor of redemption fee charged on the redeemed
     * amount(scaled by 1e18); min 0.001(0.1%), max 0.1(10%).
     */
    function setRedemptionFeeFloor(address _collateral, uint256 _redemptionFeeFloor) external;

    /**
     * @notice Sets the total amount of debt tokens that can be allocated.
     * @param _collateral The address of collateral asset.
     * @param _mintCap The mint cap.
     */
    function setMintCap(address _collateral, uint256 _mintCap) external;

    /**
     * @notice Sets the redemption timestamp.
     * @param _collateral The address of collateral asset.
     * @param _blockTimestamp The timestamp which redemption can be started from.
     */
    function setRedemptionBlockTimestamp(address _collateral, uint256 _blockTimestamp) external;

    /**
     * @notice Sets the flash loan fee.
     * @param _flashLoanFee The new flash loan fee.
     */
    function setFeeForFlashLoan(uint256 _flashLoanFee) external;

    /**
     * @notice Sets the minimum amount of debt token to mint for flash loan.
     * @param _flashLoanMinDebt The new minimum amount of debt token.
     */
    function setMinDebtForFlashLoan(uint256 _flashLoanMinDebt) external;

    /**
     * @notice Sets the maximum amount of debt token to mint for flash loan.
     * @param _flashLoanMaxDebt The new maximum amount of debt token.
     */
    function setMaxDebtForFlashLoan(uint256 _flashLoanMaxDebt) external;

    /// @notice Changes the destination where the collected fees go.
    function switchRouteToTRENStaking() external;

    /**
     * @notice Returns the index of a specific collateral which maps to
     * asset address in collateral array.
     * @param _collateral The address of collateral asset.
     */
    function getIndex(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the list of index matched with collateral arrays.
     * @param _colls The arrays of collateral assets.
     */
    function getIndices(address[] memory _colls) external view returns (uint256[] memory);

    /**
     * @notice Returns if a specific collateral is active or not.
     * @param _collateral The address of collateral asset.
     */
    function getIsActive(address _collateral) external view returns (bool);

    /// @notice Returns list of all collateral types in collateral params.
    function getValidCollateral() external view returns (address[] memory);

    /**
     * @notice Returns the minimum collateral ratio of a specific collateral asset.
     * @param _collateral The address of collateral asset.
     */
    function getMcr(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the critical collateral ratio of a specific collateral asset.
     * @param _collateral The address of collateral asset.
     */
    function getCcr(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the amount of debt token to be locked on opening TrenBoxes
     * as liquidation reserve.
     * @param _collateral The address of collateral asset.
     */
    function getDebtTokenGasCompensation(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the minimum amount of debt token a TrenBox must have.
     * @param _collateral The address of collateral asset.
     */
    function getMinNetDebt(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the liquidation fee; min 2, max 200.
     * @param _collateral The address of collateral asset.
     */
    function getPercentDivisor(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the one-time fee charged on the loan amount.
     * @param _collateral The address of collateral asset.
     */
    function getBorrowingFee(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the floor of redemption fee for the specific collateral.
     * @param _collateral The address of collateral asset.
     */
    function getRedemptionFeeFloor(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the redemption timestamp for the specific collateral.
     * @param _collateral The address of collateral asset.
     */
    function getRedemptionBlockTimestamp(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the total allocated amount of debt token for the specific collateral.
     * @param _collateral The address of collateral asset.
     */
    function getMintCap(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the current total amount of debt token for the specific collateral.
     * @param _asset The address of collateral asset.
     */
    function getTotalAssetDebt(address _asset) external view returns (uint256);

    /// @notice Returns the flash loan fee.
    function getFlashLoanFee() external view returns (uint256);

    /// @notice Returns the minimum amount of debt token to mint for flash loan.
    function getFlashLoanMinNetDebt() external view returns (uint256);

    /// @notice Returns the maximum amount of debt token to mint for flash loan.
    function getFlashLoanMaxNetDebt() external view returns (uint256);

    /**
     * @notice Returns if the collected fees go to stakers or treasury.
     * if true, collected fees go to stakers; if false, to the treasury
     */
    function getRouteToTRENStaking() external view returns (bool);
}
