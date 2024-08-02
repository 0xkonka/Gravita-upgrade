// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

/**
 * @title ITrenBoxManager
 * @notice Defines the basic interface for TrenBoxManager contract.
 */
interface ITrenBoxManager {
    // Enums
    // ------------------------------------------------------------------------------------------------------------

    /**
     * @dev Enum for storing TrenBox status.
     * @param nonExistent The non-existence status .
     * @param active The active status.
     * @param closedByOwner The closed status by owner.
     * @param closedByLiquidation The closed status by liquidation.
     * @param closedByRedemption The closed status by redemption.
     * @param closedByRedistribution The closed status by redistribution.
     */
    enum Status {
        nonExistent,
        active,
        closedByOwner,
        closedByLiquidation,
        closedByRedemption,
        closedByRedistribution
    }

    /**
     * @dev Enum for storing operation type by TrenBoxManagerOperations contract.
     * @param applyPendingRewards The operation that adds pending rewards to the TrenBox.
     * @param liquidateInNormalMode The operation that closes the TrenBox by liquidation
     * under normal mode.
     * @param liquidateInRecoveryMode The operation that closes the TrenBox by liquidation
     * under recovery mode.
     * @param redeemCollateral The operation that redeems the collateral by redemption.
     * @param redistributeCollateral The operation that closes the TrenBox by redistribution.
     */
    enum TrenBoxManagerOperation {
        applyPendingRewards,
        liquidateInNormalMode,
        liquidateInRecoveryMode,
        redeemCollateral,
        redistributeCollateral
    }

    // Structs
    // ----------------------------------------------------------------------------------------------------------

    /**
     * @dev Struct for storing TrenBox information.
     * @param debt The debt token amount.
     * @param coll The collateral amount.
     * @param stake The stake amount.
     * @param status The current status.
     * @param arrayIndex The index in the owner array.
     */
    struct TrenBox {
        uint256 debt;
        uint256 coll;
        uint256 stake;
        Status status;
        uint128 arrayIndex;
    }

    /**
     * @dev Struct for storing the collateral and debt token snapshots for a given active TrenBox.
     * @param asset The snapshot of collateral asset.
     * @param debt The snapshot of debt token.
     */
    struct RewardSnapshot {
        uint256 asset;
        uint256 debt;
    }

    // Events
    // -----------------------------------------------------------------------------------------------------------

    /**
     * @dev Emitted when the base rate is updated by redemption.
     * @param _asset The address of collateral asset.
     * @param _baseRate The new base rate.
     */
    event BaseRateUpdated(address indexed _asset, uint256 _baseRate);

    /**
     * @dev Emitted when the timestamp of last fee operation is updated.
     * @param _asset The address of collateral asset.
     * @param _lastFeeOpTime The timestamp of latest fee operation.
     */
    event LastFeeOpTimeUpdated(address indexed _asset, uint256 _lastFeeOpTime);

    /**
     * @dev Emitted when the total staked amount for a specific collateral is updated.
     * @param _asset The address of collateral asset.
     * @param _newTotalStakes The new total staked amount.
     */
    event TotalStakesUpdated(address indexed _asset, uint256 _newTotalStakes);

    /**
     * @dev Emitted when the system snapshot is updated.
     * @param _asset The address of collateral asset.
     * @param _totalStakesSnapshot The total stakes snapshot.
     * @param _totalCollateralSnapshot The total collateral snapshot.
     */
    event SystemSnapshotsUpdated(
        address indexed _asset, uint256 _totalStakesSnapshot, uint256 _totalCollateralSnapshot
    );

    /**
     * @dev Emitted when the accumulated liquidation rewards per unit staked are updated.
     * @param _asset The address of collateral asset.
     * @param _L_Coll The liquidated collateral.
     * @param _L_Debt The liquidated debt.
     */
    event LTermsUpdated(address indexed _asset, uint256 _L_Coll, uint256 _L_Debt);

    /**
     * @dev Emitted when the reward snapshot is updated.
     * @param _asset The address of collateral asset.
     * @param _L_Coll The liquidated collateral.
     * @param _L_Debt The liquidated debt.
     */
    event TrenBoxSnapshotsUpdated(address indexed _asset, uint256 _L_Coll, uint256 _L_Debt);

