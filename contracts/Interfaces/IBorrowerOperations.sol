// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IBorrowerOperations {
    // --- Enums ---

    enum BorrowerOperation {
        openTrenBox,
        closeTrenBox,
        adjustTrenBox
    }

    // --- Structs ---

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

    // --- Events ---

    event BorrowingFeePaid(address indexed _asset, address indexed _borrower, uint256 _feeAmount);
    event TrenBoxCreated(address indexed _asset, address indexed _borrower, uint256 arrayIndex);
    event TrenBoxUpdated(
        address indexed _asset,
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        uint256 stake,
        BorrowerOperation operation
    );

    // --- Errors ---
    
    error BorrowerOperations__NotActiveColl();
    error BorrowerOperations__TrenBoxNotExistOrClosed();
    error BorrowerOperations__TrenBoxIsActive();
    error BorrowerOperations__TrenBoxNetDebtLessThanMin();
    error BorrowerOperations__CompositeDebtZero();
    error BorrowerOperations__TrenBoxICRBelowCCR();
    error BorrowerOperations__TrenBoxICRBelowMCR();
    error BorrowerOperations__TrenBoxNewICRBelowOldICR();
    error BorrowerOperations__TrenBoxNewTCRBelowCCR();
    error BorrowerOperations__ZeroDebtChange();
    error BorrowerOperations__NotSingularChange();
    error BorrowerOperations__ZeroAdjustment();
    error BorrowerOperations__OperationInRecoveryMode();
    error BorrowerOperations__CollWithdrawalInRecoveryMode();
    error BorrowerOperations__RepayLargerThanTrenBoxDebt();
    error BorrowerOperations__InsufficientDebtBalance();
    error BorrowerOperations__InsufficientCollateral();
    error BorrowerOperations__ExceedMintCap();

    // --- Functions ---

    /**
     * @notice Create a TrenBox for the caller with requested debt and the specified asset
     * as collateral. In addition to the requested debt, extra debt is issued to pay
     * the borrowing fee, and cover the gas compensation.
     * @param _asset collateral asset address
     * @param _assetAmount collateral amount
     * @param _debtTokenAmount requested debt amount
     * @param _upperHint Id of previous node for the insert position, used in SortedTrenBoxes
     * @param _lowerHint Id of next node for the insert position, used in SortedTrenBoxes
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
     * @notice Add collateral to the caller's active TrenBox
     * @param _asset collateral asset address
     * @param _assetSent collateral amount to send
     * @param _upperHint Id of previous node for the new insert position, used in SortedTrenBoxes
     * @param _lowerHint Id of next node for the new insert position, used in SortedTrenBoxes
     */
    function addColl(
        address _asset,
        uint256 _assetSent,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Withdraw collateral from the caller's active TrenBox
     * @param _asset collateral asset address
     * @param _collWithdrawal collateral amount to withdraw
     * @param _upperHint Id of previous node for the new insert position
     * @param _lowerHint Id of next node for the new insert position
     */
    function withdrawColl(
        address _asset,
        uint256 _collWithdrawal,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Withdraw debt tokens from caller's TrenBox.
     * mint new debt tokens to the owner, and increase the TrenBox's debt accordingly
     * @param _asset collateral asset address
     * @param _debtTokenAmount debt token amount to withdraw
     * @param _upperHint Id of previous node for the new insert position
     * @param _lowerHint Id of next node for the new insert position
     */
    function withdrawDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Repay debt tokens to caller's TrenBox. Burn the repaid debt tokens, and
     * reduce the TrenBox's debt accordingly or Close TrenBox if user has enough tokens at all
     * @param _asset collateral asset address
     * @param _debtTokenAmount debt token amount to repay
     * @param _upperHint Id of previous node for the new insert position
     * @param _lowerHint Id of next node for the new insert position
     */
    function repayDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    /**
     * @notice Enable a caller to simultaneously change both their collateral and debt
     * @param _asset collateral asset address
     * @param _assetSent collateral amount to send
     * @param _collWithdrawal collateral amount to withdraw
     * @param _debtTokenChange debt token amount to withdraw or repay
     * @param _isDebtIncrease true if withdraw, false if repay
     * @param _upperHint Id of previous node for the new insert position
     * @param _lowerHint Id of next node for the new insert position
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
     * @notice Claim remaining collateral from redemption or from liquidation with ICR > MCR
     * in Recovery Mode
     * @param _asset collateral asset address
     */
    function claimCollateral(address _asset) external;

    /**
     * @notice Return the composite debt (drawn debt + gas compensation) of a TrenBox
     */
    function getCompositeDebt(address _asset, uint256 _debt) external view returns (uint256);
}
