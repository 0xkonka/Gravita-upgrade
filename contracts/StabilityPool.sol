// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { TrenBase } from "./Dependencies/TrenBase.sol";
import { TrenMath, DECIMAL_PRECISION } from "./Dependencies/TrenMath.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { ICommunityIssuance } from "./Interfaces/ICommunityIssuance.sol";
import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";

/**
 * @title StabilityPool
 * @notice Holds debt tokens deposited by Stability Pool depositors.
 * @dev When a trenBox is liquidated, then depending on system conditions, some of its debt tokens
 * debt gets offset with
 * debt tokens in the Stability Pool: that is, the offset debt evaporates, and an equal amount of
 * debt tokens tokens in the Stability Pool is burned.
 *
 * Thus, a liquidation causes each depositor to receive a debt tokens loss, in proportion to their
 * deposit as a share of total deposits.
 * They also receive an Collateral gain, as the amount of collateral of the liquidated trenBox is
 * distributed among Stability depositors,
 * in the same proportion.
 *
 * When a liquidation occurs, it depletes every deposit by the same fraction: for example, a
 * liquidation that depletes 40%
 * of the total debt tokens in the Stability Pool, depletes 40% of each deposit.
 *
 * A deposit that has experienced a series of liquidations is termed a "compounded deposit": each
 * liquidation depletes the deposit,
 * multiplying it by some factor in range [0,1]
 *
 * --- IMPLEMENTATION ---
 *
 * We use a highly scalable method of tracking deposits and Collateral gains that has O(1)
 * complexity.
 *
 * When a liquidation occurs, rather than updating each depositor's deposit and Collateral gain, we
 * simply update two state variables:
 * a product P, and a sum S. These are kept track for each type of collateral.
 *
 * A mathematical manipulation allows us to factor out the initial deposit, and accurately track all
 * depositors' compounded deposits
 * and accumulated Collateral amount gains over time, as liquidations occur, using just these two
 * variables P and S. When depositors join the
 * Stability Pool, they get a snapshot of the latest P and S: P_t and S_t, respectively.
 *
 * The formula for a depositor's accumulated Collateral amount gain is derived here:
 * https://github.com/liquity/dev/blob/main/papers/Scalable_Reward_Distribution_with_Compounding_Stakes.pdf
 *
 * For a given deposit d_t, the ratio P/P_t tells us the factor by which a deposit has decreased
 * since it joined the Stability Pool,
 * and the term d_t * (S - S_t)/P_t gives us the deposit's total accumulated Collateral amount gain.
 *
 * Each liquidation updates the product P and sum S. After a series of liquidations, a compounded
 * deposit and corresponding Collateral amount gain
 * can be calculated using the initial deposit, the depositor’s snapshots of P and S, and the
 * latest values of P and S.
 *
 * Any time a depositor updates their deposit (withdrawal, top-up) their accumulated Collateral
 * amount gain is paid out, their new deposit is recorded
 * (based on their latest compounded deposit and modified by the withdrawal/top-up), and they
 * receive new snapshots of the latest P and S.
 * Essentially, they make a fresh deposit that overwrites the old one.
 *
 * --- SCALE FACTOR ---
 *
 * Since P is a running product in range ]0,1] that is always-decreasing, it should never reach 0
 * when multiplied by a number in range ]0,1[.
 * Unfortunately, Solidity floor division always reaches 0, sooner or later.
 *
 * A series of liquidations that nearly empty the Pool (and thus each multiply P by a very small
 * number in range [0,1]) may push P
 * to its 18 digit decimal limit, and round it to 0, when in fact the Pool hasn't been emptied: this
 * would break deposit tracking.
 *
 * So, to track P accurately, we use a scale factor: if a liquidation would cause P to decrease to
 * <1e-9 (and be rounded to 0 by Solidity),
 * we first multiply P by 1e9, and increment a currentScale factor by 1.
 *
 * The added benefit of using 1e9 for the scale factor (rather than 1e18) is that it ensures
 * negligible precision loss close to the
 * scale boundary: when P is at its minimum value of 1e9, the relative precision loss in P due to
 * floor division is only on the
 * order of 1e-9.
 *
 * --- EPOCHS ---
 *
 * Whenever a liquidation fully empties the Stability Pool, all deposits should become 0. However,
 * setting P to 0 would make P be 0
 * forever, and break all future reward calculations.
 *
 * So, every time the Stability Pool is emptied by a liquidation, we reset P = 1 and currentScale =
 * 0, and increment the currentEpoch by 1.
 *
 * --- TRACKING DEPOSIT OVER SCALE CHANGES AND EPOCHS ---
 *
 * When a deposit is made, it gets snapshots of the currentEpoch and the currentScale.
 *
 * When calculating a compounded deposit, we compare the current epoch to the deposit's epoch
 * snapshot. If the current epoch is newer,
 * then the deposit was present during a pool-emptying liquidation, and necessarily has been
 * depleted to 0.
 *
 * Otherwise, we then compare the current scale to the deposit's scale snapshot. If they're equal,
 * the compounded deposit is given by d_t * P/P_t.
 * If it spans one scale change, it is given by d_t * P/(P_t * 1e9). If it spans more than one scale
 * change, we define the compounded deposit
 * as 0, since it is now less than 1e-9'th of its initial value (e.g. a deposit of 1 billion debt
 * tokens has depleted to < 1 debt token).
 *
 *  --- TRACKING DEPOSITOR'S COLLATERAL AMOUNT GAIN OVER SCALE CHANGES AND EPOCHS ---
 *
 * In the current epoch, the latest value of S is stored upon each scale change, and the mapping
 * (scale -> S) is stored for each epoch.
 *
 * This allows us to calculate a deposit's accumulated Collateral amount gain, during the epoch in
 * which the deposit was non-zero and earned Collateral amount.
 *
 * We calculate the depositor's accumulated Collateral amount gain for the scale at which they made
 * the deposit, using the Collateral amount gain formula:
 * e_1 = d_t * (S - S_t) / P_t
 *
 * and also for scale after, taking care to divide the latter by a factor of 1e9:
 * e_2 = d_t * S / (P_t * 1e9)
 *
 * The gain in the second scale will be full, as the starting point was in the previous scale, thus
 * no need to subtract anything.
 * The deposit therefore was present for reward events from the beginning of that second scale.
 *
 *        S_i-S_t + S_{i+1}
 *      .<--------.------------>
 *      .         .
 *      . S_i     .   S_{i+1}
 *   <--.-------->.<----------->
 *   S_t.         .
 *   <->.         .
 *      t         .
 *  |---+---------|-------------|-----...
 *         i            i+1
 *
 * The sum of (e_1 + e_2) captures the depositor's total accumulated Collateral amount gain,
 * handling the case where their
 * deposit spanned one scale change. We only care about gains across one scale change, since the
 * compounded
 * deposit is defined as being 0 once it has spanned more than one scale change.
 *
 * --- UPDATING P WHEN A LIQUIDATION OCCURS ---
 *
 * Please see the implementation spec in the proof document, which closely follows on from the
 * compounded deposit / Collateral amount gain derivations:
 * https://github.com/liquity/liquity/blob/master/papers/Scalable_Reward_Distribution_with_Compounding_Stakes.pdf
 *
 * --- TREN ISSUANCE TO STABILITY POOL DEPOSITORS ---
 *
 * An TREN issuance event occurs at every deposit operation, and every liquidation.
 *
 * All deposits earn a share of the issued TREN in proportion to the deposit as a share of total
 * deposits.
 *
 * Please see the system Readme for an overview:
 * https://github.com/liquity/dev/blob/main/README.md#lqty-issuance-to-stability-providers
 *
 * We use the same mathematical product-sum approach to track TREN gains for depositors, where
 * 'G' is the sum corresponding to TREN gains.
 * The product P (and snapshot P_t) is re-used, as the ratio P/P_t tracks a deposit's depletion due
 * to liquidations.
 */