    /**
     * @dev Emitted when the owner of TrenBox is removed in owners array.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _newIndex The new array index.
     */
    event TrenBoxIndexUpdated(address indexed _asset, address _borrower, uint256 _newIndex);

    /**
     * @dev Emitted when the specific TrenBox is updated.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _debt The new debt amount.
     * @param _coll The new collateral amount.
     * @param _stake The new stake amount.
     * @param _operation The operation type.
     */
    event TrenBoxUpdated(
        address indexed _asset,
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        uint256 _stake,
        TrenBoxManagerOperation _operation
    );

    // Custom Errors
    // ----------------------------------------------------------------------------------------------------

    /// @dev Error emitted when the redemption fee is bigger than the drawn amount.
    error TrenBoxManager__FeeBiggerThanAssetDraw();

    /// @dev Error emitted when there is only one or zero TrenBox.
    error TrenBoxManager__OnlyOneTrenBox();

    /// @dev Error emitted when the caller is not TrenBoxManagerOperations contract.
    error TrenBoxManager__OnlyTrenBoxManagerOperations();

    /// @dev Error emitted when the caller is not BorrowerOperations contract.
    error TrenBoxManager__OnlyBorrowerOperations();

    /// @dev Error emitted when the caller is neither TrenBoxManagerOperations
    /// nor BorrowerOperations.
    error TrenBoxManager__OnlyTrenBoxManagerOperationsOrBorrowerOperations();

    // Functions
    // --------------------------------------------------------------------------------------------------------

    /**
     * @notice Returns whether it is the first redemption for a specific borrower.
     * @param _asset The address of collateral asset.
     * @param _firstRedemptionHint The borrower address to check.
     * @param _price The price of collateral asset.
     */
    function isValidFirstRedemptionHint(
        address _asset,
        address _firstRedemptionHint,
        uint256 _price
    )
        external
        view
        returns (bool);

    /**
     * @notice Returns the nominal collateral ratio (ICR) of a given TrenBox without the price.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getNominalICR(address _asset, address _borrower) external view returns (uint256);

    /**
     * @notice Returns the current collateral ratio (ICR) of a given TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _price The price of collateral asset.
     */
    function getCurrentICR(
        address _asset,
        address _borrower,
        uint256 _price
    )
        external
        view
        returns (uint256);

    /**
     * @notice Returns the borrower's pending accumulated collateral reward
     * earned by their stake.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getPendingAssetReward(
        address _asset,
        address _borrower
    )
        external
        view
        returns (uint256);

    /**
     * @notice Returns the borrower's pending accumulated debt token reward
     * earned by their stake.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getPendingDebtTokenReward(
        address _asset,
        address _borrower
    )
        external
        view
        returns (uint256);

    /**
     * @notice Returns whether the borrower has pending rewards.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function hasPendingRewards(address _asset, address _borrower) external view returns (bool);

    /**
     * @notice Returns the borrower's entire debt and collateral balances
     * with pending rewards.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getEntireDebtAndColl(
        address _asset,
        address _borrower
    )
        external
        view
        returns (uint256 debt, uint256 coll, uint256 pendingDebtReward, uint256 pendingCollReward);

    /**
     * @notice Returns whether the specific TrenBox is active or not.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function isTrenBoxActive(address _asset, address _borrower) external view returns (bool);

    /**
     * @notice Returns the total collateral ratio for a specific collaterl asset.
     * @param _asset The address of collateral asset.
     * @param _price The price of collateral asset.
     */
    function getTCR(address _asset, uint256 _price) external view returns (uint256);

    /**
     * @notice Checks whether the current mode is Recovery Mode or not.
     * @param _asset The address of collateral asset.
     * @param _price The price of collateral asset.
     */
    function checkRecoveryMode(address _asset, uint256 _price) external view returns (bool);

    /**
     * @notice Returns the borrowing fee rate for a specific collateral asset.
     * @param _asset The address of collateral asset.
     */
    function getBorrowingRate(address _asset) external view returns (uint256);

    /**
     * @notice Returns the borrowing fee amount for a given debt amount.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The amount of debt tokens to borrow.
     */
    function getBorrowingFee(
        address _asset,
        uint256 _debtTokenAmount
    )
        external
        view
        returns (uint256);

