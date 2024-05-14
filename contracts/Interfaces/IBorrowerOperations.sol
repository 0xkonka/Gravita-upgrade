// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IBorrowerOperations {
    /**
     * @dev Enum for storing the borrowers' operation type.
     * @param openTrenBox The operation type to open a trenBox.
     * @param closeTrenBox The operation type to close a trenBox.
     * @param adjustTrenBox The operation type to adjust trenBoxes.
     */
    enum BorrowerOperation {
        openTrenBox,
        closeTrenBox,
        adjustTrenBox
    }

    /**
     * @dev Struct for storing collateral and debt changes for a specific asset.
     * @param asset The address of collateral asset.
     * @param isCollIncrease The flag to indicate whether the collateral balance increases or not.
     * @param price The price of collateral asset.
     * @param collChange The change of collateral balance.
     * @param netDebtChange The change of net debt balance.
     * @param debt The current debt balance of a specific collateral asset.
     * @param coll The current collateral balance of a specific collateral asset.
     * @param oldICR The old individual collateral ratio.
     * @param newICR The new individual collateral ratio.
     * @param debtTokenFee The fee amount of debt tokens for borrowing.
     * @param newDebt The updated debt balance of a specific collateral asset.
     * @param newColl The updated collateral balance of a specific collateral asset.
     * @param stake The new stake based on updated collateral balance.
     */
    struct AdjustTrenBox {
        address asset;
        bool isCollIncrease;
        uint256 price;
        uint256 collChange;
        uint256 netDebtChange;
        uint256 debt;
        uint256 coll;
        uint256 oldICR;
        uint256 newICR;
        uint256 newTCR;
        uint256 debtTokenFee;
        uint256 newDebt;
        uint256 newColl;
        uint256 stake;
    }

    /**
     * @dev Struct for storing its information on opening a trenBox.
     * @param asset The address of collateral asset.
     * @param price The price of collateral asset.
     * @param debtTokenFee The fee amount of debt tokens for borrowing.
     * @param newDebt The updated debt balance of a specific collateral asset.
     * @param compositeDebt The composite debt balance including gas compensation.
     * @param ICR The individual collateral ratio.
     * @param NICR The nominal individual collateral ratio.
     * @param stake The new stake on opening new trenBox.
     * @param arrayIndex The index to map to borrower address from owners array.
     */
    struct OpenTrenBox {
        address asset;
        uint256 price;
        uint256 debtTokenFee;
        uint256 netDebt;
        uint256 compositeDebt;
        uint256 ICR;
        uint256 NICR;
        uint256 stake;
        uint256 arrayIndex;
    }

    /**
     * @dev Emitted when the borrowing fee is paid on opening or adjusting a trenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _feeAmount The amount paid as borrowing fee.
     */
    event BorrowingFeePaid(address indexed _asset, address indexed _borrower, uint256 _feeAmount);

    /**
     * @dev Emitted when a trenBox is created.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _arrayIndex The index to map to borrower address from owners array.
     */
    event TrenBoxCreated(address indexed _asset, address indexed _borrower, uint256 _arrayIndex);

    /**
     * @dev Emitted when a trenBox is adjusted.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _debt The new debt balance.
     * @param _coll The new collateral balance.
     * @param _stake The new stake balance.
     * @param _operation The type of borrower's operation.
     */
    event TrenBoxUpdated(
        address indexed _asset,
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        uint256 _stake,
        BorrowerOperation _operation
    );

    /// @dev Error emitted when the specific collateral asset is not active.
    error BorrowerOperations__NotActiveColl();

    /// @dev Error emitted when the specific borrower's trenBox is not active.
    error BorrowerOperations__TrenBoxNotExistOrClosed();

    /// @dev Error emitted when the specific borrower's trenBox is active.
    error BorrowerOperations__TrenBoxIsActive();

    /**
     * @dev Error emitted when the net debt of a specific collateral asset
     * is less than minimum debt amount.
     */
    error BorrowerOperations__TrenBoxNetDebtLessThanMin();

    /// @dev Error emitted when the composite debt amount is zero.
    error BorrowerOperations__CompositeDebtZero();

    /**
     * @dev Error emitted when new individual collateral ratio is below
     * the critical collateral ratio.
     */
    error BorrowerOperations__TrenBoxICRBelowCCR();

    /**
     * @dev Error emitted when new individual collateral ratio is below
     * the minimum collateral ratio.
     */
    error BorrowerOperations__TrenBoxICRBelowMCR();

    /**
     * @dev Error emitted when new individual collateral ratio is below
     * the old ratio.
     */
    error BorrowerOperations__TrenBoxNewICRBelowOldICR();

    /**
     * @dev Error emitted when the total collateral ratio is below
     * the critical collateral ratio.
     */
    error BorrowerOperations__TrenBoxNewTCRBelowCCR();

    /// @dev Error emitted when the debt balance change is zero.
    error BorrowerOperations__ZeroDebtChange();

    /// @dev Error emitted when both collateral top-up and withdrawal changes are made.
    error BorrowerOperations__NotSingularChange();

    /**
     * @dev Error emitted when neither debt change nor collateral top-up nor collateral
     * withdrawal happened.
     */
    error BorrowerOperations__ZeroAdjustment();

    /// @dev Error emitted when a borrowing operation is not allowed in Recovery Mode.
    error BorrowerOperations__OperationInRecoveryMode();

    /// @dev Error emitted when the collateral withdrawal is requested in Recovery Mode.
    error BorrowerOperations__CollWithdrawalInRecoveryMode();

    /// @dev Error emitted when the current debt balance is below repayment amount.
    error BorrowerOperations__InsufficientDebtBalance();

    /// @dev Error emitted when the withdrawal amount is above current collateral balance.
    error BorrowerOperations__InsufficientCollateral();

    /// @dev Error emitted when the total debt amount exceeds mint cap.
    error BorrowerOperations__ExceedMintCap();

    /**
     * @notice Creates a trenBox for the specific collateral asset with requested debt amount.
     * @dev In addition to the requested debt, extra debt is issued to pay the borrowing fee,
     * and cover the gas compensation.
     * @param _asset The address of collateral asset.
     * @param _assetAmount The amount of collateral asset.
     * @param _debtTokenAmount The amount of debt tokens.
     * @param _upperHint Id of previous node for the insert position, used in SortedTrenBoxes.
     * @param _lowerHint Id of next node for the insert position, used in SortedTrenBoxes.
     */
    function openTrenBox(
        address _asset,
        uint256 _assetAmount,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Adds collateral to the caller's active trenBox.
     * @param _asset The address of collateral asset.
     * @param _assetSent The amount of collateral asset to add.
     * @param _upperHint Id of previous node for the new insert position, used in SortedTrenBoxes.
     * @param _lowerHint Id of next node for the new insert position, used in SortedTrenBoxes.
     */
    function addColl(
        address _asset,
        uint256 _assetSent,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Withdraws collateral from the caller's active trenBox.
     * @param _asset The address of collateral asset.
     * @param _collWithdrawal The amount of collateral asset to withdraw.
     * @param _upperHint Id of previous node for the new insert position.
     * @param _lowerHint Id of next node for the new insert position.
     */
    function withdrawColl(
        address _asset,
        uint256 _collWithdrawal,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Withdraws debt tokens from the caller's trenBox. Mints new debt tokens to the owner,
     * and increase the trenBox's debt accordingly.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The amount of debt token to withdraw.
     * @param _upperHint Id of previous node for the new insert position.
     * @param _lowerHint Id of next node for the new insert position.
     */
    function withdrawDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Repays debt tokens to the caller's trenBox. Burns the repaid debt tokens, and
     * reduces the trenBox's debt accordingly or Closes trenBox if user has enough tokens at all.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The amount of debt token to repay.
     * @param _upperHint Id of previous node for the new insert position.
     * @param _lowerHint Id of next node for the new insert position.
     */
    function repayDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Enables a caller to simultaneously change both their collateral and debt balances.
     * @param _asset The address of collateral asset.
     * @param _assetSent The amount of collateral asset to send.
     * @param _collWithdrawal The amount of collateral asset to withdraw.
     * @param _debtTokenChange The amount of debt token to withdraw or repay.
     * @param _isDebtIncrease The flag to indicate if current operation is withdrawal or repayment.
     * @param _upperHint Id of previous node for the new insert position.
     * @param _lowerHint Id of next node for the new insert position.
     */
    function adjustTrenBox(
        address _asset,
        uint256 _assetSent,
        uint256 _collWithdrawal,
        uint256 _debtTokenChange,
        bool _isDebtIncrease,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Claims remaining collateral from redemption or from liquidation with ICR > MCR
     * in Recovery Mode
     * @param _asset The address of collateral asset.
     */
    function claimCollateral(address _asset) external;

    /**
     * @notice Returns the composite debt (drawn debt + gas compensation) of a trenBox.
     */
    function getCompositeDebt(address _asset, uint256 _debt) external view returns (uint256);
}