contract StabilityPool is ReentrancyGuardUpgradeable, UUPSUpgradeable, TrenBase, IStabilityPool {
    using SafeERC20 for IERC20;

    /// @notice The contract name.
    string public constant NAME = "StabilityPool";

    /// @dev The tracker for debt tokens held in the pool. Changes when users deposit/withdraw,
    /// and when TrenBox debt is offset.
    uint256 internal totalDebtTokenDeposits;

    /// @dev totalColl.tokens and totalColl.amounts should be the same length and
    /// always be the same length as IAdminContract(adminContract).validCollaterals().
    /// Anytime a new collateral is added to AdminContract, both lists are lengthened.
    Colls internal totalColl;

    /// @notice The mapping from depositor address to its deposit amount.
    mapping(address depositor => uint256 amount) public deposits;

    /**
     * @notice The mapping maintains an entry for each depositor that tracks P, S, G, scale,
     * and epoch.
     * @dev depositor's snapshot is updated only when they deposit or withdraw from stability pool.
     * depositSnapshots are used to allocate TREN rewards, calculate compoundedDepositAmount
     * and to calculate how much Collateral amount the depositor is entitled to.
     */
    mapping(address depositor => Snapshots snapshot) public depositSnapshots;

    /**
     * @notice Product 'P': Running product by which to multiply an initial deposit, in order to
     * find the current compounded deposit,
     * after a series of liquidations have occurred, each of which cancel some debt tokens debt with
     * the deposit.
     *
     * @dev During its lifetime, a deposit's value evolves from d_t to d_t * P / P_t , where P_t
     * is the snapshot of P taken at the instant the deposit was made. 18-digit decimal.
     */
    uint256 public P;

    /// @notice The unit factor to be used in scale increment.
    uint256 public constant SCALE_FACTOR = 1e9;

    /// @notice Each time the scale of P shifts by SCALE_FACTOR, the scale is incremented by 1.
    uint128 public currentScale;

    /// @notice With each offset that fully empties the Pool, the epoch is incremented by 1.
    uint128 public currentEpoch;

    /**
     * @dev Collateral amount Gain sum 'S': During its lifetime, each deposit d_t earns
     * an Collateral amount gain of ( d_t * [S - S_t] )/P_t,
     * where S_t is the depositor's snapshot of S taken at the time t when the deposit was made.
     *
     * The 'S' sums are stored in a nested mapping (epoch => scale => sum):
     * - The inner mapping records the (scale => sum)
     * - The middle mapping records (epoch => (scale => sum))
     * - The outer mapping records (collateralType => (epoch => (scale => sum)))
     */
    mapping(
        address collateral
            => mapping(uint128 collateralType => mapping(uint128 epoch => uint256 sum))
    ) public epochToScaleToSum;

    /**
     * @dev Similarly, the sum 'G' is used to calculate TREN gains. During it's lifetime,
     * each deposit d_t earns a TREN gain of
     * ( d_t * [G - G_t] )/P_t, where G_t is the depositor's snapshot of G taken at time t
     * when the deposit was made.
     *
     * TREN reward events occur are triggered by depositor operations (new deposit, topup,
     * withdrawal), and liquidations.
     * In each case, the TREN reward is issued (i.e. G is updated), before other state changes are
     * made.
     */
    mapping(uint128 epoch => mapping(uint128 scale => uint256 G)) public epochToScaleToG;

    /// @notice The tracker for the error correction in the TREN issuance calculation.
    uint256 public lastTRENError;

    /// @notice The trackers for the error correction in the offset calculation.
    uint256[] public lastAssetError_Offset;

    /// @notice The tracker for the error correction in the calculation of debt token loss.
    uint256 public lastDebtTokenLossError_Offset;

    // --- Modifiers ---

    modifier onlyAdminContract() {
        if (msg.sender != adminContract) {
            revert StabilityPool__AdminContractOnly(msg.sender, adminContract);
        }
        _;
    }

    modifier onlyTrenBoxStorage() {
        if (msg.sender != trenBoxStorage) {
            revert StabilityPool__TrenBoxStorageOnly(msg.sender, trenBoxStorage);
        }
        _;
    }

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert StabilityPool__TrenBoxManagerOnly(msg.sender, trenBoxManager);
        }
        _;
    }

    // --- Initializer ---

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
        P = DECIMAL_PRECISION;
    }

    /// @inheritdoc IStabilityPool
    function getCollateral(address _collateral) external view override returns (uint256) {
        uint256 collateralIndex = IAdminContract(adminContract).getIndex(_collateral);
        return totalColl.amounts[collateralIndex];
    }

    /// @inheritdoc IStabilityPool
    function getAllCollateral()
        external
        view
        override
        returns (address[] memory, uint256[] memory)
    {
        return (totalColl.tokens, totalColl.amounts);
    }

    /// @inheritdoc IStabilityPool
    function getTotalDebtTokenDeposits() external view override returns (uint256) {
        return totalDebtTokenDeposits;
    }

    /// @inheritdoc IStabilityPool
    function getDepositorGains(
        address _depositor,
        address[] memory _assets
    )
        public
        view
        returns (address[] memory, uint256[] memory)
    {
        uint256 initialDeposit = deposits[_depositor];

        if (initialDeposit == 0) {
            address[] memory emptyAddress = new address[](0);
            uint256[] memory emptyUint = new uint256[](0);
            return (emptyAddress, emptyUint);
        }

        Snapshots storage snapshots = depositSnapshots[_depositor];

        uint256[] memory amountsFromNewGains =
            _calculateNewGains(initialDeposit, snapshots, _assets);
        return (_assets, amountsFromNewGains);
    }

    /// @inheritdoc IStabilityPool
    function getDepositorTRENGain(address _depositor) public view override returns (uint256) {
        uint256 initialDeposit = deposits[_depositor];
        if (initialDeposit == 0) {
            return 0;
        }

        Snapshots storage snapshots = depositSnapshots[_depositor];
        return _getTRENGainFromSnapshots(initialDeposit, snapshots);
    }

    /// @inheritdoc IStabilityPool
    function getCompoundedDebtTokenDeposits(address _depositor)
        public
        view
        override
        returns (uint256)
    {
        uint256 initialDeposit = deposits[_depositor];
        if (initialDeposit == 0) {
            return 0;
        }

        return _getCompoundedStakeFromSnapshots(initialDeposit, depositSnapshots[_depositor]);
    }

    /**
     * @notice Returns the specific collateral gain for a specific depositor.
     * @param _depositor The depositor address.
     * @param _asset The address of collateral asset.
     */
    function S(address _depositor, address _asset) external view returns (uint256) {
        return depositSnapshots[_depositor].S[_asset];
    }

    // --- External Depositor Functions ---

    /// @inheritdoc IStabilityPool
    function addCollateralType(address _collateral) external onlyAdminContract {
        lastAssetError_Offset.push(0);
        totalColl.tokens.push(_collateral);
        totalColl.amounts.push(0);
    }

    /// @inheritdoc IStabilityPool
    function provideToSP(
        uint256 _amount,
        address[] calldata _assets
    )
        external
        override
        nonReentrant
    {
        _requireNonZeroAmount(_amount);

        uint256 initialDeposit = deposits[msg.sender];

        _triggerTRENIssuance();

        (address[] memory gainAssets, uint256[] memory gainAmounts) =
            getDepositorGains(msg.sender, _assets);
        uint256 compoundedDeposit = getCompoundedDebtTokenDeposits(msg.sender);
        uint256 loss = initialDeposit - compoundedDeposit; // Needed only for event log

        // First pay out any TREN gains
        _payOutTRENGains(msg.sender);

        // just pulls debtTokens into the pool, updates totalDeposits variable for the stability
        // pool and throws an event
        _sendToStabilityPool(msg.sender, _amount);

        uint256 newDeposit = compoundedDeposit + _amount;
        _updateDepositAndSnapshots(msg.sender, newDeposit);
        emit UserDepositChanged(msg.sender, newDeposit);

        // loss required for event log
        emit GainsWithdrawn(msg.sender, gainAssets, gainAmounts, loss);

        // send any collateral gains accrued to the depositor
        _sendGainsToDepositor(msg.sender, gainAssets, gainAmounts);
    }

    /// @inheritdoc IStabilityPool
    function withdrawFromSP(uint256 _amount, address[] calldata _assets) external nonReentrant {
        (address[] memory assets, uint256[] memory amounts) = _withdrawFromSP(_amount, _assets);
        _sendGainsToDepositor(msg.sender, assets, amounts);
    }

    // --- Liquidation functions ---

    /// @inheritdoc IStabilityPool
    function offset(
        uint256 _debtToOffset,
        address _asset,
        uint256 _amountAdded
    )
        external
        onlyTrenBoxManager
    {
        // cached to save an SLOAD
        uint256 cachedTotalDebtTokenDeposits = totalDebtTokenDeposits;
        if (cachedTotalDebtTokenDeposits == 0 || _debtToOffset == 0) {
            return;
        }
        _triggerTRENIssuance();
        (uint256 collGainPerUnitStaked, uint256 debtLossPerUnitStaked) =
        _computeRewardsPerUnitStaked(
            _asset, _amountAdded, _debtToOffset, cachedTotalDebtTokenDeposits
        );

        // updates S and P
        _updateRewardSumAndProduct(_asset, collGainPerUnitStaked, debtLossPerUnitStaked);
        _moveOffsetCollAndDebt(_asset, _amountAdded, _debtToOffset);
    }

    /**
     * @dev Withdraws debt tokens from the stability pool.
     * @param _amount The amount of debt tokens to withdraw
     * @param _assets The array of collateral assets to be claimed.
     */
    function _withdrawFromSP(
        uint256 _amount,
        address[] calldata _assets
    )
        internal
        returns (address[] memory assets, uint256[] memory amounts)
    {
        uint256 initialDeposit = deposits[msg.sender];
        _requireUserHasDeposit(initialDeposit);

        _triggerTRENIssuance();

        (assets, amounts) = getDepositorGains(msg.sender, _assets);

        uint256 compoundedDeposit = getCompoundedDebtTokenDeposits(msg.sender);

        uint256 debtTokensToWithdraw = TrenMath._min(_amount, compoundedDeposit);
        uint256 loss = initialDeposit - compoundedDeposit; // Needed only for event log

        // First pay out any TREN gains
        _payOutTRENGains(msg.sender);
        _sendToDepositor(msg.sender, debtTokensToWithdraw);

        // Update deposit
        uint256 newDeposit = compoundedDeposit - debtTokensToWithdraw;
        _updateDepositAndSnapshots(msg.sender, newDeposit);
        emit UserDepositChanged(msg.sender, newDeposit);

        emit GainsWithdrawn(msg.sender, assets, amounts, loss); // loss required for event log
    }

    // --- TREN issuance functions ---

    /**
     * @dev Triggers a TREN issuance shared between all depositors.
     */
    function _triggerTRENIssuance() internal {
        if (communityIssuance != address(0)) {
            uint256 TRENIssuance = ICommunityIssuance(communityIssuance).issueTREN();
            _updateG(TRENIssuance);
        }
    }

    /**
     * @dev Updates the sum of TREN gains.
     * @param _TRENIssuance The TREN issuance.
     */
    function _updateG(uint256 _TRENIssuance) internal {
        uint256 cachedTotalDebtTokenDeposits = totalDebtTokenDeposits; // cached to save an SLOAD
        /*
        * When total deposits is 0, G is not updated. In this case, the TREN issued can not be
        obtained by later
        * depositors - it is missed out on, and remains in the balanceof the CommunityIssuance
        contract.
         *
         */
        if (cachedTotalDebtTokenDeposits == 0 || _TRENIssuance == 0) {
            return;
        }
        uint256 TRENPerUnitStaked =
            _computeTRENPerUnitStaked(_TRENIssuance, cachedTotalDebtTokenDeposits);
        uint256 marginalTRENGain = TRENPerUnitStaked * P;
        uint256 newEpochToScaleToG = epochToScaleToG[currentEpoch][currentScale];
        newEpochToScaleToG += marginalTRENGain;
        epochToScaleToG[currentEpoch][currentScale] = newEpochToScaleToG;
        emit GainsUpdated(newEpochToScaleToG, currentEpoch, currentScale);
    }

    /**
     * @dev Calculates the TREN-per-unit staked. Division uses a "feedback" error correction,
     * to keep the cumulative error low in the running total G:
     *
     * 1) Form a numerator which compensates for the floor division error that occurred the last
     * time this function was called.
     * 2) Calculate "per-unit-staked" ratio.
     * 3) Multiply the ratio back by its denominator, to reveal the current floor division error.
     * 4) Store this error for use in the next correction when this function is called.
     * 5) Note: static analysis tools complain about this "division before multiplication",
     * however, it is intended.
     * @param _TRENIssuance The TREN issuance.
     * @param _totalDeposits The total depositors.
     */
    function _computeTRENPerUnitStaked(
        uint256 _TRENIssuance,
        uint256 _totalDeposits
    )
        internal
        returns (uint256)
    {
        uint256 TRENNumerator = (_TRENIssuance * DECIMAL_PRECISION) + lastTRENError;
        uint256 TRENPerUnitStaked = TRENNumerator / _totalDeposits;
        lastTRENError = TRENNumerator - (TRENPerUnitStaked * _totalDeposits);
        return TRENPerUnitStaked;
    }

    // --- Offset helper functions ---

    /**
     * @dev Computes the debtToken and Collateral amount rewards. Uses a "feedback" error
     * correction, to keep
     * the cumulative error in the P and S state variables low:
     *
     * 1) Form numerators which compensate for the floor division errors that occurred the last
     * time this function was called.
     * 2) Calculate "per-unit-staked" ratios.
     * 3) Multiply each ratio back by its denominator, to reveal the current floor division error.
     * 4) Store these errors for use in the next correction when this function is called.
     * 5) Note: static analysis tools complain about this "division before multiplication", however,
     * it is intended.
     * @param _asset The address of collateral asset.
     * @param _amountAdded The amount of collateral asset to be added.
     * @param _debtToOffset The amount of debt tokens to offset.
     * @param _totalDeposits The total depositors.
     */
    function _computeRewardsPerUnitStaked(
        address _asset,
        uint256 _amountAdded,
        uint256 _debtToOffset,
        uint256 _totalDeposits
    )
        internal
        returns (uint256 collGainPerUnitStaked, uint256 debtLossPerUnitStaked)
    {
        uint256 assetIndex = IAdminContract(adminContract).getIndex(_asset);
        uint256 collateralNumerator =
            (_amountAdded * DECIMAL_PRECISION) + lastAssetError_Offset[assetIndex];
        if (_debtToOffset > _totalDeposits) {
            revert StabilityPool__DebtLargerThanTotalDeposits();
        }

        if (_debtToOffset == _totalDeposits) {
            debtLossPerUnitStaked = DECIMAL_PRECISION; // When the Pool depletes to 0, so does each
                // deposit
            lastDebtTokenLossError_Offset = 0;
        } else {
            uint256 lossNumerator =
                (_debtToOffset * DECIMAL_PRECISION) - lastDebtTokenLossError_Offset;
            /*
            * Add 1 to make error in quotient positive. We want "slightly too much" loss,
            * which ensures the error in any given compoundedDeposit favors the Stability Pool.
             */
            debtLossPerUnitStaked = (lossNumerator / _totalDeposits) + 1;
            lastDebtTokenLossError_Offset = (debtLossPerUnitStaked * _totalDeposits) - lossNumerator;
        }
        collGainPerUnitStaked = collateralNumerator / _totalDeposits;
        lastAssetError_Offset[assetIndex] =
            collateralNumerator - (collGainPerUnitStaked * _totalDeposits);
    }

    /**
     * @dev Updates S and P.
     * @param _asset The address of collateral asset.
     * @param _collGainPerUnitStaked The collateral gain per unit staked.
     * @param _debtLossPerUnitStaked The debt loss per unit staked.
     */
    function _updateRewardSumAndProduct(
        address _asset,
        uint256 _collGainPerUnitStaked,
        uint256 _debtLossPerUnitStaked
    )
        internal
    {
        if (_debtLossPerUnitStaked > DECIMAL_PRECISION) {
            revert StabilityPool__DebtLossBelowOne(_debtLossPerUnitStaked);
        }

        uint256 currentP = P;
        uint256 newP;

        /*
        * The newProductFactor is the factor by which to change all deposits, due to the depletion
        of Stability Pool debt tokens in the liquidation.
        * We make the product factor 0 if there was a pool-emptying. Otherwise, it is (1 -
        _debtLossPerUnitStaked)
         */
        uint256 newProductFactor = DECIMAL_PRECISION - _debtLossPerUnitStaked;
        uint128 currentScaleCached = currentScale;
        uint128 currentEpochCached = currentEpoch;
        uint256 currentS = epochToScaleToSum[_asset][currentEpochCached][currentScaleCached];

        /*
         * Calculate the new S first, before we update P.
        * The asset gain for any given depositor from a liquidation depends on the value of their
        deposit
        * (and the value of totalDeposits) prior to the Stability being depleted by the debt in the
        liquidation.
         *
         * Since S corresponds to asset gain, and P to deposit loss, we update S first.
         */
        uint256 marginalAssetGain = _collGainPerUnitStaked * currentP;
        uint256 newS = currentS + marginalAssetGain;
        epochToScaleToSum[_asset][currentEpochCached][currentScaleCached] = newS;
        emit SumUpdated(_asset, newS, currentEpochCached, currentScaleCached);

        // If the Stability Pool was emptied, increment the epoch, and reset the scale and product P
        if (newProductFactor == 0) {
            currentEpochCached += 1;
            currentEpoch = currentEpochCached;
            emit EpochUpdated(currentEpochCached);
            currentScale = 0;
            emit ScaleUpdated(0);
            newP = DECIMAL_PRECISION;

            // If multiplying P by a non-zero product factor would reduce P below the scale
            // boundary, increment the scale
        } else {
            uint256 mulCached = currentP * newProductFactor;
            uint256 mulDivCached = mulCached / DECIMAL_PRECISION;

            if (mulDivCached < SCALE_FACTOR) {
                newP = (mulCached * SCALE_FACTOR) / DECIMAL_PRECISION;
                currentScaleCached += 1;
                currentScale = currentScaleCached;
                emit ScaleUpdated(currentScaleCached);
            } else {
                newP = mulDivCached;
            }
        }

        if (newP == 0) {
            revert StabilityPool__ProductZero();
        }

        P = newP;
        emit ProductUpdated(newP);
    }

    /**
     * @dev Moves offset collateral and debt between pools.
     * Cancels the liquidated debt with the debt tokens in the stability pool,
     * Burns the debt that was successfully offset. Collateral is moved from
     * the TrenBoxStorage to this contract.
     * @param _asset The address of collateral asset.
     * @param _amount The amount of collateral asset.
     * @param _debtToOffset The amount of debt tokens to offset.
     */
    function _moveOffsetCollAndDebt(
        address _asset,
        uint256 _amount,
        uint256 _debtToOffset
    )
        internal
    {
        ITrenBoxStorage(trenBoxStorage).decreaseActiveDebt(_asset, _debtToOffset);
        _decreaseDebtTokens(_debtToOffset);
        IDebtToken(debtToken).burn(address(this), _debtToOffset);
        ITrenBoxStorage(trenBoxStorage).sendCollateral(_asset, address(this), _amount);
    }

    function _decreaseDebtTokens(uint256 _amount) internal {
        uint256 newTotalDeposits = totalDebtTokenDeposits - _amount;
        totalDebtTokenDeposits = newTotalDeposits;
        emit StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits);
    }

    // --- Reward calculator functions for depositor ---

    /**
     * @dev Gets gains on each possible asset by looping through assets with
     * _getGainFromSnapshots function.
     * @param _initialDeposit The amount of initial deposit.
     * @param _snapshots The snapshot storage.
     * @param _assets The ascending ordered array of assets to calculate and claim gains.
     */
    function _calculateNewGains(
        uint256 _initialDeposit,
        Snapshots storage _snapshots,
        address[] memory _assets
    )
        internal
        view
        returns (uint256[] memory amounts)
    {
        uint256 assetsLen = _assets.length;
        _uniqueAddresses(_assets);
        amounts = new uint256[](assetsLen);
        for (uint256 i = 0; i < assetsLen;) {
            amounts[i] = _getGainFromSnapshots(_initialDeposit, _snapshots, _assets[i]);
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Checks if the asset list is in ascending order.
     */
    function _uniqueAddresses(address[] memory _assets) private pure {
        for (uint256 i = 0; i < _assets.length;) {
            for (uint256 j = i + 1; j < _assets.length;) {
                if (_assets[i] == _assets[j]) {
                    revert StabilityPool__ArrayNotInAscendingOrder();
                }
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }
    }

    /**
     * @dev Gets the gain in S for a given asset for a user who made initial deposit.
     * Grabs the sum 'S' from the epoch at which the stake was made. The Collateral amount gain
     * may span up to one scale change.
     * If it does, the second portion of the Collateral amount gain is scaled by 1e9.
     * If the gain spans no scale change, the second portion will be 0.
     * @param _initialDeposit The amount of initial deposit.
     * @param _snapshots The snapshot storage.
     * @param _asset The collateral asset to gain snapshot.
     */
    function _getGainFromSnapshots(
        uint256 _initialDeposit,
        Snapshots storage _snapshots,
        address _asset
    )
        internal
        view
        returns (uint256)
    {
        uint256 S_Snapshot = _snapshots.S[_asset];
        uint256 P_Snapshot = _snapshots.P;

        mapping(uint128 => uint256) storage scaleToSum = epochToScaleToSum[_asset][_snapshots.epoch];
        uint256 firstPortion = scaleToSum[_snapshots.scale] - S_Snapshot;
        uint256 secondPortion = scaleToSum[_snapshots.scale + 1] / SCALE_FACTOR;

        uint256 assetGain =
            (_initialDeposit * (firstPortion + secondPortion)) / P_Snapshot / DECIMAL_PRECISION;

        return assetGain;
    }

    /**
     * @dev Gets the TREN gain for initial stake.
     * Grabs the sum 'G' from the epoch at which the stake was made. The TREN gain may span up to
     * one scale change.
     * If it does, the second portion of the TREN gain is scaled by 1e9.
     * If the gain spans no scale change, the second portion will be 0.
     * @param _initialStake The amount of initial stake.
     * @param _snapshots The snapshot storage.
     */
    function _getTRENGainFromSnapshots(
        uint256 _initialStake,
        Snapshots storage _snapshots
    )
        internal
        view
        returns (uint256)
    {
        uint128 epochSnapshot = _snapshots.epoch;
        uint128 scaleSnapshot = _snapshots.scale;
        uint256 G_Snapshot = _snapshots.G;
        uint256 P_Snapshot = _snapshots.P;

        uint256 firstPortion = epochToScaleToG[epochSnapshot][scaleSnapshot] - G_Snapshot;
        uint256 secondPortion = epochToScaleToG[epochSnapshot][scaleSnapshot + 1] / SCALE_FACTOR;

        uint256 TRENGain =
            (_initialStake * (firstPortion + secondPortion)) / P_Snapshot / DECIMAL_PRECISION;

        return TRENGain;
    }

    // --- Compounded deposit and compounded System stake ---

    /**
     * @dev Calculates the compounded deposits and compounded stakes.
     * @param _initialStake The amount of initial stake.
     * @param _snapshots The snapshot storage.
     */
    function _getCompoundedStakeFromSnapshots(
        uint256 _initialStake,
        Snapshots storage _snapshots
    )
        internal
        view
        returns (uint256)
    {
        uint256 snapshot_P = _snapshots.P;
        uint128 scaleSnapshot = _snapshots.scale;
        uint128 epochSnapshot = _snapshots.epoch;

        // If stake was made before a pool-emptying event, then it has been fully cancelled with
        // debt -- so, return 0
        if (epochSnapshot < currentEpoch) {
            return 0;
        }

        uint256 compoundedStake;
        uint128 scaleDiff = currentScale - scaleSnapshot;

        /* Compute the compounded stake. If a scale change in P was made during the stake's
        lifetime,
        * account for it. If more than one scale change was made, then the stake has decreased by a
        factor of
         * at least 1e-9 -- so return 0.
         */
        if (scaleDiff == 0) {
            compoundedStake = (_initialStake * P) / snapshot_P;
        } else if (scaleDiff == 1) {
            compoundedStake = (_initialStake * P) / snapshot_P / SCALE_FACTOR;
        } else {
            compoundedStake = 0;
        }

        /*
         * If compounded deposit is less than a billionth of the initial deposit, return 0.
         *
        * NOTE: originally, this line was in place to stop rounding errors making the deposit too
        large. However, the error
        * corrections should ensure the error in P "favors the Pool", i.e. any given compounded
        deposit should slightly less
         * than it's theoretical value.
         *
         * Thus it's unclear whether this line is still really needed.
         */
        if (compoundedStake < _initialStake / 1e9) {
            return 0;
        }

        return compoundedStake;
    }

    // --- Sender functions for debtToken deposits

    /**
     * @dev Transfers the tokens from the user to the Stability Pool, and update its
     * recorded deposits.
     * @param _address The depositor address.
     * @param _amount The deposit amount.
     */
    function _sendToStabilityPool(address _address, uint256 _amount) internal {
        IDebtToken(debtToken).sendToPool(_address, address(this), _amount);
        uint256 newTotalDeposits = totalDebtTokenDeposits + _amount;
        totalDebtTokenDeposits = newTotalDeposits;
        emit StabilityPoolDebtTokenBalanceUpdated(newTotalDeposits);
    }

    /**
     * @dev Transfers collateral gains to the depositor. This function also unwraps wrapped assets
     * before sending to depositor.
     * @param _to The depositor address to receive gains.
     * @param _assets The address array of collateral assets.
     * @param _amounts The amount array of collateral assets.
     */
    function _sendGainsToDepositor(
        address _to,
        address[] memory _assets,
        uint256[] memory _amounts
    )
        internal
    {
        uint256 assetsLen = _assets.length;

        if (assetsLen != _amounts.length) {
            revert StabilityPool__AssetsAndAmountsLengthMismatch();
        }

        for (uint256 i = 0; i < assetsLen;) {
            uint256 amount = _amounts[i];
            if (amount == 0) {
                unchecked {
                    ++i;
                }
                continue;
            }
            address asset = _assets[i];
            // Assumes we're internally working only with the wrapped version of ERC20 tokens
            IERC20(asset).safeTransfer(_to, amount);
            unchecked {
                ++i;
            }
        }
        totalColl.amounts = _leftSubColls(totalColl, _assets, _amounts);
    }

    /**
     * @dev Sends debt tokens to user and decrease deposits in Pool.
     * @param _depositor The depositor address.
     * @param _debtTokenWithdrawal The amount of debt tokens to withdraw.
     */
    function _sendToDepositor(address _depositor, uint256 _debtTokenWithdrawal) internal {
        if (_debtTokenWithdrawal == 0) {
            return;
        }
        IDebtToken(debtToken).returnFromPool(address(this), _depositor, _debtTokenWithdrawal);
        _decreaseDebtTokens(_debtTokenWithdrawal);
    }

    // --- Stability Pool Deposit Functionality ---

    /**
     * @dev Updates deposit and snapshots internally.
     * if _newValue is zero, delete snapshot for given _depositor and emit event
     * otherwise, add an entry or update existing entry for _depositor in the depositSnapshots
     * with current values for P, S, G, scale and epoch and then emit event.
     * @param _depositor The depositor address
     * @param _newValue The new deposit amount.
     */
    function _updateDepositAndSnapshots(address _depositor, uint256 _newValue) internal {
        deposits[_depositor] = _newValue;
        address[] memory colls = IAdminContract(adminContract).getValidCollateral();
        uint256 collsLen = colls.length;

        Snapshots storage depositorSnapshots = depositSnapshots[_depositor];
        if (_newValue == 0) {
            for (uint256 i = 0; i < collsLen;) {
                depositSnapshots[_depositor].S[colls[i]] = 0;
                unchecked {
                    i++;
                }
            }
            depositorSnapshots.P = 0;
            depositorSnapshots.G = 0;
            depositorSnapshots.epoch = 0;
            depositorSnapshots.scale = 0;
            emit DepositSnapshotUpdated(_depositor, 0, 0);
            return;
        }
        uint128 currentScaleCached = currentScale;
        uint128 currentEpochCached = currentEpoch;
        uint256 currentP = P;

        for (uint256 i = 0; i < collsLen;) {
            address asset = colls[i];
            uint256 currentS = epochToScaleToSum[asset][currentEpochCached][currentScaleCached];
            depositSnapshots[_depositor].S[asset] = currentS;
            unchecked {
                ++i;
            }
        }

        uint256 currentG = epochToScaleToG[currentEpochCached][currentScaleCached];
        depositorSnapshots.P = currentP;
        depositorSnapshots.G = currentG;
        depositorSnapshots.scale = currentScaleCached;
        depositorSnapshots.epoch = currentEpochCached;

        emit DepositSnapshotUpdated(_depositor, currentP, currentG);
    }

    /**
     * @dev Pays out the TREN gains to the specific depositor.
     * @param _depositor The depositor address.
     */
    function _payOutTRENGains(address _depositor) internal {
        if (address(communityIssuance) != address(0)) {
            uint256 depositorTRENGain = getDepositorTRENGain(_depositor);
            ICommunityIssuance(communityIssuance).sendTREN(_depositor, depositorTRENGain);
            emit TRENPaidToDepositor(_depositor, depositorTRENGain);
        }
    }

    /**
     * @dev Returns the collateral balances left after sending gains to the depositors.
     * @param _coll1 The total collateral before sending.
     * @param _tokens The address array of collateral assets to send.
     * @param _amounts The amount array of collateral assets to send.
     */
    function _leftSubColls(
        Colls memory _coll1,
        address[] memory _tokens,
        uint256[] memory _amounts
    )
        internal
        pure
        returns (uint256[] memory)
    {
        uint256 coll1Len = _coll1.amounts.length;
        uint256 tokensLen = _tokens.length;

        for (uint256 i = 0; i < coll1Len;) {
            for (uint256 j = 0; j < tokensLen;) {
                if (_coll1.tokens[i] == _tokens[j]) {
                    _coll1.amounts[i] -= _amounts[j];
                }
                unchecked {
                    ++j;
                }
            }
            unchecked {
                ++i;
            }
        }

        return _coll1.amounts;
    }

    /**
     * @dev Requires that a user has an initial deposit.
     * @param _initialDeposit The amount of initial deposit.
     */
    function _requireUserHasDeposit(uint256 _initialDeposit) internal pure {
        if (_initialDeposit == 0) {
            revert StabilityPool__UserHasNoDeposit();
        }
    }

    /**
     * @dev Requires that the amount is not zero.
     * @param _amount The amount.
     */
    function _requireNonZeroAmount(uint256 _amount) internal pure {
        if (_amount == 0) {
            revert StabilityPool__AmountMustBeNonZero();
        }
    }

    // --- Fallback function ---

    /**
     * @notice Receives the specific collateral amount from TrenBoxStorage contract.
     * @param _asset The address of collateral asset.
     * @param _amount The amount of collateral asset.
     */
    function receivedERC20(address _asset, uint256 _amount) external override onlyTrenBoxStorage {
        uint256 collateralIndex = IAdminContract(adminContract).getIndex(_asset);
        uint256 newAssetBalance = totalColl.amounts[collateralIndex] + _amount;
        totalColl.amounts[collateralIndex] = newAssetBalance;
        emit StabilityPoolAssetBalanceUpdated(_asset, newAssetBalance);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
