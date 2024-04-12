// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface IBorrowerOperations {
    // --- Enums ---
    enum BorrowerOperation {
        openTrenBox,
        closeTrenBox,
        adjustTrenBox
    }

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

    function openTrenBox(
        address _asset,
        uint256 _assetAmount,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    function addColl(
        address _asset,
        uint256 _assetSent,
        address _upperHint,
        address _lowerHint
    )
        external;

    function withdrawColl(
        address _asset,
        uint256 _assetAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    function withdrawDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    function repayDebtTokens(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperHint,
        address _lowerHint
    )
        external;

    function closeTrenBox(address _asset) external;

    function adjustTrenBox(
        address _asset,
        uint256 _assetSent,
        uint256 _collWithdrawal,
        uint256 _debtChange,
        bool isDebtIncrease,
        address _upperHint,
        address _lowerHint
    )
        external;

    function claimCollateral(address _asset) external;

    function getCompositeDebt(address _asset, uint256 _debt) external view returns (uint256);
}
