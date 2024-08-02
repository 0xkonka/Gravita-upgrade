// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { TrenBase } from "./Dependencies/TrenBase.sol";
import { TrenMath, DECIMAL_PRECISION } from "./Dependencies/TrenMath.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { IFeeCollector } from "./Interfaces/IFeeCollector.sol";
import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";

/**
 * @title TrenBoxManager
 * @notice Contains functionality for liquidations, redistributions, and the state of each TrenBox.
 */
contract TrenBoxManager is
    ITrenBoxManager,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    TrenBase
{
    // Constants
    // ------------------------------------------------------------------------------------------------

    /// @notice The contract name.
    string public constant NAME = "TrenBoxManager";
    /// @notice The number of seconds in one minute.
    uint256 public constant SECONDS_IN_ONE_MINUTE = 60;
    /// @dev Half-life of 12h. 12h = 720 min, (1/2) = d^720 => d = (1/2)^(1/720)
    uint256 public constant MINUTE_DECAY_FACTOR = 999_037_758_833_783_000;

    // State
    // -------------------------------------------------------------------------------------------------

    /// @notice The mapping from collateral asset to the timestamp of the latest fee operation
    /// (redemption or new debt token issuance)
    mapping(address collateral => uint256 feeOpeartionTimestamp) public lastFeeOperationTime;
    /// @notice The mapping from borrower address to the TrenBox for a specific collateral asset.
    mapping(address borrower => mapping(address collateral => TrenBox)) public TrenBoxes;
    /// @notice The mapping from collateral asset to the total debt tokens staked.
    mapping(address collateral => uint256 totalStake) public totalStakes;
    /// @notice The snapshot of total staked amount, taken immediately after the latest liquidation.
    mapping(address collateral => uint256 totalStake) public totalStakesSnapshot;
    /// @notice The snapshot of the total collateral in TrenBoxStorage, immediately after the
    /// latest liquidation.
    mapping(address collateral => uint256 totalCollateral) public totalCollateralSnapshot;

    /// @notice The collateral sums of accumulated liquidation rewards per unit staked.
    mapping(address collateral => uint256 accumulatedRewards) public L_Colls;
    /// @notice The debt sums of accumulated liquidation rewards per unit staked.
    mapping(address collateral => uint256 accumulatedRewards) public L_Debts;

    /**
     * @dev L_Colls and L_Debts track the sums of accumulated liquidation rewards per unit staked.
     * During its lifetime, each stake earns:
     *
     * An asset gain of ( stake * [L_Colls - L_Colls(0)] )
     * A debt increase of ( stake * [L_Debts - L_Debts(0)] )
     *
     * Where L_Colls(0) and L_Debts(0) are snapshots of L_Colls and L_Debts for the active TrenBox
     * taken at the instant the stake was made.
     */

    /// @notice The mapping from borrowers with active TrenBoxes to their reward snapshots.
    mapping(address borrower => mapping(address collateral => RewardSnapshot)) public
        rewardSnapshots;

    /// @notice The array of all active TrenBox addresses.
    /// @dev Used to compute an approximate hint off-chain for the sorted list insertion.
    mapping(address collateral => address[] owners) public trenBoxOwners;

    /// @notice The mapping to track the error in collateral redistribution calculation.
    mapping(address collateral => uint256 collateralError) public lastCollError_Redistribution;
    /// @notice The mapping to track the error in debt redistribution calculation.
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

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);

        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    // External/public functions
    // --------------------------------------------------------------------------------------

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
    function getTCR(address _asset, uint256 _price) external view override returns (uint256) {
        return _getTCR(_asset, _price);
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
    function getBorrowingRate(address _asset) external view override returns (uint256) {
        return IAdminContract(adminContract).getBorrowingFee(_asset);
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
    function getTrenBoxFromTrenBoxOwnersArray(
        address _asset,
        uint256 _index
    )
        external
        view
        override
        returns (address)
    {
        return trenBoxOwners[_asset][_index];
    }

    /// @inheritdoc ITrenBoxManager
    function getNetDebt(address _asset, uint256 _debt) external view returns (uint256) {
        return _getNetDebt(_asset, _debt);
    }

    // --- TrenBox property getters
    // --------------------------------------------------------------------------------------

    /// @inheritdoc ITrenBoxManager
    function getTrenBoxOwnersCount(address _asset) external view override returns (uint256) {
        return trenBoxOwners[_asset].length;
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    // Called by Tren contracts
    // ------------------------------------------------------------------------------------

    /// @inheritdoc ITrenBoxManager
    function addTrenBoxOwnerToArray(
        address _asset,
        address _borrower
    )
        external
        override
        onlyBorrowerOperations
        returns (uint256 index)
    {
        address[] storage assetOwners = trenBoxOwners[_asset];
        assetOwners.push(_borrower);
        index = assetOwners.length - 1;
        TrenBoxes[_borrower][_asset].arrayIndex = uint128(index);
        return index;
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
    function movePendingTrenBoxRewardsFromLiquidatedToActive(
        address _asset,
        uint256 _debt,
        uint256 _assetAmount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _movePendingTrenBoxRewardsFromLiquidatedToActive(_asset, _debt, _assetAmount);
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

        ITrenBoxStorage(trenBoxStorage).updateDebtAndCollateralBalances(_asset, _debt, _coll, false);
    }

    /// @inheritdoc ITrenBoxManager
    function updateSystemSnapshots_excludeCollRemainder(
        address _asset,
        uint256 _collRemainder
    )
        external
        onlyTrenBoxManagerOperations
    {
        uint256 totalStakesCached = totalStakes[_asset];
        totalStakesSnapshot[_asset] = totalStakesCached;
        uint256 totalColl = ITrenBoxStorage(trenBoxStorage).getTotalCollateralBalance(_asset);
        uint256 _totalCollateralSnapshot = totalColl - _collRemainder;
        totalCollateralSnapshot[_asset] = _totalCollateralSnapshot;
        emit SystemSnapshotsUpdated(_asset, totalStakesCached, _totalCollateralSnapshot);
    }

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
    function closeTrenBoxRedistribution(
        address _asset,
        address _borrower,
        uint256 _debtTokenGasCompensation
    )
        external
        onlyTrenBoxManagerOperations
    {
        _closeTrenBox(_asset, _borrower, Status.closedByRedistribution);
        IFeeCollector(feeCollector).liquidateDebt(_borrower, _asset);
        emit TrenBoxUpdated(
            _asset, _borrower, 0, 0, 0, TrenBoxManagerOperation.redistributeCollateral
        );
        IDebtToken(debtToken).burn(trenBoxStorage, _debtTokenGasCompensation);
    }

    /// @inheritdoc ITrenBoxManager
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
            IDebtToken(debtToken).returnFromPool(trenBoxStorage, _liquidator, _debtTokenAmount);
        }
        if (_assetAmount != 0) {
            ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset, _liquidator, _assetAmount);
        }
    }

    // --- TrenBox property setters, called by Tren's
    // BorrowerOperations/VMLiquidations ---------------

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    /// @inheritdoc ITrenBoxManager
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

    // Internal functions
    // ---------------------------------------------------------------------------------------------

    /**
     * @dev Moves a TrenBox's pending debt and collateral rewards from liquidations
     * to TrenBoxStorage contract.
     * @param _asset The address of collateral asset.
     * @param _debtTokenAmount The pending rewards of debt tokens.
     * @param _assetAmount The pending rewards of collateral asset.
     */
    function _movePendingTrenBoxRewardsFromLiquidatedToActive(
        address _asset,
        uint256 _debtTokenAmount,
        uint256 _assetAmount
    )
        internal
    {
        ITrenBoxStorage(trenBoxStorage).updateDebtAndCollateralBalances(
            _asset, _debtTokenAmount, _assetAmount, true
        );
    }

    /**
     * @dev Gets current collateral and debt balances of a specific TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
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

    /**
     * @dev Adds the borrowers's collateral and debt rewards earned from redistributions &
     * liquidations to their TrenBoxes.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
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

        // Move liquidated rewards to active in TrenBoxStorage
        _movePendingTrenBoxRewardsFromLiquidatedToActive(
            _asset, pendingDebtReward, pendingCollReward
        );

        emit TrenBoxUpdated(
            _asset,
            _borrower,
            trenBox.debt,
            trenBox.coll,
            trenBox.stake,
            TrenBoxManagerOperation.applyPendingRewards
        );
    }

    /**
     * @dev Updates the borrower's snapshots of L_Colls and L_Debts to reflect the current values
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function _updateTrenBoxRewardSnapshots(address _asset, address _borrower) internal {
        uint256 liquidatedColl = L_Colls[_asset];
        uint256 liquidatedDebt = L_Debts[_asset];
        RewardSnapshot storage snapshot = rewardSnapshots[_borrower][_asset];
        snapshot.asset = liquidatedColl;
        snapshot.debt = liquidatedDebt;
        emit TrenBoxSnapshotsUpdated(_asset, liquidatedColl, liquidatedDebt);
    }

    /**
     * @dev Removes the borrower's stake amount from total staked amount.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
    function _removeStake(address _asset, address _borrower) internal {
        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        totalStakes[_asset] -= trenBox.stake;
        trenBox.stake = 0;
    }

    /**
     * @dev Updates the borrower's stake based on their latest collateral value.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     */
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

    /**
     * @dev Calculates a new stake based on the snapshots of the totalStakes and totalCollateral
     * taken at the last liquidation.
     * @param _asset The address of collateral asset.
     * @param _coll The balance of collateral asset.
     */
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

    /**
     * @dev Closes a TrenBox.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _closedStatus The closed status.
     */
    function _closeTrenBox(address _asset, address _borrower, Status _closedStatus) internal {
        assert(_closedStatus != Status.nonExistent && _closedStatus != Status.active);

        uint256 TrenBoxOwnersArrayLength = trenBoxOwners[_asset].length;
        if (TrenBoxOwnersArrayLength <= 1 || ISortedTrenBoxes(sortedTrenBoxes).getSize(_asset) <= 1)
        {
            revert TrenBoxManager__OnlyOneTrenBox();
        }

        TrenBox storage trenBox = TrenBoxes[_borrower][_asset];
        trenBox.status = _closedStatus;
        trenBox.coll = 0;
        trenBox.debt = 0;

        RewardSnapshot storage rewardSnapshot = rewardSnapshots[_borrower][_asset];
        rewardSnapshot.asset = 0;
        rewardSnapshot.debt = 0;

        _removeTrenBoxOwner(_asset, _borrower, TrenBoxOwnersArrayLength);
        ISortedTrenBoxes(sortedTrenBoxes).remove(_asset, _borrower);
    }

    /**
     * @dev Removes a specific TrenBox's owner.
     * @param _asset The address of collateral asset.
     * @param _borrower The borrower address.
     * @param _TrenBoxOwnersArrayLength The number of owners.
     */
    function _removeTrenBoxOwner(
        address _asset,
        address _borrower,
        uint256 _TrenBoxOwnersArrayLength
    )
        internal
    {
        TrenBox memory trenBox = TrenBoxes[_borrower][_asset];
        assert(trenBox.status != Status.nonExistent && trenBox.status != Status.active);

        uint128 index = trenBox.arrayIndex;
        uint256 length = _TrenBoxOwnersArrayLength;
        uint256 idxLast = length - 1;

        assert(index <= idxLast);

        address[] storage trenBoxAssetOwners = trenBoxOwners[_asset];
        address addressToMove = trenBoxAssetOwners[idxLast];

        trenBoxAssetOwners[index] = addressToMove;
        TrenBoxes[addressToMove][_asset].arrayIndex = index;
        emit TrenBoxIndexUpdated(_asset, addressToMove, index);

        trenBoxAssetOwners.pop();
    }

    /**
     * @dev Updates the last fee operation time only if time passed >= decay interval. This
     * prevents base rate griefing.
     * @param _asset The address of collateral asset.
     */
    function _updateLastFeeOpTime(address _asset) internal {
        uint256 timePassed = block.timestamp - lastFeeOperationTime[_asset];
        if (timePassed >= SECONDS_IN_ONE_MINUTE) {
            lastFeeOperationTime[_asset] = block.timestamp;
            emit LastFeeOpTimeUpdated(_asset, block.timestamp);
        }
    }

    /**
     * @dev Calculates the minutes passed from last fee operation.
     * @param _asset The address of collateral asset.
     */
    function _minutesPassedSinceLastFeeOp(address _asset) internal view returns (uint256) {
        return (block.timestamp - lastFeeOperationTime[_asset]) / SECONDS_IN_ONE_MINUTE;
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