    /**
     * @notice Returns the redemption fee amount for a given collateral amount.
     * @param _asset The address of collateral asset.
     * @param _assetDraw The amount of collateral asset to draw.
     */
    function getRedemptionFee(address _asset, uint256 _assetDraw) external view returns (uint256);

    /**
     * @notice Returns the redemption fee amount with decay for a given collateral amount.
     * @param _asset The address of collateral asset.
     * @param _assetDraw The amount of collateral asset to draw.
     */
    function getRedemptionFeeWithDecay(
        address _asset,
        uint256 _assetDraw
    )
        external
        view
        returns (uint256);

    /**
     * @notice Returns the redemption rate for a specific collateral asset.
     * @param _asset The address of collateral asset.
     */
    function getRedemptionRate(address _asset) external view returns (uint256);

    /**
     * @notice Returns the redemption rate with decay for a specific collateral asset.
     * @param _asset The address of collateral asset.
     */
    function getRedemptionRateWithDecay(address _asset) external view returns (uint256);

    /**
     * @notice Returns the TrenBox owner based on array index.
     * @param _asset The address of collateral asset.
     * @param _index The array index.
     */
    function getTrenBoxFromTrenBoxOwnersArray(
        address _asset,
        uint256 _index
    )
        external
        view
        returns (address);

    /**
     * @notice Returns the net debt amount excluded gas compensation.
     * @param _asset The address of collateral asset.
     * @param _debt The amount of debt tokens.
     */
    function getNetDebt(address _asset, uint256 _debt) external view returns (uint256);

    /**
     * @notice Returns the number of TrenBox owners for a specific collateral asset.
     * @param _asset The address of collateral asset.
     */
    function getTrenBoxOwnersCount(address _asset) external view returns (uint256);

    /**
     * @notice Returns the TrenBox status for a specific borrower.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getTrenBoxStatus(address _asset, address _borrower) external view returns (uint256);

    /**
     * @notice Returns the TrenBox stake for a specific borrower.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getTrenBoxStake(address _asset, address _borrower) external view returns (uint256);

    /**
     * @notice Returns the TrenBox debt balance for a specific borrower.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getTrenBoxDebt(address _asset, address _borrower) external view returns (uint256);

    /**
     * @notice Returns the TrenBox collateral balance for a specific borrower.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function getTrenBoxColl(address _asset, address _borrower) external view returns (uint256);

    /**
     * @notice Adds a specific borrower to the owner array.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function addTrenBoxOwnerToArray(
        address _asset,
        address _borrower
    )
        external
        returns (uint256 index);

    /**
     * @notice Executes full redemption for a specific TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _newColl The new collateral balance to update.
     */
    function executeFullRedemption(address _asset, address _borrower, uint256 _newColl) external;

    /**
     * @notice Executes partial redemption for a specific TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _newDebt The new debt balance to update.
     * @param _newColl The new collateral balance to update.
     * @param _newNICR The new nominal collateral ratio.
     * @param _upperPartialRedemptionHint Id of previous node for the new insert position.
     * @param _lowerPartialRedemptionHint Id of next node for the new insert position.
     */
    function executePartialRedemption(
        address _asset,
        address _borrower,
        uint256 _newDebt,
        uint256 _newColl,
        uint256 _newNICR,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint
    )
        external;

    /**
     * @notice Finalizes redemption for a specific TrenBox.
     * @param _asset The address of collateral asset.
     * @param _receiver The redeemer address.
     * @param _debtToRedeem The amount of debt tokens to redeem.
     * @param _assetFeeAmount The amount of redemption fee.
     * @param _assetRedeemedAmount The amount of redeemed collateral.
     */
    function finalizeRedemption(
        address _asset,
        address _receiver,
        uint256 _debtToRedeem,
        uint256 _assetFeeAmount,
        uint256 _assetRedeemedAmount
    )
        external;

