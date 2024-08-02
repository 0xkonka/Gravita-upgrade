// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";

import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { IFeeCollector } from "./Interfaces/IFeeCollector.sol";
import { ITRENStaking } from "./Interfaces/ITRENStaking.sol";
import { IAdminContract } from "./Interfaces/IAdminContract.sol";

/**
 * @title FeeCollector contract
 * @notice Handles the borrowing fee; controls the decaying refund and maintains
 * its record that includes the refund balance.
 */
contract FeeCollector is
    IFeeCollector,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    /// @notice The contract name.
    string public constant NAME = "FeeCollector";

    /// @notice The duration which the minimum fee is applied.
    uint256 public constant MIN_FEE_DAYS = 7;

    /// @notice The denominator value used in fee calculations.
    uint256 public constant DENOMINATOR = 1 ether;

    /// @notice The minimum fee fraction, divided by 26 (1/26).
    uint256 public constant MIN_FEE_FRACTION = 0.038461538 * 1 ether;

    /// @notice The duration which the fee refund is expired.
    /// ~ 6 months minus one week (MIN_FEE_DAYS)
    uint256 public constant FEE_EXPIRATION_SECONDS = 175 * 1 days;

    /// @notice The mapping from borrower address to the nested mapping from
    /// collateral asset address to fee record struct
    mapping(address borrower => mapping(address asset => FeeRecord feeParams)) public feeRecords;

    // Modifiers
    // --------------------------------------------------------------------------------------------------------

    modifier onlyBorrowerOperations() {
        if (msg.sender != borrowerOperations) {
            revert FeeCollector__BorrowerOperationsOnly(msg.sender, borrowerOperations);
        }
        _;
    }

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert FeeCollector__TrenBoxManagerOnly(msg.sender, trenBoxManager);
        }
        _;
    }

    modifier onlyBorrowerOperationsOrTrenBoxManager() {
        if (msg.sender != borrowerOperations && msg.sender != trenBoxManager) {
            revert FeeCollector__BorrowerOperationsOrTrenBoxManagerOnly(
                msg.sender, borrowerOperations, trenBoxManager
            );
        }
        _;
    }

    // Initializer
    // ------------------------------------------------------------------------------------------------------

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // ================= Public/External functions ================ //

    /// @inheritdoc IFeeCollector
    function increaseDebt(
        address _borrower,
        address _asset,
        uint256 _feeAmount
    )
        external
        override
        onlyBorrowerOperations
    {
        uint256 minFeeAmount = (MIN_FEE_FRACTION * _feeAmount) / DENOMINATOR;
        uint256 refundableFeeAmount = _feeAmount - minFeeAmount;
        uint256 feeToCollect = _createOrUpdateFeeRecord(_borrower, _asset, refundableFeeAmount);
        _collectFee(_borrower, _asset, minFeeAmount + feeToCollect);
    }

    /// @inheritdoc IFeeCollector
    function decreaseDebt(
        address _borrower,
        address _asset,
        uint256 _paybackFraction
    )
        external
        override
        onlyBorrowerOperationsOrTrenBoxManager
    {
        _decreaseDebt(_borrower, _asset, _paybackFraction);
    }

    /// @inheritdoc IFeeCollector
    function closeDebt(
        address _borrower,
        address _asset
    )
        external
        override
        onlyBorrowerOperationsOrTrenBoxManager
    {
        _decreaseDebt(_borrower, _asset, DENOMINATOR);
    }

    /// @inheritdoc IFeeCollector
    function simulateRefund(
        address _borrower,
        address _asset,
        uint256 _paybackFraction
    )
        external
        view
        override
        returns (uint256)
    {
        if (_paybackFraction > DENOMINATOR) {
            revert FeeCollector__PaybackFractionHigherThanOne();
        }
        if (_paybackFraction == 0) {
            revert FeeCollector__ZeroPaybackFraction();
        }

        FeeRecord storage record = feeRecords[_borrower][_asset];
        if (record.amount == 0 || record.to < block.timestamp) {
            return 0;
        }
        uint256 expiredAmount = _calcExpiredAmount(record.from, record.to, record.amount);
        if (_paybackFraction == 1e18) {
            // full payback
            return record.amount - expiredAmount;
        } else {
            // calc refund amount proportional to the payment
            return ((record.amount - expiredAmount) * _paybackFraction) / DENOMINATOR;
        }
    }

    /// @inheritdoc IFeeCollector
    function liquidateDebt(
        address _borrower,
        address _asset
    )
        external
        override
        onlyTrenBoxManager
    {
        uint256 mRecord = feeRecords[_borrower][_asset].amount;
        if (mRecord != 0) {
            _closeExpiredOrLiquidatedFeeRecord(_borrower, _asset, mRecord);
        }
    }

    /// @inheritdoc IFeeCollector
    function collectFees(
        address[] calldata _borrowers,
        address[] calldata _assets
    )
        external
        override
    {
        uint256 borrowersLength = _borrowers.length;
        if (borrowersLength != _assets.length || borrowersLength == 0) {
            revert FeeCollector__ArrayMismatch();
        }
        uint256 NOW = block.timestamp;
        for (uint256 i = 0; i < borrowersLength;) {
            address borrower = _borrowers[i];
            address asset = _assets[i];
            FeeRecord storage sRecord = feeRecords[borrower][asset];
            uint256 expiredAmount = _calcExpiredAmount(sRecord.from, sRecord.to, sRecord.amount);
            if (expiredAmount > 0) {
                uint256 updatedAmount = sRecord.amount - expiredAmount;
                sRecord.amount = updatedAmount;
                sRecord.from = NOW;
                _collectFee(borrower, asset, expiredAmount);
                emit FeeRecordUpdated(borrower, asset, NOW, sRecord.to, updatedAmount);
            }
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IFeeCollector
    function handleRedemptionFee(address _asset, uint256 _amount) external onlyTrenBoxManager {
        if (IAdminContract(adminContract).getRouteToTRENStaking()) {
            ITRENStaking(trenStaking).increaseFeeAsset(_asset, _amount);
        }
        emit RedemptionFeeCollected(_asset, _amount);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    // ================== View functions ================ //

    /// @inheritdoc IFeeCollector
    function getProtocolRevenueDestination() public view override returns (address) {
        return IAdminContract(adminContract).getRouteToTRENStaking() ? trenStaking : treasuryAddress;
    }

    // ================= Internal functions ================ //

    /**
     * @dev Decreases debt when a TrenBox is adjusted or closed, and the borrower
     * has paid back or decreased his loan.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _paybackFraction The amount that the borrower pays back.
     */
    function _decreaseDebt(address _borrower, address _asset, uint256 _paybackFraction) internal {
        uint256 NOW = block.timestamp;

        if (_paybackFraction > DENOMINATOR) {
            revert FeeCollector__PaybackFractionHigherThanOne();
        }
        if (_paybackFraction == 0) {
            revert FeeCollector__ZeroPaybackFraction();
        }

        FeeRecord storage sRecord = feeRecords[_borrower][_asset];
        if (sRecord.amount == 0) {
            return;
        }
        if (sRecord.to <= NOW) {
            _closeExpiredOrLiquidatedFeeRecord(_borrower, _asset, sRecord.amount);
        } else {
            // collect expired refund
            uint256 expiredAmount = _calcExpiredAmount(sRecord.from, sRecord.to, sRecord.amount);
            _collectFee(_borrower, _asset, expiredAmount);
            if (_paybackFraction == 1e18) {
                // on a full payback, there's no refund; refund amount is discounted from final
                // payment
                uint256 refundAmount = sRecord.amount - expiredAmount;
                IDebtToken(debtToken).burnFromWhitelistedContract(refundAmount);
                sRecord.amount = 0;
                emit FeeRecordUpdated(_borrower, _asset, NOW, 0, 0);
            } else {
                // refund amount proportional to the payment
                uint256 refundAmount =
                    ((sRecord.amount - expiredAmount) * _paybackFraction) / DENOMINATOR;
                _refundFee(_borrower, _asset, refundAmount);
                uint256 updatedAmount = sRecord.amount - expiredAmount - refundAmount;
                sRecord.amount = updatedAmount;
                sRecord.from = NOW;
                emit FeeRecordUpdated(_borrower, _asset, NOW, sRecord.to, updatedAmount);
            }
        }
    }

    /**
     * @dev Creates or updates fee record parameters for a specific collateral asset.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _feeAmount The fee amount to collect.
     */
    function _createOrUpdateFeeRecord(
        address _borrower,
        address _asset,
        uint256 _feeAmount
    )
        internal
        returns (uint256 feeToCollect)
    {
        FeeRecord storage sRecord = feeRecords[_borrower][_asset];
        if (sRecord.amount == 0) {
            _createFeeRecord(_borrower, _asset, _feeAmount, sRecord);
        } else {
            if (sRecord.to <= block.timestamp) {
                feeToCollect = sRecord.amount;
                _createFeeRecord(_borrower, _asset, _feeAmount, sRecord);
            } else {
                feeToCollect = _updateFeeRecord(_borrower, _asset, _feeAmount, sRecord);
            }
        }
    }

    /**
     * @dev Creates new fee record for a specific collateral asset.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _feeAmount The fee amount to add.
     * @param _sRecord The storage to store new fee record.
     */
    function _createFeeRecord(
        address _borrower,
        address _asset,
        uint256 _feeAmount,
        FeeRecord storage _sRecord
    )
        internal
    {
        uint256 from = block.timestamp + MIN_FEE_DAYS * 1 days;
        uint256 to = from + FEE_EXPIRATION_SECONDS;
        _sRecord.amount = _feeAmount;
        _sRecord.from = from;
        _sRecord.to = to;
        emit FeeRecordUpdated(_borrower, _asset, from, to, _feeAmount);
    }

    /**
     * @dev Updates the existing fee record for a specific collateral asset.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _addedAmount The fee amount to update.
     * @param _sRecord The storage to store updated fee record.
     */
    function _updateFeeRecord(
        address _borrower,
        address _asset,
        uint256 _addedAmount,
        FeeRecord storage _sRecord
    )
        internal
        returns (uint256)
    {
        uint256 NOW = block.timestamp;
        if (NOW < _sRecord.from) {
            // loan is still in its first week (MIN_FEE_DAYS)
            NOW = _sRecord.from;
        }
        uint256 expiredAmount = _calcExpiredAmount(_sRecord.from, _sRecord.to, _sRecord.amount);
        uint256 remainingAmount = _sRecord.amount - expiredAmount;
        uint256 remainingTime = _sRecord.to - NOW;
        uint256 updatedAmount = remainingAmount + _addedAmount;
        uint256 updatedTo = NOW + _calcNewDuration(remainingAmount, remainingTime, _addedAmount);
        _sRecord.amount = updatedAmount;
        _sRecord.from = NOW;
        _sRecord.to = updatedTo;
        emit FeeRecordUpdated(_borrower, _asset, NOW, updatedTo, updatedAmount);
        return expiredAmount;
    }

    /**
     * @dev Closes the expired or liquidated fee record for a specific collateral asset.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _amount The stored fee amount.
     */
    function _closeExpiredOrLiquidatedFeeRecord(
        address _borrower,
        address _asset,
        uint256 _amount
    )
        internal
    {
        _collectFee(_borrower, _asset, _amount);
        delete feeRecords[_borrower][_asset];
        emit FeeRecordUpdated(_borrower, _asset, block.timestamp, 0, 0);
    }

    /**
     * @dev Calculates the expired fee amount at the time.
     * @param _from The timestamp when the fee record is created.
     * @param _to The timestamp when the fee record expires.
     * @param _amount The amount of fee record.
     */
    function _calcExpiredAmount(
        uint256 _from,
        uint256 _to,
        uint256 _amount
    )
        internal
        view
        returns (uint256)
    {
        uint256 NOW = block.timestamp;
        if (_from > NOW) {
            return 0;
        }
        if (NOW >= _to) {
            return _amount;
        }
        uint256 PRECISION = 1e9;
        uint256 lifeTime = _to - _from;
        uint256 elapsedTime = NOW - _from;
        uint256 decayRate = (_amount * PRECISION) / lifeTime;
        uint256 expiredAmount = (elapsedTime * decayRate) / PRECISION;
        return expiredAmount;
    }

    /**
     * @dev Calculates new duration when fee record is updated.
     * @param _remainingAmount The amount of refundable fee.
     * @param _remainingTimeToLive The remaining duration until the refundable fee is all expired.
     * @param _addedAmount The added amount to fee record.
     */
    function _calcNewDuration(
        uint256 _remainingAmount,
        uint256 _remainingTimeToLive,
        uint256 _addedAmount
    )
        internal
        pure
        returns (uint256)
    {
        uint256 prevWeight = _remainingAmount * _remainingTimeToLive;
        uint256 nextWeight = _addedAmount * FEE_EXPIRATION_SECONDS;
        uint256 newDuration = (prevWeight + nextWeight) / (_remainingAmount + _addedAmount);
        return newDuration;
    }

    /**
     * @dev Transfers collected (debt token) fees to either the treasury or the staking contract.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _feeAmount The fee amount to collect.
     */
    function _collectFee(address _borrower, address _asset, uint256 _feeAmount) internal {
        if (_feeAmount != 0) {
            address destination = getProtocolRevenueDestination();
            IERC20(debtToken).safeTransfer(destination, _feeAmount);
            if (IAdminContract(adminContract).getRouteToTRENStaking()) {
                ITRENStaking(trenStaking).increaseFeeDebtToken(_feeAmount);
            }
            emit FeeCollected(_borrower, _asset, destination, _feeAmount);
        }
    }

    /**
     * @dev Refund the remaining fees to the borrower.
     * @param _borrower The address of borrower.
     * @param _asset The address of collateral asset.
     * @param _refundAmount The fee amount to refund.
     */
    function _refundFee(address _borrower, address _asset, uint256 _refundAmount) internal {
        if (_refundAmount != 0) {
            IERC20(debtToken).safeTransfer(_borrower, _refundAmount);
            emit FeeRefunded(_borrower, _asset, _refundAmount);
        }
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
