// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { TrenBase } from "./Dependencies/TrenBase.sol";
import { TrenMath, DECIMAL_PRECISION } from "./Dependencies/TrenMath.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IActivePool } from "./Interfaces/IActivePool.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { ICollSurplusPool } from "./Interfaces/ICollSurplusPool.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { IDefaultPool } from "./Interfaces/IDefaultPool.sol";
import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { IFeeCollector } from "./Interfaces/IFeeCollector.sol";

contract TrenBoxManager is
    ITrenBoxManager,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    TrenBase
{
    // Constants
    // ------------------------------------------------------------------------------------------------------

    string public constant NAME = "TrenBoxManager";

    uint256 public constant SECONDS_IN_ONE_MINUTE = 60;
    /*
     * Half-life of 12h. 12h = 720 min
     * (1/2) = d^720 => d = (1/2)^(1/720)
     */
    uint256 public constant MINUTE_DECAY_FACTOR = 999_037_758_833_783_000;

    /*
    * BETA: 18 digit decimal. Parameter by which to divide the redeemed fraction, in order to calc
    the new base rate from a redemption.
     * Corresponds to (1 / ALPHA) in the white paper.
     */
    uint256 public constant BETA = 2;

    // Structs
    // --------------------------------------------------------------------------------------------------------

    // Object containing the asset and debt token snapshots for a given active trenBox
    struct RewardSnapshot {
        uint256 asset;
        uint256 debt;
    }

    // State
    // ----------------------------------------------------------------------------------------------------------

    mapping(address collateral => uint256 rate) public baseRate;

    // The timestamp of the latest fee operation (redemption or new debt token issuance)
    mapping(address collateral => uint256 feeOpeartionTimestamp) public lastFeeOperationTime;

    mapping(address borrower => mapping(address collateral => TrenBox)) public TrenBoxes;

    mapping(address collateral => uint256 totalStake) public totalStakes;

    // Snapshot of the value of totalStakes, taken immediately after the latest liquidation
    mapping(address collateral => uint256 totalStake) public totalStakesSnapshot;

    // Snapshot of the total collateral across the ActivePool and DefaultPool, immediately after the
    // latest liquidation.
    mapping(address collateral => uint256 totalCollateral) public totalCollateralSnapshot;

    /*
    * L_Colls and L_Debts track the sums of accumulated liquidation rewards per unit staked. During
    its lifetime, each stake earns:
     *
     * An asset gain of ( stake * [L_Colls - L_Colls(0)] )
     * A debt increase of ( stake * [L_Debts - L_Debts(0)] )
     *
    * Where L_Colls(0) and L_Debts(0) are snapshots of L_Colls and L_Debts for the active TrenBox
    taken at the instant the stake was made
     */
    mapping(address collateral => uint256 accumulatedRewards) public L_Colls;
    mapping(address collateral => uint256 accumulatedRewards) public L_Debts;

    // Map addresses with active trenBoxes to their RewardSnapshot
    mapping(address borrower => mapping(address collateral => RewardSnapshot)) public
        rewardSnapshots;

    // Array of all active trenBox addresses - used to to compute an approximate hint off-chain, for
    // the sorted list insertion
    mapping(address collateral => address[] owners) public TrenBoxOwners;

    // Error trackers for the trenBox redistribution calculation
    mapping(address collateral => uint256 collateralError) public lastCollError_Redistribution;
    mapping(address collateral => uint256 debtError) public lastDebtError_Redistribution;

    // Modifiers
    // ------------------------------------------------------------------------------------------------------

    modifier onlyTrenBoxManagerOperations() {
        if (msg.sender != trenBoxManagerOperations) {
            revert TrenBoxManager__OnlyTrenBoxManagerOperations();
        }
        _;
    }

    modifier onlyBorrowerOperations() {
        if (msg.sender != borrowerOperations) {
            revert TrenBoxManager__OnlyBorrowerOperations();
        }
        _;
    }

    modifier onlyTrenBoxManagerOperationsOrBorrowerOperations() {
        if (msg.sender != borrowerOperations && msg.sender != trenBoxManagerOperations) {
            revert TrenBoxManager__OnlyTrenBoxManagerOperationsOrBorrowerOperations();
        }
        _;
    }

    // Initializer
    // ------------------------------------------------------------------------------------------------------

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);

        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    // External/public functions
    // --------------------------------------------------------------------------------------

    function isValidFirstRedemptionHint(
        address _asset,
        address _firstRedemptionHint,
        uint256 _price
    )
        external
        view
        returns (bool)
    {
        if (
            _firstRedemptionHint == address(0)
                || !ISortedTrenBoxes(sortedTrenBoxes).contains(_asset, _firstRedemptionHint)
                || getCurrentICR(_asset, _firstRedemptionHint, _price)
                    < IAdminContract(adminContract).getMcr(_asset)
        ) {
            return false;
        }
        address nextTrenBox =
            ISortedTrenBoxes(sortedTrenBoxes).getNext(_asset, _firstRedemptionHint);
        return nextTrenBox == address(0)
            || getCurrentICR(_asset, nextTrenBox, _price) < IAdminContract(adminContract).getMcr(_asset);
    }

    // Return the nominal collateral ratio (ICR) of a given TrenBox, without the price. Takes a
    // trenBox's pending coll and debt rewards from redistributions into account.
    function getNominalICR(
        address _asset,
        address _borrower
    )
        external
        view
        override
        returns (uint256)
    {
        (uint256 currentAsset, uint256 currentDebt) = _getCurrentTrenBoxAmounts(_asset, _borrower);

        uint256 NICR = TrenMath._computeNominalCR(currentAsset, currentDebt);
        return NICR;
    }

    // Return the current collateral ratio (ICR) of a given TrenBox. Takes a trenBox's pending coll
    // and debt rewards from redistributions into account.
    function getCurrentICR(
        address _asset,
        address _borrower,
        uint256 _price
    )
        public
        view
        override
        returns (uint256)
    {
        (uint256 currentAsset, uint256 currentDebt) = _getCurrentTrenBoxAmounts(_asset, _borrower);
        uint256 ICR = TrenMath._computeCR(currentAsset, currentDebt, _price);
        return ICR;
    }

    // Get the borrower's pending accumulated asset reward, earned by their stake
    function getPendingAssetReward(
        address _asset,
        address _borrower
    )
        public
        view
        override
        returns (uint256)
    {
        uint256 snapshotAsset = rewardSnapshots[_borrower][_asset].asset;
        uint256 rewardPerUnitStaked = L_Colls[_asset] - snapshotAsset;
        if (rewardPerUnitStaked == 0 || !isTrenBoxActive(_asset, _borrower)) {
            return 0;
        }
        uint256 stake = TrenBoxes[_borrower][_asset].stake;
        uint256 pendingAssetReward = (stake * rewardPerUnitStaked) / DECIMAL_PRECISION;
        return pendingAssetReward;
    }

    // Get the borrower's pending accumulated debt token reward, earned by their stake
    function getPendingDebtTokenReward(
        address _asset,
        address _borrower
    )
        public
        view
        override
        returns (uint256)
    {
        uint256 snapshotDebt = rewardSnapshots[_borrower][_asset].debt;
        uint256 rewardPerUnitStaked = L_Debts[_asset] - snapshotDebt;
        if (rewardPerUnitStaked == 0 || !isTrenBoxActive(_asset, _borrower)) {
            return 0;
        }
        uint256 stake = TrenBoxes[_borrower][_asset].stake;
        return (stake * rewardPerUnitStaked) / DECIMAL_PRECISION;
    }

    function hasPendingRewards(
        address _asset,
        address _borrower
    )
        public
        view
        override
        returns (bool)
    {
        if (!isTrenBoxActive(_asset, _borrower)) {
            return false;
        }
        return (rewardSnapshots[_borrower][_asset].asset < L_Colls[_asset]);
    }

    function getEntireDebtAndColl(
        address _asset,
        address _borrower
    )
        external
        view
        override
        returns (uint256 debt, uint256 coll, uint256 pendingDebtReward, uint256 pendingCollReward)
    {
        pendingDebtReward = getPendingDebtTokenReward(_asset, _borrower);
        pendingCollReward = getPendingAssetReward(_asset, _borrower);
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        debt = trenBox.debt + pendingDebtReward;
        coll = trenBox.coll + pendingCollReward;
    }

    function isTrenBoxActive(
        address _asset,
        address _borrower
    )
        public
        view
        override
        returns (bool)
    {
        return getTrenBoxStatus(_asset, _borrower) == uint256(Status.active);
    }

    function getTCR(address _asset, uint256 _price) external view override returns (uint256) {
        return _getTCR(_asset, _price);
    }

    function checkRecoveryMode(
        address _asset,
        uint256 _price
    )
        external
        view
        override
        returns (bool)
    {
        return _checkRecoveryMode(_asset, _price);
    }

    function getBorrowingRate(address _asset) external view override returns (uint256) {
        return IAdminContract(adminContract).getBorrowingFee(_asset);
    }

    function getBorrowingFee(
        address _asset,
        uint256 _debt
    )
        external
        view
        override
        returns (uint256)
    {
        return (IAdminContract(adminContract).getBorrowingFee(_asset) * _debt) / DECIMAL_PRECISION;
    }

    function getRedemptionFee(address _asset, uint256 _assetDraw) public view returns (uint256) {
        return _calcRedemptionFee(getRedemptionRate(_asset), _assetDraw);
    }

    function getRedemptionFeeWithDecay(
        address _asset,
        uint256 _assetDraw
    )
        external
        view
        override
        returns (uint256)
    {
        return _calcRedemptionFee(getRedemptionRateWithDecay(_asset), _assetDraw);
    }

    function getRedemptionRate(address _asset) public view override returns (uint256) {
        return _calcRedemptionRate(_asset, baseRate[_asset]);
    }

    function getRedemptionRateWithDecay(address _asset) public view override returns (uint256) {
        return _calcRedemptionRate(_asset, _calcDecayedBaseRate(_asset));
    }

    // Called by Tren contracts
    // ------------------------------------------------------------------------------------

    function addTrenBoxOwnerToArray(
        address _asset,
        address _borrower
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256 index)
    {
        address[] storage assetOwners = TrenBoxOwners[_asset];
        assetOwners.push(_borrower);
        index = assetOwners.length - 1;
        TrenBoxes[_borrower][_asset].arrayIndex = uint128(index);
        return index;
    }

    function executeFullRedemption(
        address _asset,
        address _borrower,
        uint256 _newColl
    )
        external
        override
        nonReentrant
        onlyTrenBoxManagerOperations
    {
        _removeStake(_asset, _borrower);
        _closeTrenBox(_asset, _borrower, Status.closedByRedemption);
        _redeemCloseTrenBox(
            _asset,
            _borrower,
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset),
            _newColl
        );
        IFeeCollector(feeCollector).closeDebt(_borrower, _asset);
        emit TrenBoxUpdated(_asset, _borrower, 0, 0, 0, TrenBoxManagerOperation.redeemCollateral);
    }

    function executePartialRedemption(
        address _asset,
        address _borrower,
        uint256 _newDebt,
        uint256 _newColl,
        uint256 _newNICR,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        ISortedTrenBoxes(sortedTrenBoxes).reInsert(
            _asset, _borrower, _newNICR, _upperPartialRedemptionHint, _lowerPartialRedemptionHint
        );

        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        uint256 paybackFraction = ((trenBox.debt - _newDebt) * 1 ether) / trenBox.debt;
        if (paybackFraction != 0) {
            IFeeCollector(feeCollector).decreaseDebt(_borrower, _asset, paybackFraction);
        }

        trenBox.debt = _newDebt;
        trenBox.coll = _newColl;
        _updateStakeAndTotalStakes(_asset, _borrower);

        emit TrenBoxUpdated(
            _asset,
            _borrower,
            _newDebt,
            _newColl,
            trenBox.stake,
            TrenBoxManagerOperation.redeemCollateral
        );
    }

    function finalizeRedemption(
        address _asset,
        address _receiver,
        uint256 _debtToRedeem,
        uint256 _assetFeeAmount,
        uint256 _assetRedeemedAmount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        // Send the asset fee
        if (_assetFeeAmount != 0) {
            address destination = IFeeCollector(feeCollector).getProtocolRevenueDestination();
            IActivePool(activePool).sendAsset(_asset, destination, _assetFeeAmount);
            IFeeCollector(feeCollector).handleRedemptionFee(_asset, _assetFeeAmount);
        }
        // Burn the total debt tokens that is cancelled with debt, and send the redeemed asset to
        // msg.sender
        IDebtToken(debtToken).burn(_receiver, _debtToRedeem);
        // Update Active Pool, and send asset to account
        uint256 collToSendToRedeemer = _assetRedeemedAmount - _assetFeeAmount;
        IActivePool(activePool).decreaseDebt(_asset, _debtToRedeem);
        IActivePool(activePool).sendAsset(_asset, _receiver, collToSendToRedeemer);
    }

    function updateBaseRateFromRedemption(
        address _asset,
        uint256 _assetDrawn,
        uint256 _price,
        uint256 _totalDebtTokenSupply
    )
        external
        onlyTrenBoxManagerOperations
    {
        uint256 decayedBaseRate = _calcDecayedBaseRate(_asset);
        uint256 redeemedDebtFraction = (_assetDrawn * _price) / _totalDebtTokenSupply;
        uint256 newBaseRate = decayedBaseRate + (redeemedDebtFraction / BETA);
        newBaseRate = TrenMath._min(newBaseRate, DECIMAL_PRECISION);
        assert(newBaseRate != 0);
        baseRate[_asset] = newBaseRate;
        emit BaseRateUpdated(_asset, newBaseRate);
        _updateLastFeeOpTime(_asset);
    }

    function applyPendingRewards(
        address _asset,
        address _borrower
    )
        external
        override
        nonReentrant
        onlyTrenBoxManagerOperationsOrBorrowerOperations
    {
        return _applyPendingRewards(_asset, _borrower);
    }

    // Move a TrenBox's pending debt and collateral rewards from distributions, from the Default
    // Pool
    // to the Active Pool
    function movePendingTrenBoxRewardsToActivePool(
        address _asset,
        uint256 _debt,
        uint256 _assetAmount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _movePendingTrenBoxRewardsToActivePool(_asset, _debt, _assetAmount);
    }

    // Update borrower's snapshots of L_Colls and L_Debts to reflect the current values
    function updateTrenBoxRewardSnapshots(
        address _asset,
        address _borrower
    )
        external
        override
        onlyBorrowerOperations
    {
        return _updateTrenBoxRewardSnapshots(_asset, _borrower);
    }

    function updateStakeAndTotalStakes(
        address _asset,
        address _borrower
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256)
    {
        return _updateStakeAndTotalStakes(_asset, _borrower);
    }

    function removeStake(
        address _asset,
        address _borrower
    )
        external
        override
        onlyTrenBoxManagerOperationsOrBorrowerOperations
    {
        return _removeStake(_asset, _borrower);
    }

    function redistributeDebtAndColl(
        address _asset,
        uint256 _debt,
        uint256 _coll,
        uint256 _debtToOffset,
        uint256 _collToSendToStabilityPool
    )
        external
        override
        nonReentrant
        onlyTrenBoxManagerOperations
    {
        IStabilityPool(stabilityPool).offset(_debtToOffset, _asset, _collToSendToStabilityPool);

        if (_debt == 0) {
            return;
        }
        /*
        * Add distributed coll and debt rewards-per-unit-staked to the running totals. Division uses
        a "feedback"
        * error correction, to keep the cumulative error low in the running totals L_Colls and
        L_Debts:
         *
        * 1) Form numerators which compensate for the floor division errors that occurred the last
        time this
         * function was called.
         * 2) Calculate "per-unit-staked" ratios.
        * 3) Multiply each ratio back by its denominator, to reveal the current floor division
        error.
        * 4) Store these errors for use in the next correction when this function is called.
        * 5) Note: static analysis tools complain about this "division before multiplication",
        however, it is intended.
         */
        uint256 collNumerator = (_coll * DECIMAL_PRECISION) + lastCollError_Redistribution[_asset];
        uint256 debtNumerator = (_debt * DECIMAL_PRECISION) + lastDebtError_Redistribution[_asset];

        // Get the per-unit-staked terms
        uint256 assetStakes = totalStakes[_asset];
        uint256 collRewardPerUnitStaked = collNumerator / assetStakes;
        uint256 debtRewardPerUnitStaked = debtNumerator / assetStakes;

        lastCollError_Redistribution[_asset] =
            collNumerator - (collRewardPerUnitStaked * assetStakes);
        lastDebtError_Redistribution[_asset] =
            debtNumerator - (debtRewardPerUnitStaked * assetStakes);

        // Add per-unit-staked terms to the running totals
        uint256 liquidatedColl = L_Colls[_asset] + collRewardPerUnitStaked;
        uint256 liquidatedDebt = L_Debts[_asset] + debtRewardPerUnitStaked;
        L_Colls[_asset] = liquidatedColl;
        L_Debts[_asset] = liquidatedDebt;
        emit LTermsUpdated(_asset, liquidatedColl, liquidatedDebt);

        IActivePool(activePool).decreaseDebt(_asset, _debt);
        IDefaultPool(defaultPool).increaseDebt(_asset, _debt);
        IActivePool(activePool).sendAsset(_asset, defaultPool, _coll);
    }

    function updateSystemSnapshots_excludeCollRemainder(
        address _asset,
        uint256 _collRemainder
    )
        external
        onlyTrenBoxManagerOperations
    {
        uint256 totalStakesCached = totalStakes[_asset];
        totalStakesSnapshot[_asset] = totalStakesCached;
        uint256 activeColl = IActivePool(activePool).getAssetBalance(_asset);
        uint256 liquidatedColl = IDefaultPool(defaultPool).getAssetBalance(_asset);
        uint256 _totalCollateralSnapshot = activeColl - _collRemainder + liquidatedColl;
        totalCollateralSnapshot[_asset] = _totalCollateralSnapshot;
        emit SystemSnapshotsUpdated(_asset, totalStakesCached, _totalCollateralSnapshot);
    }

    function closeTrenBox(
        address _asset,
        address _borrower
    )
        external
        override
        onlyTrenBoxManagerOperationsOrBorrowerOperations
    {
        return _closeTrenBox(_asset, _borrower, Status.closedByOwner);
    }

    function closeTrenBoxLiquidation(
        address _asset,
        address _borrower
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _closeTrenBox(_asset, _borrower, Status.closedByLiquidation);
        IFeeCollector(feeCollector).liquidateDebt(_borrower, _asset);
        emit TrenBoxUpdated(
            _asset, _borrower, 0, 0, 0, TrenBoxManagerOperation.liquidateInNormalMode
        );
    }

    function sendGasCompensation(
        address _asset,
        address _liquidator,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        external
        nonReentrant
        onlyTrenBoxManagerOperations
    {
        if (_debtTokenAmount != 0) {
            IDebtToken(debtToken).returnFromPool(gasPoolAddress, _liquidator, _debtTokenAmount);
        }
        if (_assetAmount != 0) {
            IActivePool(activePool).sendAsset(_asset, _liquidator, _assetAmount);
        }
    }

    // Internal functions
    // ---------------------------------------------------------------------------------------------

    function _redeemCloseTrenBox(
        address _asset,
        address _borrower,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        internal
    {
        IDebtToken(debtToken).burn(gasPoolAddress, _debtTokenAmount);
        // Update Active Pool, and send asset to account
        IActivePool(activePool).decreaseDebt(_asset, _debtTokenAmount);
        // send asset from Active Pool to CollSurplus Pool
        ICollSurplusPool(collSurplusPool).accountSurplus(_asset, _borrower, _assetAmount);
        IActivePool(activePool).sendAsset(_asset, collSurplusPool, _assetAmount);
    }

    function _movePendingTrenBoxRewardsToActivePool(
        address _asset,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        internal
    {
        IDefaultPool(defaultPool).decreaseDebt(_asset, _debtTokenAmount);
        IActivePool(activePool).increaseDebt(_asset, _debtTokenAmount);
        IDefaultPool(defaultPool).sendAssetToActivePool(_asset, _assetAmount);
    }

    function _getCurrentTrenBoxAmounts(
        address _asset,
        address _borrower
    )
        internal
        view
        returns (uint256 coll, uint256 debt)
    {
        uint256 pendingCollReward = getPendingAssetReward(_asset, _borrower);
        uint256 pendingDebtReward = getPendingDebtTokenReward(_asset, _borrower);
        TrenBox memory trenBox = TrenBoxes[_borrower][_asset];
        coll = trenBox.coll + pendingCollReward;
        debt = trenBox.debt + pendingDebtReward;
    }

    // Add the borrowers's coll and debt rewards earned from redistributions, to their TrenBox
    function _applyPendingRewards(address _asset, address _borrower) internal {
        if (!hasPendingRewards(_asset, _borrower)) {
            return;
        }

        // Compute pending rewards
        uint256 pendingCollReward = getPendingAssetReward(_asset, _borrower);
        uint256 pendingDebtReward = getPendingDebtTokenReward(_asset, _borrower);

        // Apply pending rewards to trenBox's state
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        trenBox.coll = trenBox.coll + pendingCollReward;
        trenBox.debt = trenBox.debt + pendingDebtReward;

        _updateTrenBoxRewardSnapshots(_asset, _borrower);

        // Transfer from DefaultPool to ActivePool
        _movePendingTrenBoxRewardsToActivePool(_asset, pendingDebtReward, pendingCollReward);

        emit TrenBoxUpdated(
            _asset,
            _borrower,
            trenBox.debt,
            trenBox.coll,
            trenBox.stake,
            TrenBoxManagerOperation.applyPendingRewards
        );
    }

    function _updateTrenBoxRewardSnapshots(address _asset, address _borrower) internal {
        uint256 liquidatedColl = L_Colls[_asset];
        uint256 liquidatedDebt = L_Debts[_asset];
        RewardSnapshot storage snapshot = rewardSnapshots[_borrower][_asset];
        snapshot.asset = liquidatedColl;
        snapshot.debt = liquidatedDebt;
        emit TrenBoxSnapshotsUpdated(_asset, liquidatedColl, liquidatedDebt);
    }

    function _removeStake(address _asset, address _borrower) internal {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        totalStakes[_asset] -= trenBox.stake;
        trenBox.stake = 0;
    }

    // Update borrower's stake based on their latest collateral value
    function _updateStakeAndTotalStakes(
        address _asset,
        address _borrower
    )
        internal
        returns (uint256)
    {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        uint256 newStake = _computeNewStake(_asset, trenBox.coll);
        uint256 oldStake = trenBox.stake;
        trenBox.stake = newStake;
        uint256 newTotal = totalStakes[_asset] - oldStake + newStake;
        totalStakes[_asset] = newTotal;
        emit TotalStakesUpdated(_asset, newTotal);
        return newStake;
    }

    // Calculate a new stake based on the snapshots of the totalStakes and totalCollateral taken at
    // the last liquidation
    function _computeNewStake(
        address _asset,
        uint256 _coll
    )
        internal
        view
        returns (uint256 stake)
    {
        uint256 assetColl = totalCollateralSnapshot[_asset];
        if (assetColl == 0) {
            stake = _coll;
        } else {
            uint256 assetStakes = totalStakesSnapshot[_asset];
            /*
             * The following assert() holds true because:
             * - The system always contains >= 1 trenBox
            * - When we close or liquidate a trenBox, we redistribute the pending rewards, so if all
            trenBoxes were closed/liquidated,
            * rewards would’ve been emptied and totalCollateralSnapshot would be zero too.
             */
            assert(assetStakes != 0);
            stake = (_coll * assetStakes) / assetColl;
        }
    }

    function _closeTrenBox(address _asset, address _borrower, Status closedStatus) internal {
        assert(closedStatus != Status.nonExistent && closedStatus != Status.active);

        uint256 TrenBoxOwnersArrayLength = TrenBoxOwners[_asset].length;
        if (TrenBoxOwnersArrayLength <= 1 || ISortedTrenBoxes(sortedTrenBoxes).getSize(_asset) <= 1)
        {
            revert TrenBoxManager__OnlyOneTrenBox();
        }

        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        trenBox.status = closedStatus;
        trenBox.coll = 0;
        trenBox.debt = 0;

        RewardSnapshot storage rewardSnapshot = rewardSnapshots[_borrower][_asset];
        rewardSnapshot.asset = 0;
        rewardSnapshot.debt = 0;

        _removeTrenBoxOwner(_asset, _borrower, TrenBoxOwnersArrayLength);
        ISortedTrenBoxes(sortedTrenBoxes).remove(_asset, _borrower);
    }

    function _removeTrenBoxOwner(
        address _asset,
        address _borrower,
        uint256 TrenBoxOwnersArrayLength
    )
        internal
    {
        TrenBox memory trenBox = TrenBoxes[_borrower][_asset];
        assert(trenBox.status != Status.nonExistent && trenBox.status != Status.active);

        uint128 index = trenBox.arrayIndex;
        uint256 length = TrenBoxOwnersArrayLength;
        uint256 idxLast = length - 1;

        assert(index <= idxLast);

        address[] storage trenBoxAssetOwners = TrenBoxOwners[_asset];
        address addressToMove = trenBoxAssetOwners[idxLast];

        trenBoxAssetOwners[index] = addressToMove;
        TrenBoxes[addressToMove][_asset].arrayIndex = index;
        emit TrenBoxIndexUpdated(_asset, addressToMove, index);

        trenBoxAssetOwners.pop();
    }

    function _calcRedemptionRate(
        address _asset,
        uint256 _baseRate
    )
        internal
        view
        returns (uint256)
    {
        return TrenMath._min(
            IAdminContract(adminContract).getRedemptionFeeFloor(_asset) + _baseRate,
            DECIMAL_PRECISION
        );
    }

    function _calcRedemptionFee(
        uint256 _redemptionRate,
        uint256 _assetDraw
    )
        internal
        pure
        returns (uint256)
    {
        uint256 redemptionFee = (_redemptionRate * _assetDraw) / DECIMAL_PRECISION;
        if (redemptionFee >= _assetDraw) {
            revert TrenBoxManager__FeeBiggerThanAssetDraw();
        }
        return redemptionFee;
    }

    function _updateLastFeeOpTime(address _asset) internal {
        uint256 timePassed = block.timestamp - lastFeeOperationTime[_asset];
        if (timePassed >= SECONDS_IN_ONE_MINUTE) {
            // Update the last fee operation time only if time passed >= decay interval. This
            // prevents base rate griefing.
            lastFeeOperationTime[_asset] = block.timestamp;
            emit LastFeeOpTimeUpdated(_asset, block.timestamp);
        }
    }

    function _calcDecayedBaseRate(address _asset) internal view returns (uint256) {
        uint256 minutesPassed = _minutesPassedSinceLastFeeOp(_asset);
        uint256 decayFactor = TrenMath._decPow(MINUTE_DECAY_FACTOR, minutesPassed);
        return (baseRate[_asset] * decayFactor) / DECIMAL_PRECISION;
    }

    function _minutesPassedSinceLastFeeOp(address _asset) internal view returns (uint256) {
        return (block.timestamp - lastFeeOperationTime[_asset]) / SECONDS_IN_ONE_MINUTE;
    }

    // --- TrenBox property getters
    // --------------------------------------------------------------------------------------

    function getTrenBoxStatus(
        address _asset,
        address _borrower
    )
        public
        view
        override
        returns (uint256)
    {
        return uint256(TrenBoxes[_borrower][_asset].status);
    }

    function getTrenBoxStake(
        address _asset,
        address _borrower
    )
        external
        view
        override
        returns (uint256)
    {
        return TrenBoxes[_borrower][_asset].stake;
    }

    function getTrenBoxDebt(
        address _asset,
        address _borrower
    )
        external
        view
        override
        returns (uint256)
    {
        return TrenBoxes[_borrower][_asset].debt;
    }

    function getTrenBoxColl(
        address _asset,
        address _borrower
    )
        external
        view
        override
        returns (uint256)
    {
        return TrenBoxes[_borrower][_asset].coll;
    }

    function getTrenBoxOwnersCount(address _asset) external view override returns (uint256) {
        return TrenBoxOwners[_asset].length;
    }

    function getTrenBoxFromTrenBoxOwnersArray(
        address _asset,
        uint256 _index
    )
        external
        view
        override
        returns (address)
    {
        return TrenBoxOwners[_asset][_index];
    }

    function getNetDebt(address _asset, uint256 _debt) external view returns (uint256) {
        return _getNetDebt(_asset, _debt);
    }

    // --- TrenBox property setters, called by Tren's
    // BorrowerOperations/VMRedemptions/VMLiquidations ---------------

    function setTrenBoxStatus(
        address _asset,
        address _borrower,
        uint256 _num
    )
        external
        override
        onlyBorrowerOperations
    {
        TrenBoxes[_borrower][_asset].status = Status(_num);
    }

    function increaseTrenBoxColl(
        address _asset,
        address _borrower,
        uint256 _collIncrease
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256 newColl)
    {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        newColl = trenBox.coll + _collIncrease;
        trenBox.coll = newColl;
    }

    function decreaseTrenBoxColl(
        address _asset,
        address _borrower,
        uint256 _collDecrease
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256 newColl)
    {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        newColl = trenBox.coll - _collDecrease;
        trenBox.coll = newColl;
    }

    function increaseTrenBoxDebt(
        address _asset,
        address _borrower,
        uint256 _debtIncrease
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256 newDebt)
    {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        newDebt = trenBox.debt + _debtIncrease;
        trenBox.debt = newDebt;
    }

    function decreaseTrenBoxDebt(
        address _asset,
        address _borrower,
        uint256 _debtDecrease
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256)
    {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        uint256 oldDebt = trenBox.debt;
        if (_debtDecrease == 0) {
            return oldDebt; // no changes
        }
        uint256 paybackFraction = (_debtDecrease * 1 ether) / oldDebt;
        uint256 newDebt = oldDebt - _debtDecrease;
        trenBox.debt = newDebt;
        if (paybackFraction != 0) {
            IFeeCollector(feeCollector).decreaseDebt(_borrower, _asset, paybackFraction);
        }
        return newDebt;
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