    /**
     * @notice Updates redemption base rate.
     * @param _asset The address of collateral asset.
     * @param _assetDrawn The amount of collateral asset to draw.
     * @param _price The price of collateral asset.
     * @param _totalDebtTokenSupply The total supply of debt tokens.
     */
    function updateBaseRateFromRedemption(
        address _asset,
        uint256 _assetDrawn,
        uint256 _price,
        uint256 _totalDebtTokenSupply
    )
        external;

    /**
     * @notice Adds the pending debt and collateral rewards to the TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function applyPendingRewards(address _asset, address _borrower) external;

    /**
     * @notice Moves the TrenBox's pending debt and collateral rewards to active TrenBoxStorage.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The amount of debt tokens to move.
     * @param _assetAmount The amount of collateral asset to move.
     */
    function movePendingTrenBoxRewardsFromLiquidatedToActive(
        address _asset,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        external;

    /**
     * @notice Updates the borrower's rewards snapshot.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function updateTrenBoxRewardSnapshots(address _asset, address _borrower) external;

    /**
     * @notice Updates the borrower's stake based on their latest collateral.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function updateStakeAndTotalStakes(
        address _asset,
        address _borrower
    )
        external
        returns (uint256);

    /**
     * @notice Removes the borrower's stake amount from total staked amount.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function removeStake(address _asset, address _borrower) external;

    /**
     * @notice Adds distributed collateral and debt rewards to the running totals.
     * @param _asset The address of collateral asset.
     * @param _debt The debt amount to redistribute.
     * @param _coll The collateral amount to redistribute.
     * @param _debtToOffset The debt amount to offset.
     * @param _collToSendToStabilityPool The collateral amount to send to the Stability Pool.
     */
    function redistributeDebtAndColl(
        address _asset,
        uint256 _debt,
        uint256 _coll,
        uint256 _debtToOffset,
        uint256 _collToSendToStabilityPool
    )
        external;

    /**
     * @notice Updates system snapshot excluding collateral remainder.
     * @param _asset The address of collateral asset.
     * @param _collRemainder The collateral remainder.
     */
    function updateSystemSnapshots_excludeCollRemainder(
        address _asset,
        uint256 _collRemainder
    )
        external;

    /**
     * @notice Closes a specific borrower's TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function closeTrenBox(address _asset, address _borrower) external;

    /**
     * @notice Closes a specific borrower's TrenBox by liquidation.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function closeTrenBoxLiquidation(address _asset, address _borrower) external;

    /**
     * @notice Closes a specific borrower's TrenBox by redistribution.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _debtTokenGasCompensationToBurn The gas compensation to burn.
     */
    function closeTrenBoxRedistribution(
        address _asset,
        address _borrower,
        uint256 _debtTokenGasCompensationToBurn
    )
        external;

    /**
     * @notice Sends gas compensation to the liquidator.
     * @param _asset The address of collateral asset.
     * @param _liquidator The liquidator address.
     * @param _debtTokenAmount The debt token amount of gas compensation.
     * @param _assetAmount The collateral amount of gas compensation.
     */
    function sendGasCompensation(
        address _asset,
        address _liquidator,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        external;

    /**
     * @notice Sets the TrenBox's status.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _num The enum status to set.
     */
    function setTrenBoxStatus(address _asset, address _borrower, uint256 _num) external;

    /**
     * @notice Increases the TrenBox's collateral balance.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _collIncrease The collateral amount to increase.
     */
    function increaseTrenBoxColl(
        address _asset,
        address _borrower,
        uint256 _collIncrease
    )
        external
        returns (uint256);

    /**
     * @notice Decreases the TrenBox's collateral balance.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _collDecrease The collateral amount to decrease.
     */
    function decreaseTrenBoxColl(
        address _asset,
        address _borrower,
        uint256 _collDecrease
    )
        external
        returns (uint256);

    /**
     * @notice Increases the TrenBox's debt token balance.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _debtIncrease The debt token amount to increase.
     */
    function increaseTrenBoxDebt(
        address _asset,
        address _borrower,
        uint256 _debtIncrease
    )
        external
        returns (uint256);

    /**
     * @notice Decreases the TrenBox's debt token balance.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _debtDecrease The deb token amount to decrease.
     */
    function decreaseTrenBoxDebt(
        address _asset,
        address _borrower,
        uint256 _debtDecrease
    )
        external
        returns (uint256);
}
