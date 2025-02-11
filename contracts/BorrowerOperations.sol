// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { TrenMath } from "./Dependencies/TrenMath.sol";
import { TrenBase } from "./Dependencies/TrenBase.sol";
import { SafetyTransfer } from "./Dependencies/SafetyTransfer.sol";

import { IPriceFeed } from "./Interfaces/IPriceFeed.sol";
import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { IBorrowerOperations } from "./Interfaces/IBorrowerOperations.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { IFeeCollector } from "./Interfaces/IFeeCollector.sol";
import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";

/**
 * @title BorrowerOperations contract
 * @notice Contains the basic operations by which borrowers interact with their TrenBoxes:
 * TrenBox creation, collateral top-up / withdrawal, debt token issuance and repayment.
 */
contract BorrowerOperations is
    TrenBase,
    ReentrancyGuardUpgradeable,
    UUPSUpgradeable,
    IBorrowerOperations
{
    using SafeERC20 for IERC20;

    /// @notice The contract name.
    string public constant NAME = "BorrowerOperations";

    // --- Initializer ---

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // --- External/Public Functions ---

    /// @inheritdoc IBorrowerOperations
    function openTrenBox(
        address _asset,
        uint256 _assetAmount,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        if (!IAdminContract(adminContract).getIsActive(_asset)) {
            revert BorrowerOperations__NotActiveColl();
        }

        OpenTrenBox memory vars;
        vars.asset = _asset;

        vars.price = IPriceFeed(priceFeed).fetchPrice(vars.asset);
        bool isRecoveryMode = _checkRecoveryMode(vars.asset, vars.price);

        if (ITrenBoxManager(trenBoxManager).isTrenBoxActive(_asset, msg.sender)) {
            revert BorrowerOperations__TrenBoxIsActive();
        }

        vars.netDebt = _debtTokenAmount;

        if (!isRecoveryMode) {
            vars.debtTokenFee = _triggerBorrowingFee(vars.asset, _debtTokenAmount);
            vars.netDebt = vars.netDebt + vars.debtTokenFee;
        }
        _requireAtLeastMinNetDebt(vars.asset, vars.netDebt);

        // ICR is based on the composite debt, i.e. the requested debt token amount + borrowing fee
        // + gas comp.
        uint256 gasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(vars.asset);
        vars.compositeDebt = vars.netDebt + gasCompensation;
        if (vars.compositeDebt == 0) {
            revert BorrowerOperations__CompositeDebtZero();
        }

        vars.ICR = TrenMath._computeCR(_assetAmount, vars.compositeDebt, vars.price);
        vars.NICR = TrenMath._computeNominalCR(_assetAmount, vars.compositeDebt);

        if (isRecoveryMode) {
            _requireICRisAboveCCR(vars.asset, vars.ICR);
        } else {
            _requireICRisAboveMCR(vars.asset, vars.ICR);
            uint256 newTCR = _getNewTCRFromTrenBoxChange(
                vars.asset, _assetAmount, true, vars.compositeDebt, true, vars.price
            ); // bools: coll increase, debt increase
            _requireNewTCRisAboveCCR(vars.asset, newTCR);
        }

        // Set the trenBox struct's properties
        ITrenBoxManager(trenBoxManager).setTrenBoxStatus(vars.asset, msg.sender, 1);

        uint256 collateralAmountAfterIncrease = ITrenBoxManager(trenBoxManager).increaseTrenBoxColl(
            vars.asset, msg.sender, _assetAmount
        );
        uint256 debtAmount_ = ITrenBoxManager(trenBoxManager).increaseTrenBoxDebt(
            vars.asset, msg.sender, vars.compositeDebt
        );

        ITrenBoxManager(trenBoxManager).updateTrenBoxRewardSnapshots(vars.asset, msg.sender);
        vars.stake =
            ITrenBoxManager(trenBoxManager).updateStakeAndTotalStakes(vars.asset, msg.sender);

        ISortedTrenBoxes(sortedTrenBoxes).insert(
            vars.asset, msg.sender, vars.NICR, _upperHint, _lowerHint
        );
        vars.arrayIndex =
            ITrenBoxManager(trenBoxManager).addTrenBoxOwnerToArray(vars.asset, msg.sender);
        emit TrenBoxCreated(vars.asset, msg.sender, vars.arrayIndex);

        // Moves the collateral to the trenBox storage pool
        _trenBoxStorageAddColl(vars.asset, _assetAmount);
        // Mints the debtToken amount to the borrower
        _withdrawDebtTokens(vars.asset, msg.sender, _debtTokenAmount, vars.netDebt);

        // Move the debtToken gas compensation to the TrenBoxStorage
        if (gasCompensation != 0) {
            _withdrawDebtTokens(vars.asset, trenBoxStorage, gasCompensation, gasCompensation);
        }

        emit TrenBoxUpdated(
            vars.asset,
            msg.sender,
            debtAmount_,
            collateralAmountAfterIncrease,
            vars.stake,
            BorrowerOperation.openTrenBox
        );
        emit BorrowingFeePaid(vars.asset, msg.sender, vars.debtTokenFee);
    }

    /// @inheritdoc IBorrowerOperations
    function addColl(
        address _asset,
        uint256 _assetSent,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        _adjustTrenBox(_asset, _assetSent, msg.sender, 0, 0, false, _upperHint, _lowerHint);
    }

    /// @inheritdoc IBorrowerOperations
    function withdrawColl(
        address _asset,
        uint256 _collWithdrawal,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        _adjustTrenBox(_asset, 0, msg.sender, _collWithdrawal, 0, false, _upperHint, _lowerHint);
    }

    /// @inheritdoc IBorrowerOperations
    function withdrawDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        _adjustTrenBox(_asset, 0, msg.sender, 0, _debtTokenAmount, true, _upperHint, _lowerHint);
    }

    /// @inheritdoc IBorrowerOperations
    function repayDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        if (
            _debtTokenAmount
                >= _getNetDebt(
                    _asset, ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset, msg.sender)
                )
        ) {
            _closeTrenBox(_asset, msg.sender);
        } else {
            _adjustTrenBox(
                _asset, 0, msg.sender, 0, _debtTokenAmount, false, _upperHint, _lowerHint
            );
        }
    }

    function repayDebtTokensWithFlashloan(
        address _asset,
        address _borrower
    )
        external
        override
        nonReentrant
    {
        if (msg.sender != flashLoanAddress) {
            revert BorrowerOperations__OnlyFlashLoanAddress();
        }
        _closeTrenBox(_asset, _borrower);
    }

    /// @inheritdoc IBorrowerOperations
    function adjustTrenBox(
        address _asset,
        uint256 _assetSent,
        uint256 _collWithdrawal,
        uint256 _debtTokenChange,
        bool _isDebtIncrease,
        address _upperHint,
        address _lowerHint
    )
        external
        override
        nonReentrant
    {
        _adjustTrenBox(
            _asset,
            _assetSent,
            msg.sender,
            _collWithdrawal,
            _debtTokenChange,
            _isDebtIncrease,
            _upperHint,
            _lowerHint
        );
    }

    /// @inheritdoc IBorrowerOperations
    function claimCollateral(address _asset) external override {
        ITrenBoxStorage(trenBoxStorage).claimCollateral(_asset, msg.sender);
    }

    /// @inheritdoc IBorrowerOperations
    function getCompositeDebt(
        address _asset,
        uint256 _debt
    )
        external
        view
        override
        returns (uint256)
    {
        return _getCompositeDebt(_asset, _debt);
    }

    /**
     * @dev Alongside a debt change, this function can perform either a collateral top-up or
     * a collateral withdrawal.
     * @param _asset The address of collateral asset.
     * @param _assetSent The amount of collateral asset to send.
     * @param _borrower The borrower address.
     * @param _collWithdrawal The amount of collateral asset to withdraw.
     * @param _debtTokenChange The amount of debt token to withdraw or repay.
     * @param _isDebtIncrease The flag to indicate if current operation is withdrawal or repayment.
     * @param _upperHint Id of previous node for the new insert position.
     * @param _lowerHint Id of next node for the new insert position.
     */
    function _adjustTrenBox(
        address _asset,
        uint256 _assetSent,
        address _borrower,
        uint256 _collWithdrawal,
        uint256 _debtTokenChange,
        bool _isDebtIncrease,
        address _upperHint,
        address _lowerHint
    )
        internal
    {
        AdjustTrenBox memory vars;
        vars.asset = _asset;
        vars.price = IPriceFeed(priceFeed).fetchPrice(vars.asset);
        bool isRecoveryMode = _checkRecoveryMode(vars.asset, vars.price);

        if (_isDebtIncrease) {
            if (_debtTokenChange == 0) {
                revert BorrowerOperations__ZeroDebtChange();
            }
        }
        _requireSingularCollChange(_collWithdrawal, _assetSent);
        _requireNonZeroAdjustment(_collWithdrawal, _debtTokenChange, _assetSent);
        _requireTrenBoxIsActive(vars.asset, _borrower);

        // Confirm the operation is either a borrower adjusting their own trenBox, or a pure asset
        // transfer from the Stability Pool to a trenBox
        assert(
            msg.sender == _borrower
                || (stabilityPool == msg.sender && _assetSent != 0 && _debtTokenChange == 0)
        );

        ITrenBoxManager(trenBoxManager).applyPendingRewards(vars.asset, _borrower);

        // Get the collChange based on whether or not asset was sent in the transaction
        (vars.collChange, vars.isCollIncrease) = _getCollChange(_assetSent, _collWithdrawal);

        vars.netDebtChange = _debtTokenChange;

        // If the adjustment incorporates a debt increase and system is in Normal Mode, then trigger
        // a borrowing fee
        if (_isDebtIncrease && !isRecoveryMode) {
            vars.debtTokenFee = _triggerBorrowingFee(vars.asset, _debtTokenChange);
            // The raw debt change includes the fee
            vars.netDebtChange = vars.netDebtChange + vars.debtTokenFee;
        }

        vars.debt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset, _borrower);
        vars.coll = ITrenBoxManager(trenBoxManager).getTrenBoxColl(vars.asset, _borrower);

        // Get the trenBox's old ICR before the adjustment, and what its new ICR will be after the
        // adjustment
        vars.oldICR = TrenMath._computeCR(vars.coll, vars.debt, vars.price);
        vars.newICR = _getNewICRFromTrenBoxChange(
            vars.coll,
            vars.debt,
            vars.collChange,
            vars.isCollIncrease,
            vars.netDebtChange,
            _isDebtIncrease,
            vars.price
        );
        if (_collWithdrawal > vars.coll) {
            revert BorrowerOperations__InsufficientCollateral();
        }

        // Check the adjustment satisfies all conditions for the current system mode
        _requireValidAdjustmentInCurrentMode(
            vars.asset, isRecoveryMode, _collWithdrawal, _isDebtIncrease, vars
        );

        // When the adjustment is a debt repayment, check it's a valid amount and that the caller
        // has enough debt tokens
        if (!_isDebtIncrease && _debtTokenChange != 0) {
            _requireSufficientDebtTokenBalance(_borrower, vars.netDebtChange);
        }

        (vars.newColl, vars.newDebt) = _updateTrenBoxFromAdjustment(
            vars.asset,
            _borrower,
            vars.collChange,
            vars.isCollIncrease,
            vars.netDebtChange,
            _isDebtIncrease
        );
        vars.stake =
            ITrenBoxManager(trenBoxManager).updateStakeAndTotalStakes(vars.asset, _borrower);

        // Re-insert trenBox in to the sorted list
        uint256 newNICR = _getNewNominalICRFromTrenBoxChange(
            vars.coll,
            vars.debt,
            vars.collChange,
            vars.isCollIncrease,
            vars.netDebtChange,
            _isDebtIncrease
        );
        ISortedTrenBoxes(sortedTrenBoxes).reInsert(
            vars.asset, _borrower, newNICR, _upperHint, _lowerHint
        );

        emit TrenBoxUpdated(
            vars.asset,
            _borrower,
            vars.newDebt,
            vars.newColl,
            vars.stake,
            BorrowerOperation.adjustTrenBox
        );
        emit BorrowingFeePaid(vars.asset, msg.sender, vars.debtTokenFee);

        // Use the unmodified _debtTokenChange here, as we don't send the fee to the user
        _moveTokensFromAdjustment(
            vars.asset,
            msg.sender,
            vars.collChange,
            vars.isCollIncrease,
            _debtTokenChange,
            _isDebtIncrease,
            vars.netDebtChange
        );
    }

    /**
     * @dev Allows borrowers to repay all debt, withdraw all their collateral,
     * and close their trenBoxes.
     * @param _asset The address of collateral asset.
     */
    function _closeTrenBox(address _asset, address _borrower) internal {
        _requireTrenBoxIsActive(_asset, _borrower);
        uint256 price = IPriceFeed(priceFeed).fetchPrice(_asset);
        _requireNotInRecoveryMode(_asset, price);

        ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset, _borrower);

        uint256 coll = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset, _borrower);
        uint256 debt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset, _borrower);

        uint256 gasCompensation = IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
        uint256 refund = IFeeCollector(feeCollector).simulateRefund(_borrower, _asset, 1 ether);
        uint256 netDebt = debt - gasCompensation - refund;

        _requireSufficientDebtTokenBalance(_borrower, netDebt);

        uint256 newTCR = _getNewTCRFromTrenBoxChange(_asset, coll, false, debt, false, price);
        _requireNewTCRisAboveCCR(_asset, newTCR);

        ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);
        ITrenBoxManager(trenBoxManager).closeTrenBox(_asset, _borrower);

        emit TrenBoxUpdated(_asset, _borrower, 0, 0, 0, BorrowerOperation.closeTrenBox);

        // Burn the repaid debt tokens from the user's balance and the gas compensation from
        // TrenBoxStorage
        _repayDebtTokens(_asset, _borrower, netDebt, refund);
        if (gasCompensation != 0) {
            _repayDebtTokens(_asset, trenBoxStorage, gasCompensation, 0);
        }

        // Signal to the fee collector that debt has been paid in full
        IFeeCollector(feeCollector).closeDebt(_borrower, _asset);

        // Send the collateral back to the user or FlashLoan contract
        if (msg.sender == flashLoanAddress) {
            ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset, flashLoanAddress, coll);
        } else {
            ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset, _borrower, coll);
        }
    }

    /**
     * @dev Charges borrowing fee on the loan amount.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The loan amount.
     */
    function _triggerBorrowingFee(
        address _asset,
        uint256 _debtTokenAmount
    )
        internal
        returns (uint256)
    {
        uint256 debtTokenFee =
            ITrenBoxManager(trenBoxManager).getBorrowingFee(_asset, _debtTokenAmount);
        IDebtToken(debtToken).mint(_asset, feeCollector, debtTokenFee);
        IFeeCollector(feeCollector).increaseDebt(msg.sender, _asset, debtTokenFee);
        return debtTokenFee;
    }

    /**
     * @dev Gets collateral change with flag to indicate if it's a top-up or withdrawal.
     * @param _collReceived The amount of top-up collateral.
     * @param _requestedCollWithdrawal The amount of collateral withdrawal.
     */
    function _getCollChange(
        uint256 _collReceived,
        uint256 _requestedCollWithdrawal
    )
        internal
        pure
        returns (uint256 collChange, bool isCollIncrease)
    {
        if (_collReceived != 0) {
            collChange = _collReceived;
            isCollIncrease = true;
        } else {
            collChange = _requestedCollWithdrawal;
        }
    }

    /**
     * @dev Updates trenBox's collateral and debt balances based on whether they increase
     * or decrease.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate if it's a collateral top-up or withdrawal.
     * @param _debtChange The amount of debt change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     */
    function _updateTrenBoxFromAdjustment(
        address _asset,
        address _borrower,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtChange,
        bool _isDebtIncrease
    )
        internal
        returns (uint256, uint256)
    {
        uint256 newColl = (_isCollIncrease)
            ? ITrenBoxManager(trenBoxManager).increaseTrenBoxColl(_asset, _borrower, _collChange)
            : ITrenBoxManager(trenBoxManager).decreaseTrenBoxColl(_asset, _borrower, _collChange);
        uint256 newDebt = (_isDebtIncrease)
            ? ITrenBoxManager(trenBoxManager).increaseTrenBoxDebt(_asset, _borrower, _debtChange)
            : ITrenBoxManager(trenBoxManager).decreaseTrenBoxDebt(_asset, _borrower, _debtChange);

        return (newColl, newDebt);
    }

    /**
     * @dev Triggers actual collateral asset or debt token transfer from a trenBox adjustment.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate if it's a collateral top-up or withdrawal.
     * @param _debtTokenChange The amount of debt token change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     * @param _netDebtChange The amount of raw debt change including fee.
     */
    function _moveTokensFromAdjustment(
        address _asset,
        address _borrower,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtTokenChange,
        bool _isDebtIncrease,
        uint256 _netDebtChange
    )
        internal
    {
        if (_isDebtIncrease) {
            _withdrawDebtTokens(_asset, _borrower, _debtTokenChange, _netDebtChange);
        } else {
            _repayDebtTokens(_asset, _borrower, _debtTokenChange, 0);
        }
        if (_isCollIncrease) {
            _trenBoxStorageAddColl(_asset, _collChange);
        } else {
            ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset, _borrower, _collChange);
        }
    }

    /**
     * @dev Sends specific collateral amount to TrenBoxStorage and increases its recorded
     * asset balance.
     * @param _asset The address of collateral asset.
     * @param _amount The amount of collateral asset.
     */
    function _trenBoxStorageAddColl(address _asset, uint256 _amount) internal {
        ITrenBoxStorage(trenBoxStorage).increaseActiveCollateral(_asset, _amount);
        IERC20(_asset).safeTransferFrom(
            msg.sender, trenBoxStorage, SafetyTransfer.decimalsCorrection(_asset, _amount)
        );
    }

    /**
     * @dev Issues the specific amount of debt tokens and increases the total active debt
     * (_netDebtIncrease potentially includes a debtTokenFee).
     * @param _asset The address of collateral asset.
     * @param _account The address of trenBox owner.
     * @param _debtTokenAmount The amount of total debt change.
     * @param _netDebtIncrease The amount of net debt change.
     */
    function _withdrawDebtTokens(
        address _asset,
        address _account,
        uint256 _debtTokenAmount,
        uint256 _netDebtIncrease
    )
        internal
    {
        uint256 newTotalAssetDebt =
            ITrenBoxStorage(trenBoxStorage).getTotalDebtBalance(_asset) + _netDebtIncrease;
        if (newTotalAssetDebt > IAdminContract(adminContract).getMintCap(_asset)) {
            revert BorrowerOperations__ExceedMintCap();
        }
        ITrenBoxStorage(trenBoxStorage).increaseActiveDebt(_asset, _netDebtIncrease);
        IDebtToken(debtToken).mint(_asset, _account, _debtTokenAmount);
    }

    /**
     * @dev Burns the specific amount of debt tokens and decreases the total active debt.
     * @param _asset The address of collateral asset.
     * @param _account The address of trenBox owner.
     * @param _debtTokenAmount The amount of total debt change.
     * @param _refund The refund amount of debt tokens.
     */
    function _repayDebtTokens(
        address _asset,
        address _account,
        uint256 _debtTokenAmount,
        uint256 _refund
    )
        internal
    {
        /// @dev the borrowing fee partial refund is accounted for when decreasing the debt, as it
        /// was included when trenBox was opened
        ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset, _debtTokenAmount + _refund);
        /// @dev the borrowing fee partial refund is not burned here, as it has already been burned
        /// by the FeeCollector
        IDebtToken(debtToken).burn(_account, _debtTokenAmount);
    }

    // --- 'Require' wrapper functions ---

    /**
     * @dev Requires singular collateral change.
     * @param _collWithdrawal The amount of collateral withdrawal.
     * @param _amountSent The amount of a top-up collateral.
     */
    function _requireSingularCollChange(
        uint256 _collWithdrawal,
        uint256 _amountSent
    )
        internal
        pure
    {
        if (_collWithdrawal != 0 && _amountSent != 0) {
            revert BorrowerOperations__NotSingularChange();
        }
    }

    /**
     * @dev Requires non-zero adjustment in either collateral or debt balance.
     * @param _collWithdrawal The amount of collateral withdrawal.
     * @param _debtTokenChange The amount of total debt change.
     * @param _assetSent The amount of a top-up collateral.
     */
    function _requireNonZeroAdjustment(
        uint256 _collWithdrawal,
        uint256 _debtTokenChange,
        uint256 _assetSent
    )
        internal
        pure
    {
        if (_collWithdrawal == 0 && _debtTokenChange == 0 && _assetSent == 0) {
            revert BorrowerOperations__ZeroAdjustment();
        }
    }

    /**
     * @dev Requires that a trenBox is active.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     */
    function _requireTrenBoxIsActive(address _asset, address _borrower) internal view {
        if (!ITrenBoxManager(trenBoxManager).isTrenBoxActive(_asset, _borrower)) {
            revert BorrowerOperations__TrenBoxNotExistOrClosed();
        }
    }

    /**
     * @dev Requires that the current operation is not in Recovery Mode.
     * @param _asset The address of collateral asset.
     * @param _price The price of collateral asset.
     */
    function _requireNotInRecoveryMode(address _asset, uint256 _price) internal view {
        if (_checkRecoveryMode(_asset, _price)) {
            revert BorrowerOperations__OperationInRecoveryMode();
        }
    }

    /**
     * @dev Requires no collateral withdrawal in Recovery Mode.
     * @param _collWithdrawal The amount of collateral withdrawal.
     */
    function _requireNoCollWithdrawal(uint256 _collWithdrawal) internal pure {
        if (_collWithdrawal != 0) {
            revert BorrowerOperations__CollWithdrawalInRecoveryMode();
        }
    }

    /**
     * @dev Requires valid adjustment in respective modes.
     * @param _asset The address of collateral asset.
     * @param _isRecoveryMode The flag to indicate if current mode is Recovery Mode or not.
     * @param _collWithdrawal The amount of collateral withdrawal.
     * @param _isDebtIncrease The flag to indicate if current operation is withdrawal or repayment.
     * @param _vars The struct variable to store adjustment parameters.
     */
    function _requireValidAdjustmentInCurrentMode(
        address _asset,
        bool _isRecoveryMode,
        uint256 _collWithdrawal,
        bool _isDebtIncrease,
        AdjustTrenBox memory _vars
    )
        internal
        view
    {
        /*
         * In Recovery Mode, only allow:
         *
         * - Pure collateral top-up
         * - Pure debt repayment
         * - Collateral top-up with debt repayment
        * - A debt increase combined with a collateral top-up which makes the ICR >= 150% and
        improves the ICR (and by extension improves the TCR).
         *
         * In Normal Mode, ensure:
         *
         * - The new ICR is above MCR
         * - The adjustment won't pull the TCR below CCR
         */
        if (_isRecoveryMode) {
            _requireNoCollWithdrawal(_collWithdrawal);
            if (_isDebtIncrease) {
                _requireICRisAboveCCR(_asset, _vars.newICR);
                _requireNewICRisAboveOldICR(_vars.newICR, _vars.oldICR);
            }
        } else {
            // if Normal Mode
            _requireICRisAboveMCR(_asset, _vars.newICR);
            _vars.newTCR = _getNewTCRFromTrenBoxChange(
                _asset,
                _vars.collChange,
                _vars.isCollIncrease,
                _vars.netDebtChange,
                _isDebtIncrease,
                _vars.price
            );
            _requireNewTCRisAboveCCR(_asset, _vars.newTCR);
        }
    }

    /**
     * @dev Requires an individual collateral ratio is above minimum collateral ratio.
     * @param _asset The address of collateral asset.
     * @param _newICR The new individual collateral ratio.
     */
    function _requireICRisAboveMCR(address _asset, uint256 _newICR) internal view {
        if (_newICR < IAdminContract(adminContract).getMcr(_asset)) {
            revert BorrowerOperations__TrenBoxICRBelowMCR();
        }
    }

    /**
     * @dev Requires an individual collateral ratio is above critical collateral ratio.
     * @param _asset The address of collateral asset.
     * @param _newICR The new individual collateral ratio.
     */
    function _requireICRisAboveCCR(address _asset, uint256 _newICR) internal view {
        if (_newICR < IAdminContract(adminContract).getCcr(_asset)) {
            revert BorrowerOperations__TrenBoxICRBelowCCR();
        }
    }

    /**
     * @dev Requires new individual collateral ratio is above old ratio.
     * @param _newICR The new individual collateral ratio.
     * @param _oldICR The old individual collateral ratio.
     */
    function _requireNewICRisAboveOldICR(uint256 _newICR, uint256 _oldICR) internal pure {
        if (_newICR < _oldICR) {
            revert BorrowerOperations__TrenBoxNewICRBelowOldICR();
        }
    }

    /**
     * @dev Requires new total collateral ratio is above critical collateral ratio.
     * @param _asset The address of collateral asset.
     * @param _newTCR The new total collateral ratio.
     */
    function _requireNewTCRisAboveCCR(address _asset, uint256 _newTCR) internal view {
        if (_newTCR < IAdminContract(adminContract).getCcr(_asset)) {
            revert BorrowerOperations__TrenBoxNewTCRBelowCCR();
        }
    }

    /**
     * @dev Requires that the net debt change is above minimum debt amount.
     * @param _asset The address of collateral asset.
     * @param _netDebt The amount of net debt change.
     */
    function _requireAtLeastMinNetDebt(address _asset, uint256 _netDebt) internal view {
        if (_netDebt < IAdminContract(adminContract).getMinNetDebt(_asset)) {
            revert BorrowerOperations__TrenBoxNetDebtLessThanMin();
        }
    }

    /**
     * @dev Requires sufficient debt balance on repayment.
     * @param _borrower The borrower address.
     * @param _debtRepayment The repayment amount.
     */
    function _requireSufficientDebtTokenBalance(
        address _borrower,
        uint256 _debtRepayment
    )
        internal
        view
    {
        if (IDebtToken(debtToken).balanceOf(_borrower) < _debtRepayment) {
            revert BorrowerOperations__InsufficientDebtBalance();
        }
    }

    // --- ICR and TCR getters ---

    /**
     * @dev Computes the new nominal collateral ratio, considering the change in collateral
     * and debt balances. Assumes 0 pending rewards.
     * @param _coll The collateral balance.
     * @param _debt The debt balance.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate whether the collateral balance increases or not.
     * @param _debtChange The amount of debt change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     */
    function _getNewNominalICRFromTrenBoxChange(
        uint256 _coll,
        uint256 _debt,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtChange,
        bool _isDebtIncrease
    )
        internal
        pure
        returns (uint256)
    {
        (uint256 newColl, uint256 newDebt) = _getNewTrenBoxAmounts(
            _coll, _debt, _collChange, _isCollIncrease, _debtChange, _isDebtIncrease
        );

        uint256 newNICR = TrenMath._computeNominalCR(newColl, newDebt);
        return newNICR;
    }

    /**
     * @dev Computes the new individual collateral ratio, considering the change in collateral and
     * debt balances. Assumes 0 pending rewards.
     * @param _coll The collateral balance.
     * @param _debt The debt balance.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate whether the collateral balance increases or not.
     * @param _debtChange The amount of debt change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     * @param _price The price of collateral asset.
     */
    function _getNewICRFromTrenBoxChange(
        uint256 _coll,
        uint256 _debt,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtChange,
        bool _isDebtIncrease,
        uint256 _price
    )
        internal
        pure
        returns (uint256)
    {
        (uint256 newColl, uint256 newDebt) = _getNewTrenBoxAmounts(
            _coll, _debt, _collChange, _isCollIncrease, _debtChange, _isDebtIncrease
        );

        uint256 newICR = TrenMath._computeCR(newColl, newDebt, _price);
        return newICR;
    }

    /**
     * @dev Computes new collateral and debt balances based on their changes.
     * @param _coll The collateral balance.
     * @param _debt The debt balance.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate whether the collateral balance increases or not.
     * @param _debtChange The amount of debt change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     */
    function _getNewTrenBoxAmounts(
        uint256 _coll,
        uint256 _debt,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtChange,
        bool _isDebtIncrease
    )
        internal
        pure
        returns (uint256, uint256)
    {
        uint256 newColl = _coll;
        uint256 newDebt = _debt;

        newColl = _isCollIncrease ? _coll + _collChange : _coll - _collChange;
        newDebt = _isDebtIncrease ? _debt + _debtChange : _debt - _debtChange;

        return (newColl, newDebt);
    }

    /**
     * @dev Computes new total collateral ratio based on collateral and debt changes.
     * @param _asset The address of collateral asset.
     * @param _collChange The amount of collateral change.
     * @param _isCollIncrease The flag to indicate whether the collateral balance increases or not.
     * @param _debtChange The amount of debt change.
     * @param _isDebtIncrease The flag to indicate if it's a debt withdrawal or repayment.
     * @param _price The price of collateral asset.
     */
    function _getNewTCRFromTrenBoxChange(
        address _asset,
        uint256 _collChange,
        bool _isCollIncrease,
        uint256 _debtChange,
        bool _isDebtIncrease,
        uint256 _price
    )
        internal
        view
        returns (uint256)
    {
        uint256 totalColl = getEntireSystemColl(_asset);
        uint256 totalDebt = getEntireSystemDebt(_asset);

        totalColl = _isCollIncrease ? totalColl + _collChange : totalColl - _collChange;
        totalDebt = _isDebtIncrease ? totalDebt + _debtChange : totalDebt - _debtChange;

        uint256 newTCR = TrenMath._computeCR(totalColl, totalDebt, _price);
        return newTCR;
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
