// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { TrenBase } from "./Dependencies/TrenBase.sol";
import { TrenMath } from "./Dependencies/TrenMath.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IActivePool } from "./Interfaces/IActivePool.sol";
import { ICollSurplusPool } from "./Interfaces/ICollSurplusPool.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { IPriceFeed } from "./Interfaces/IPriceFeed.sol";
import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { ITrenBoxManagerOperations } from "./Interfaces/ITrenBoxManagerOperations.sol";

contract TrenBoxManagerOperations is
    ITrenBoxManagerOperations,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    TrenBase
{
    string public constant NAME = "TrenBoxManagerOperations";
    uint256 public constant PERCENTAGE_PRECISION = 10_000;
    uint256 public constant BATCH_SIZE_LIMIT = 25;

    uint256 public redemptionSofteningParam;

    // Structs
    // ----------------------------------------------------------------------------------------------------------

    struct HintHelperLocalVars {
        address asset;
        uint256 debtTokenAmount;
        uint256 price;
        uint256 maxIterations;
    }

    // Initializer
    // ------------------------------------------------------------------------------------------------------

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    // Liquidation external functions
    // -----------------------------------------------------------------------------------

    /*
    * Single liquidation function. Closes the trenBox if its ICR is lower than the minimum
    collateral
    ratio.
     */
    function liquidate(address _asset, address _borrower) external override {
        if (!ITrenBoxManager(trenBoxManager).isTrenBoxActive(_asset, _borrower)) {
            revert TrenBoxManagerOperations__TrenBoxNotActive();
        }
        address[] memory borrowers = new address[](1);
        borrowers[0] = _borrower;
        batchLiquidateTrenBoxes(_asset, borrowers);
    }

    /*
    * Liquidate a sequence of trenBoxes. Closes a maximum number of n under-collateralized
    TrenBoxes,
     * starting from the one with the lowest collateral ratio in the system, and moving upwards.
     */
    function liquidateTrenBoxes(address _asset, uint256 _n) external override nonReentrant {
        LocalVariables_OuterLiquidationFunction memory vars;
        LiquidationTotals memory totals;
        vars.price = IPriceFeed(priceFeed).fetchPrice(_asset);
        vars.debtTokenInStabPool = IStabilityPool(stabilityPool).getTotalDebtTokenDeposits();
        vars.recoveryModeAtStart = _checkRecoveryMode(_asset, vars.price);

        // Perform the appropriate liquidation sequence - tally the values, and obtain their totals
        if (vars.recoveryModeAtStart) {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(
                _asset, vars.price, vars.debtTokenInStabPool, _n
            );
        } else {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_NormalMode(
                _asset, vars.price, vars.debtTokenInStabPool, _n
            );
        }

        if (totals.totalDebtInSequence == 0) {
            revert TrenBoxManagerOperations__NothingToLiquidate();
        }

        ITrenBoxManager(trenBoxManager).redistributeDebtAndColl(
            _asset,
            totals.totalDebtToRedistribute,
            totals.totalCollToRedistribute,
            totals.totalDebtToOffset,
            totals.totalCollToSendToSP
        );
        if (totals.totalCollSurplus != 0) {
            IActivePool(activePool).sendAsset(_asset, collSurplusPool, totals.totalCollSurplus);
        }

        ITrenBoxManager(trenBoxManager).updateSystemSnapshots_excludeCollRemainder(
            _asset, totals.totalCollGasCompensation
        );

        vars.liquidatedDebt = totals.totalDebtInSequence;
        vars.liquidatedColl =
            totals.totalCollInSequence - totals.totalCollGasCompensation - totals.totalCollSurplus;
        emit Liquidation(
            _asset,
            vars.liquidatedDebt,
            vars.liquidatedColl,
            totals.totalCollGasCompensation,
            totals.totalDebtTokenGasCompensation
        );
        ITrenBoxManager(trenBoxManager).sendGasCompensation(
            _asset,
            msg.sender,
            totals.totalDebtTokenGasCompensation,
            totals.totalCollGasCompensation
        );
    }

    /*
     * Attempt to liquidate a custom list of trenBoxes provided by the caller.
     */
    function batchLiquidateTrenBoxes(
        address _asset,
        address[] memory _trenBoxArray
    )
        public
        override
        nonReentrant
    {
        if (_trenBoxArray.length == 0 || _trenBoxArray.length > BATCH_SIZE_LIMIT) {
            revert TrenBoxManagerOperations__InvalidArraySize();
        }

        LocalVariables_OuterLiquidationFunction memory vars;
        LiquidationTotals memory totals;

        vars.debtTokenInStabPool = IStabilityPool(stabilityPool).getTotalDebtTokenDeposits();
        vars.price = IPriceFeed(priceFeed).fetchPrice(_asset);
        vars.recoveryModeAtStart = _checkRecoveryMode(_asset, vars.price);

        // Perform the appropriate liquidation sequence - tally values and obtain their totals.
        if (vars.recoveryModeAtStart) {
            totals = _getTotalFromBatchLiquidate_RecoveryMode(
                _asset, vars.price, vars.debtTokenInStabPool, _trenBoxArray
            );
        } else {
            totals = _getTotalsFromBatchLiquidate_NormalMode(
                _asset, vars.price, vars.debtTokenInStabPool, _trenBoxArray
            );
        }

        if (totals.totalDebtInSequence == 0) {
            revert TrenBoxManagerOperations__NothingToLiquidate();
        }

        ITrenBoxManager(trenBoxManager).redistributeDebtAndColl(
            _asset,
            totals.totalDebtToRedistribute,
            totals.totalCollToRedistribute,
            totals.totalDebtToOffset,
            totals.totalCollToSendToSP
        );
        if (totals.totalCollSurplus != 0) {
            IActivePool(activePool).sendAsset(_asset, collSurplusPool, totals.totalCollSurplus);
        }

        // Update system snapshots
        ITrenBoxManager(trenBoxManager).updateSystemSnapshots_excludeCollRemainder(
            _asset, totals.totalCollGasCompensation
        );

        vars.liquidatedDebt = totals.totalDebtInSequence;
        vars.liquidatedColl =
            totals.totalCollInSequence - totals.totalCollGasCompensation - totals.totalCollSurplus;
        emit Liquidation(
            _asset,
            vars.liquidatedDebt,
            vars.liquidatedColl,
            totals.totalCollGasCompensation,
            totals.totalDebtTokenGasCompensation
        );
        ITrenBoxManager(trenBoxManager).sendGasCompensation(
            _asset,
            msg.sender,
            totals.totalDebtTokenGasCompensation,
            totals.totalCollGasCompensation
        );
    }

    // Redemption external functions
    // ------------------------------------------------------------------------------------

    function redeemCollateral(
        address _asset,
        uint256 _debtTokenAmount,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        address _firstRedemptionHint,
        uint256 _partialRedemptionHintNICR,
        uint256 _maxIterations,
        uint256 _maxFeePercentage
    )
        external
        override
    {
        RedemptionTotals memory totals;
        totals.price = IPriceFeed(priceFeed).fetchPrice(_asset);
        _validateRedemptionRequirements(_asset, _maxFeePercentage, _debtTokenAmount, totals.price);
        totals.totalDebtTokenSupplyAtStart = getEntireSystemDebt(_asset);
        totals.remainingDebt = _debtTokenAmount;
        address currentBorrower;
        if (
            ITrenBoxManager(trenBoxManager).isValidFirstRedemptionHint(
                _asset, _firstRedemptionHint, totals.price
            )
        ) {
            currentBorrower = _firstRedemptionHint;
        } else {
            currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getLast(_asset);
            // Find the first trenBox with ICR >= MCR
            while (
                currentBorrower != address(0)
                    && ITrenBoxManager(trenBoxManager).getCurrentICR(
                        _asset, currentBorrower, totals.price
                    ) < IAdminContract(adminContract).getMcr(_asset)
            ) {
                currentBorrower = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset, currentBorrower);
            }
        }

        // Loop through the trenBoxes starting from the one with lowest collateral ratio until
        // _debtTokenAmount is exchanged for collateral
        if (_maxIterations == 0) {
            _maxIterations = type(uint256).max;
        }
        while (currentBorrower != address(0) && totals.remainingDebt != 0 && _maxIterations != 0) {
            _maxIterations--;
            // Save the address of the trenBox preceding the current one, before potentially
            // modifying the list
            address nextUserToCheck =
                ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset, currentBorrower);

            ITrenBoxManager(trenBoxManager).applyPendingRewards(_asset, currentBorrower);

            SingleRedemptionValues memory singleRedemption = _redeemCollateralFromTrenBox(
                _asset,
                currentBorrower,
                totals.remainingDebt,
                totals.price,
                _upperPartialRedemptionHint,
                _lowerPartialRedemptionHint,
                _partialRedemptionHintNICR
            );

            if (singleRedemption.cancelledPartial) break; // Partial redemption was cancelled
                // (out-of-date hint, or new net debt < minimum), therefore we could not redeem from
                // the last trenBox

            totals.totalDebtToRedeem = totals.totalDebtToRedeem + singleRedemption.debtLot;
            totals.totalCollDrawn = totals.totalCollDrawn + singleRedemption.collLot;

            totals.remainingDebt = totals.remainingDebt - singleRedemption.debtLot;
            currentBorrower = nextUserToCheck;
        }
        if (totals.totalCollDrawn == 0) {
            revert TrenBoxManagerOperations__UnableToRedeemAnyAmount();
        }

        // Decay the baseRate due to time passed, and then increase it according to the size of this
        // redemption.
        // Use the saved total GRAI supply value, from before it was reduced by the redemption.
        ITrenBoxManager(trenBoxManager).updateBaseRateFromRedemption(
            _asset, totals.totalCollDrawn, totals.price, totals.totalDebtTokenSupplyAtStart
        );

        // Calculate the collateral fee
        totals.collFee =
            ITrenBoxManager(trenBoxManager).getRedemptionFee(_asset, totals.totalCollDrawn);

        _requireUserAcceptsFee(totals.collFee, totals.totalCollDrawn, _maxFeePercentage);

        ITrenBoxManager(trenBoxManager).finalizeRedemption(
            _asset, msg.sender, totals.totalDebtToRedeem, totals.collFee, totals.totalCollDrawn
        );

        emit Redemption(
            _asset,
            _debtTokenAmount,
            totals.totalDebtToRedeem,
            totals.totalCollDrawn,
            totals.collFee
        );
    }

    // Hint helper functions
    // --------------------------------------------------------------------------------------------

    /* getRedemptionHints() - Helper function for finding the right hints to pass to
    redeemCollateral().
     *
    * It simulates a redemption of `_debtTokenAmount` to figure out where the redemption sequence
    will start and what state the final TrenBox
     * of the sequence will end up in.
     *
     * Returns three hints:
    *  - `firstRedemptionHint` is the address of the first TrenBox with ICR >= MCR (i.e. the first
    TrenBox that will be redeemed).
    *  - `partialRedemptionHintNICR` is the final nominal ICR of the last TrenBox of the sequence
    after being hit by partial redemption,
     *     or zero in case of no partial redemption.
    *  - `truncatedDebtTokenAmount` is the maximum amount that can be redeemed out of the the
    provided `_debtTokenAmount`. This can be lower than
    *    `_debtTokenAmount` when redeeming the full amount would leave the last TrenBox of the
    redemption sequence with less net debt than the
     *    minimum allowed value (i.e. IAdminContract(adminContract).MIN_NET_DEBT()).
     *
    * The number of TrenBoxes to consider for redemption can be capped by passing a non-zero value
    as
    `_maxIterations`, while passing zero
     * will leave it uncapped.
     */

    function getRedemptionHints(
        address _asset,
        uint256 _debtTokenAmount,
        uint256 _price,
        uint256 _maxIterations
    )
        external
        view
        override
        returns (
            address firstRedemptionHint,
            uint256 partialRedemptionHintNewICR,
            uint256 truncatedDebtTokenAmount
        )
    {
        HintHelperLocalVars memory vars = HintHelperLocalVars({
            asset: _asset,
            debtTokenAmount: _debtTokenAmount,
            price: _price,
            maxIterations: _maxIterations
        });

        uint256 remainingDebt = _debtTokenAmount;
        address currentTrenBoxBorrower = ISortedTrenBoxes(sortedTrenBoxes).getLast(vars.asset);

        while (
            currentTrenBoxBorrower != address(0)
                && ITrenBoxManager(trenBoxManager).getCurrentICR(
                    vars.asset, currentTrenBoxBorrower, vars.price
                ) < IAdminContract(adminContract).getMcr(vars.asset)
        ) {
            currentTrenBoxBorrower =
                ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset, currentTrenBoxBorrower);
        }

        firstRedemptionHint = currentTrenBoxBorrower;

        if (vars.maxIterations == 0) {
            vars.maxIterations = type(uint256).max;
        }

        while (
            currentTrenBoxBorrower != address(0) && remainingDebt != 0 && vars.maxIterations-- != 0
        ) {
            uint256 currentTrenBoxNetDebt = _getNetDebt(
                vars.asset,
                ITrenBoxManager(trenBoxManager).getTrenBoxDebt(vars.asset, currentTrenBoxBorrower)
                    + ITrenBoxManager(trenBoxManager).getPendingDebtTokenReward(
                        vars.asset, currentTrenBoxBorrower
                    )
            );

            if (currentTrenBoxNetDebt <= remainingDebt) {
                remainingDebt = remainingDebt - currentTrenBoxNetDebt;
            } else {
                if (currentTrenBoxNetDebt > IAdminContract(adminContract).getMinNetDebt(vars.asset))
                {
                    uint256 maxRedeemableDebt = TrenMath._min(
                        remainingDebt,
                        currentTrenBoxNetDebt
                            - IAdminContract(adminContract).getMinNetDebt(vars.asset)
                    );
                    uint256 currentTrenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(
                        vars.asset, currentTrenBoxBorrower
                    )
                        + ITrenBoxManager(trenBoxManager).getPendingAssetReward(
                            vars.asset, currentTrenBoxBorrower
                        );

                    uint256 collLot = (maxRedeemableDebt * DECIMAL_PRECISION) / vars.price;
                    // Apply redemption softening
                    collLot = (collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION;
                    uint256 newColl = currentTrenBoxColl - collLot;
                    uint256 newDebt = currentTrenBoxNetDebt - maxRedeemableDebt;
                    uint256 compositeDebt = _getCompositeDebt(vars.asset, newDebt);

                    partialRedemptionHintNewICR = TrenMath._computeNominalCR(newColl, compositeDebt);
                    remainingDebt = remainingDebt - maxRedeemableDebt;
                }

                break;
            }

            currentTrenBoxBorrower =
                ISortedTrenBoxes(sortedTrenBoxes).getPrev(vars.asset, currentTrenBoxBorrower);
        }

        truncatedDebtTokenAmount = _debtTokenAmount - remainingDebt;
    }

    /* getApproxHint() - return address of a TrenBox that is, on average, (length / numTrials)
    positions away in the
    sortedTrenBoxes list from the correct insert position of the TrenBox to be inserted.

    Note: The output address is worst-case O(n) positions away from the correct insert position,
    however, the function
    is probabilistic. Input can be tuned to guarantee results to a high degree of confidence, e.g:

    Submitting numTrials = k * sqrt(length), with k = 15 makes it very, very likely that the ouput
    address will
    be <= sqrt(length) positions away from the correct insert position.
    */
    function getApproxHint(
        address _asset,
        uint256 _CR,
        uint256 _numTrials,
        uint256 _inputRandomSeed
    )
        external
        view
        override
        returns (address hintAddress, uint256 diff, uint256 latestRandomSeed)
    {
        uint256 arrayLength = ITrenBoxManager(trenBoxManager).getTrenBoxOwnersCount(_asset);

        if (arrayLength == 0) {
            return (address(0), 0, _inputRandomSeed);
        }

        hintAddress = ISortedTrenBoxes(sortedTrenBoxes).getLast(_asset);
        diff = TrenMath._getAbsoluteDifference(
            _CR, ITrenBoxManager(trenBoxManager).getNominalICR(_asset, hintAddress)
        );
        latestRandomSeed = _inputRandomSeed;

        uint256 i = 1;

        while (i < _numTrials) {
            latestRandomSeed = uint256(keccak256(abi.encodePacked(latestRandomSeed)));

            uint256 arrayIndex = latestRandomSeed % arrayLength;
            address currentAddress =
                ITrenBoxManager(trenBoxManager).getTrenBoxFromTrenBoxOwnersArray(_asset, arrayIndex);
            uint256 currentNICR =
                ITrenBoxManager(trenBoxManager).getNominalICR(_asset, currentAddress);

            // check if abs(current - CR) > abs(closest - CR), and update closest if current is
            // closer
            uint256 currentDiff = TrenMath._getAbsoluteDifference(currentNICR, _CR);

            if (currentDiff < diff) {
                diff = currentDiff;
                hintAddress = currentAddress;
            }
            i++;
        }
    }

    function computeNominalCR(
        uint256 _coll,
        uint256 _debt
    )
        external
        pure
        override
        returns (uint256)
    {
        return TrenMath._computeNominalCR(_coll, _debt);
    }

    // Liquidation internal/helper functions
    // ----------------------------------------------------------------------------

    /*
    * This function is used when the batch liquidation sequence starts during Recovery Mode. However,
    it
    * handles the case where the system *leaves* Recovery Mode, part way through the liquidation
    sequence
     */
    function _getTotalFromBatchLiquidate_RecoveryMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        address[] memory _trenBoxArray
    )
        internal
        returns (LiquidationTotals memory totals)
    {
        LocalVariables_LiquidationSequence memory vars;
        LiquidationValues memory singleLiquidation;
        vars.remainingDebtTokenInStabPool = _debtTokenInStabPool;
        vars.backToNormalMode = false;
        vars.entireSystemDebt = getEntireSystemDebt(_asset);
        vars.entireSystemColl = getEntireSystemColl(_asset);

        for (uint256 i = 0; i < _trenBoxArray.length;) {
            vars.user = _trenBoxArray[i];
            // Skip non-active trenBoxes
            if (
                ITrenBoxManager(trenBoxManager).getTrenBoxStatus(_asset, vars.user)
                    != uint256(ITrenBoxManager.Status.active)
            ) {
                unchecked {
                    ++i;
                }
                continue;
            }
            vars.ICR = ITrenBoxManager(trenBoxManager).getCurrentICR(_asset, vars.user, _price);

            if (!vars.backToNormalMode) {
                // Skip this trenBox if ICR is greater than MCR and Stability Pool is empty
                if (
                    vars.ICR >= IAdminContract(adminContract).getMcr(_asset)
                        && vars.remainingDebtTokenInStabPool == 0
                ) {
                    unchecked {
                        ++i;
                    }
                    continue;
                }
                uint256 TCR =
                    TrenMath._computeCR(vars.entireSystemColl, vars.entireSystemDebt, _price);

                singleLiquidation = _liquidateRecoveryMode(
                    _asset, vars.user, vars.ICR, vars.remainingDebtTokenInStabPool, TCR, _price
                );

                // Update aggregate trackers
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;
                vars.entireSystemDebt = vars.entireSystemDebt - singleLiquidation.debtToOffset;
                vars.entireSystemColl = vars.entireSystemColl - singleLiquidation.collToSendToSP
                    - singleLiquidation.collGasCompensation - singleLiquidation.collSurplus;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);

                vars.backToNormalMode = !_checkPotentialRecoveryMode(
                    _asset, vars.entireSystemColl, vars.entireSystemDebt, _price
                );
            } else if (
                vars.backToNormalMode && vars.ICR < IAdminContract(adminContract).getMcr(_asset)
            ) {
                singleLiquidation =
                    _liquidateNormalMode(_asset, vars.user, vars.remainingDebtTokenInStabPool);
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);
            }
            unchecked {
                ++i;
            }
        }
    }

    function _getTotalsFromBatchLiquidate_NormalMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        address[] memory _trenBoxArray
    )
        internal
        returns (LiquidationTotals memory totals)
    {
        LocalVariables_LiquidationSequence memory vars;
        LiquidationValues memory singleLiquidation;

        vars.remainingDebtTokenInStabPool = _debtTokenInStabPool;

        for (uint256 i = 0; i < _trenBoxArray.length;) {
            vars.user = _trenBoxArray[i];
            vars.ICR = ITrenBoxManager(trenBoxManager).getCurrentICR(_asset, vars.user, _price);

            if (vars.ICR < IAdminContract(adminContract).getMcr(_asset)) {
                singleLiquidation =
                    _liquidateNormalMode(_asset, vars.user, vars.remainingDebtTokenInStabPool);
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);
            }
            unchecked {
                ++i;
            }
        }
    }

    function _addLiquidationValuesToTotals(
        LiquidationTotals memory oldTotals,
        LiquidationValues memory singleLiquidation
    )
        internal
        pure
        returns (LiquidationTotals memory newTotals)
    {
        // Tally all the values with their respective running totals
        newTotals.totalCollGasCompensation =
            oldTotals.totalCollGasCompensation + singleLiquidation.collGasCompensation;
        newTotals.totalDebtTokenGasCompensation =
            oldTotals.totalDebtTokenGasCompensation + singleLiquidation.debtTokenGasCompensation;
        newTotals.totalDebtInSequence =
            oldTotals.totalDebtInSequence + singleLiquidation.entireTrenBoxDebt;
        newTotals.totalCollInSequence =
            oldTotals.totalCollInSequence + singleLiquidation.entireTrenBoxColl;
        newTotals.totalDebtToOffset = oldTotals.totalDebtToOffset + singleLiquidation.debtToOffset;
        newTotals.totalCollToSendToSP =
            oldTotals.totalCollToSendToSP + singleLiquidation.collToSendToSP;
        newTotals.totalDebtToRedistribute =
            oldTotals.totalDebtToRedistribute + singleLiquidation.debtToRedistribute;
        newTotals.totalCollToRedistribute =
            oldTotals.totalCollToRedistribute + singleLiquidation.collToRedistribute;
        newTotals.totalCollSurplus = oldTotals.totalCollSurplus + singleLiquidation.collSurplus;
        return newTotals;
    }

    function _getTotalsFromLiquidateTrenBoxesSequence_NormalMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        uint256 _n
    )
        internal
        returns (LiquidationTotals memory totals)
    {
        LocalVariables_LiquidationSequence memory vars;
        LiquidationValues memory singleLiquidation;

        vars.remainingDebtTokenInStabPool = _debtTokenInStabPool;

        for (uint256 i = 0; i < _n;) {
            vars.user = ISortedTrenBoxes(sortedTrenBoxes).getLast(_asset);
            vars.ICR = ITrenBoxManager(trenBoxManager).getCurrentICR(_asset, vars.user, _price);

            if (vars.ICR < IAdminContract(adminContract).getMcr(_asset)) {
                singleLiquidation =
                    _liquidateNormalMode(_asset, vars.user, vars.remainingDebtTokenInStabPool);

                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);
            } else {
                break;
            } // break if the loop reaches a TrenBox with ICR >= MCR
            unchecked {
                ++i;
            }
        }
    }

    function _liquidateNormalMode(
        address _asset,
        address _borrower,
        uint256 _debtTokenInStabPool
    )
        internal
        returns (LiquidationValues memory singleLiquidation)
    {
        LocalVariables_InnerSingleLiquidateFunction memory vars;
        (
            singleLiquidation.entireTrenBoxDebt,
            singleLiquidation.entireTrenBoxColl,
            vars.pendingDebtReward,
            vars.pendingCollReward
        ) = ITrenBoxManager(trenBoxManager).getEntireDebtAndColl(_asset, _borrower);

        ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(
            _asset, vars.pendingDebtReward, vars.pendingCollReward
        );
        ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);

        singleLiquidation.collGasCompensation =
            _getCollGasCompensation(_asset, singleLiquidation.entireTrenBoxColl);
        singleLiquidation.debtTokenGasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
        uint256 collToLiquidate =
            singleLiquidation.entireTrenBoxColl - singleLiquidation.collGasCompensation;

        (
            singleLiquidation.debtToOffset,
            singleLiquidation.collToSendToSP,
            singleLiquidation.debtToRedistribute,
            singleLiquidation.collToRedistribute
        ) = _getOffsetAndRedistributionVals(
            singleLiquidation.entireTrenBoxDebt, collToLiquidate, _debtTokenInStabPool
        );

        ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
        emit TrenBoxLiquidated(
            _asset,
            _borrower,
            singleLiquidation.entireTrenBoxDebt,
            singleLiquidation.entireTrenBoxColl,
            ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode
        );
        return singleLiquidation;
    }

    function _liquidateRecoveryMode(
        address _asset,
        address _borrower,
        uint256 _ICR,
        uint256 _debtTokenInStabPool,
        uint256 _TCR,
        uint256 _price
    )
        internal
        returns (LiquidationValues memory singleLiquidation)
    {
        LocalVariables_InnerSingleLiquidateFunction memory vars;
        if (ITrenBoxManager(trenBoxManager).getTrenBoxOwnersCount(_asset) <= 1) {
            return singleLiquidation;
        } // don't liquidate if last trenBox
        (
            singleLiquidation.entireTrenBoxDebt,
            singleLiquidation.entireTrenBoxColl,
            vars.pendingDebtReward,
            vars.pendingCollReward
        ) = ITrenBoxManager(trenBoxManager).getEntireDebtAndColl(_asset, _borrower);

        singleLiquidation.collGasCompensation =
            _getCollGasCompensation(_asset, singleLiquidation.entireTrenBoxColl);
        singleLiquidation.debtTokenGasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
        vars.collToLiquidate =
            singleLiquidation.entireTrenBoxColl - singleLiquidation.collGasCompensation;

        // If ICR <= 100%, purely redistribute the TrenBox across all active TrenBoxes
        if (_ICR <= IAdminContract(adminContract)._100pct()) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(
                _asset, vars.pendingDebtReward, vars.pendingCollReward
            );
            ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);

            singleLiquidation.debtToOffset = 0;
            singleLiquidation.collToSendToSP = 0;
            singleLiquidation.debtToRedistribute = singleLiquidation.entireTrenBoxDebt;
            singleLiquidation.collToRedistribute = vars.collToLiquidate;

            ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
            emit TrenBoxLiquidated(
                _asset,
                _borrower,
                singleLiquidation.entireTrenBoxDebt,
                singleLiquidation.entireTrenBoxColl,
                ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode
            );

            // If 100% < ICR < MCR, offset as much as possible, and redistribute the remainder
        } else if (
            (_ICR > IAdminContract(adminContract)._100pct())
                && (_ICR < IAdminContract(adminContract).getMcr(_asset))
        ) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(
                _asset, vars.pendingDebtReward, vars.pendingCollReward
            );
            ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);

            (
                singleLiquidation.debtToOffset,
                singleLiquidation.collToSendToSP,
                singleLiquidation.debtToRedistribute,
                singleLiquidation.collToRedistribute
            ) = _getOffsetAndRedistributionVals(
                singleLiquidation.entireTrenBoxDebt, vars.collToLiquidate, _debtTokenInStabPool
            );

            ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
            emit TrenBoxLiquidated(
                _asset,
                _borrower,
                singleLiquidation.entireTrenBoxDebt,
                singleLiquidation.entireTrenBoxColl,
                ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode
            );

            /*
            * If 110% <= ICR < current TCR (accounting for the preceding liquidations in the current
            sequence)
            * and there are debt tokens in the Stability Pool, only offset, with no redistribution,
             * but at a capped rate of 1.1 and only if the whole debt can be liquidated.
            * The remainder due to the capped rate will be claimable as collateral surplus.
             */
        } else if (
            (_ICR >= IAdminContract(adminContract).getMcr(_asset)) && (_ICR < _TCR)
                && (singleLiquidation.entireTrenBoxDebt <= _debtTokenInStabPool)
        ) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsToActivePool(
                _asset, vars.pendingDebtReward, vars.pendingCollReward
            );
            assert(_debtTokenInStabPool != 0);

            ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);
            singleLiquidation = _getCappedOffsetVals(
                _asset,
                singleLiquidation.entireTrenBoxDebt,
                singleLiquidation.entireTrenBoxColl,
                _price
            );

            ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
            if (singleLiquidation.collSurplus != 0) {
                ICollSurplusPool(collSurplusPool).accountSurplus(
                    _asset, _borrower, singleLiquidation.collSurplus
                );
            }
            emit TrenBoxLiquidated(
                _asset,
                _borrower,
                singleLiquidation.entireTrenBoxDebt,
                singleLiquidation.collToSendToSP,
                ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode
            );
        } else {
            // if (_ICR >= MCR && ( _ICR >= _TCR || singleLiquidation.entireTrenBoxDebt >
            // _debtTokenInStabPool))
            LiquidationValues memory zeroVals;
            return zeroVals;
        }

        return singleLiquidation;
    }

    /*
    * This function is used when the liquidateTrenBoxes sequence starts during Recovery Mode.
    However,
    it
    * handles the case where the system *leaves* Recovery Mode, part way through the liquidation
    sequence
     */
    function _getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        uint256 _n
    )
        internal
        returns (LiquidationTotals memory totals)
    {
        LocalVariables_LiquidationSequence memory vars;
        LiquidationValues memory singleLiquidation;

        vars.remainingDebtTokenInStabPool = _debtTokenInStabPool;
        vars.backToNormalMode = false;
        vars.entireSystemDebt = getEntireSystemDebt(_asset);
        vars.entireSystemColl = getEntireSystemColl(_asset);

        vars.user = ISortedTrenBoxes(sortedTrenBoxes).getLast(_asset);
        address firstUser = ISortedTrenBoxes(sortedTrenBoxes).getFirst(_asset);
        for (uint256 i = 0; i < _n && vars.user != firstUser;) {
            // we need to cache it, because current user is likely going to be deleted
            address nextUser = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset, vars.user);

            vars.ICR = ITrenBoxManager(trenBoxManager).getCurrentICR(_asset, vars.user, _price);

            if (!vars.backToNormalMode) {
                // Break the loop if ICR is greater than MCR and Stability Pool is empty
                if (
                    vars.ICR >= IAdminContract(adminContract).getMcr(_asset)
                        && vars.remainingDebtTokenInStabPool == 0
                ) {
                    break;
                }

                uint256 TCR =
                    TrenMath._computeCR(vars.entireSystemColl, vars.entireSystemDebt, _price);

                singleLiquidation = _liquidateRecoveryMode(
                    _asset, vars.user, vars.ICR, vars.remainingDebtTokenInStabPool, TCR, _price
                );

                // Update aggregate trackers
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;
                vars.entireSystemDebt = vars.entireSystemDebt - singleLiquidation.debtToOffset;
                vars.entireSystemColl = vars.entireSystemColl - singleLiquidation.collToSendToSP
                    - singleLiquidation.collGasCompensation - singleLiquidation.collSurplus;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);

                vars.backToNormalMode = !_checkPotentialRecoveryMode(
                    _asset, vars.entireSystemColl, vars.entireSystemDebt, _price
                );
            } else if (
                vars.backToNormalMode && vars.ICR < IAdminContract(adminContract).getMcr(_asset)
            ) {
                singleLiquidation =
                    _liquidateNormalMode(_asset, vars.user, vars.remainingDebtTokenInStabPool);

                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);
            } else {
                break;
            } // break if the loop reaches a TrenBox with ICR >= MCR

            vars.user = nextUser;
            unchecked {
                ++i;
            }
        }
    }

    /* In a full liquidation, returns the values for a trenBox's coll and debt to be offset, and
    coll
    and debt to be
     * redistributed to active trenBoxes.
     */
    function _getOffsetAndRedistributionVals(
        uint256 _debt,
        uint256 _coll,
        uint256 _debtTokenInStabPool
    )
        internal
        pure
        returns (
            uint256 debtToOffset,
            uint256 collToSendToSP,
            uint256 debtToRedistribute,
            uint256 collToRedistribute
        )
    {
        if (_debtTokenInStabPool != 0) {
            /*
            * Offset as much debt & collateral as possible against the Stability Pool, and
            redistribute the remainder
             * between all active trenBoxes.
             *
            *  If the trenBox's debt is larger than the deposited debt token in the Stability Pool:
             *
            *  - Offset an amount of the trenBox's debt equal to the debt token in the Stability
            Pool
            *  - Send a fraction of the trenBox's collateral to the Stability Pool, equal to the
            fraction of its offset debt
             *
             */
            debtToOffset = TrenMath._min(_debt, _debtTokenInStabPool);
            collToSendToSP = (_coll * debtToOffset) / _debt;
            debtToRedistribute = _debt - debtToOffset;
            collToRedistribute = _coll - collToSendToSP;
        } else {
            debtToOffset = 0;
            collToSendToSP = 0;
            debtToRedistribute = _debt;
            collToRedistribute = _coll;
        }
    }

    /*
     *  Get its offset coll/debt and coll gas comp, and close the trenBox.
     */
    function _getCappedOffsetVals(
        address _asset,
        uint256 _entireTrenBoxDebt,
        uint256 _entireTrenBoxColl,
        uint256 _price
    )
        internal
        view
        returns (LiquidationValues memory singleLiquidation)
    {
        singleLiquidation.entireTrenBoxDebt = _entireTrenBoxDebt;
        singleLiquidation.entireTrenBoxColl = _entireTrenBoxColl;
        uint256 cappedCollPortion =
            (_entireTrenBoxDebt * IAdminContract(adminContract).getMcr(_asset)) / _price;

        singleLiquidation.collGasCompensation = _getCollGasCompensation(_asset, cappedCollPortion);
        singleLiquidation.debtTokenGasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);

        singleLiquidation.debtToOffset = _entireTrenBoxDebt;
        singleLiquidation.collToSendToSP = cappedCollPortion - singleLiquidation.collGasCompensation;
        singleLiquidation.collSurplus = _entireTrenBoxColl - cappedCollPortion;
        singleLiquidation.debtToRedistribute = 0;
        singleLiquidation.collToRedistribute = 0;
    }

    function _checkPotentialRecoveryMode(
        address _asset,
        uint256 _entireSystemColl,
        uint256 _entireSystemDebt,
        uint256 _price
    )
        internal
        view
        returns (bool)
    {
        uint256 TCR = TrenMath._computeCR(_entireSystemColl, _entireSystemDebt, _price);
        return TCR < IAdminContract(adminContract).getCcr(_asset);
    }

    // Redemption internal/helper functions
    // -----------------------------------------------------------------------------

    function _validateRedemptionRequirements(
        address _asset,
        uint256 _maxFeePercentage,
        uint256 _debtTokenAmount,
        uint256 _price
    )
        internal
        view
    {
        uint256 redemptionBlockTimestamp =
            IAdminContract(adminContract).getRedemptionBlockTimestamp(_asset);
        if (redemptionBlockTimestamp > block.timestamp) {
            revert TrenBoxManagerOperations__RedemptionIsBlocked();
        }
        uint256 redemptionFeeFloor = IAdminContract(adminContract).getRedemptionFeeFloor(_asset);
        if (_maxFeePercentage < redemptionFeeFloor || _maxFeePercentage > DECIMAL_PRECISION) {
            revert TrenBoxManagerOperations__FeePercentOutOfBounds(
                redemptionFeeFloor, DECIMAL_PRECISION
            );
        }
        if (_debtTokenAmount == 0) {
            revert TrenBoxManagerOperations__EmptyAmount();
        }
        uint256 redeemerBalance = IDebtToken(debtToken).balanceOf(msg.sender);
        if (redeemerBalance < _debtTokenAmount) {
            revert TrenBoxManagerOperations__InsufficientDebtTokenBalance(redeemerBalance);
        }
        uint256 tcr = _getTCR(_asset, _price);
        uint256 mcr = IAdminContract(adminContract).getMcr(_asset);
        if (tcr < mcr) {
            revert TrenBoxManagerOperations__TCRMustBeAboveMCR(tcr, mcr);
        }
    }

    // Redeem as much collateral as possible from _borrower's trenBox in exchange for GRAI up to
    // _maxDebtTokenAmount
    function _redeemCollateralFromTrenBox(
        address _asset,
        address _borrower,
        uint256 _maxDebtTokenAmount,
        uint256 _price,
        address _upperPartialRedemptionHint,
        address _lowerPartialRedemptionHint,
        uint256 _partialRedemptionHintNICR
    )
        internal
        returns (SingleRedemptionValues memory singleRedemption)
    {
        uint256 trenBoxDebt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset, _borrower);
        uint256 trenBoxColl = ITrenBoxManager(trenBoxManager).getTrenBoxColl(_asset, _borrower);

        // Determine the remaining amount (lot) to be redeemed, capped by the entire debt of the
        // trenBox minus the liquidation reserve
        singleRedemption.debtLot = TrenMath._min(
            _maxDebtTokenAmount,
            trenBoxDebt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)
        );

        // Get the debtToken lot of equivalent value in USD
        singleRedemption.collLot = (singleRedemption.debtLot * DECIMAL_PRECISION) / _price;

        // Apply redemption softening
        singleRedemption.collLot =
            (singleRedemption.collLot * redemptionSofteningParam) / PERCENTAGE_PRECISION;

        // Decrease the debt and collateral of the current trenBox according to the debt token lot
        // and corresponding coll to send

        uint256 newDebt = trenBoxDebt - singleRedemption.debtLot;
        uint256 newColl = trenBoxColl - singleRedemption.collLot;

        if (newDebt == IAdminContract(adminContract).getDebtTokenGasCompensation(_asset)) {
            ITrenBoxManager(trenBoxManager).executeFullRedemption(_asset, _borrower, newColl);
        } else {
            uint256 newNICR = TrenMath._computeNominalCR(newColl, newDebt);

            /*
            * If the provided hint is out of date, we bail since trying to reinsert without a good
            hint will almost
             * certainly result in running out of gas.
             *
            * If the resultant net debt of the partial is less than the minimum, net debt we bail.
             */
            if (
                newNICR != _partialRedemptionHintNICR
                    || _getNetDebt(_asset, newDebt)
                        < IAdminContract(adminContract).getMinNetDebt(_asset)
            ) {
                singleRedemption.cancelledPartial = true;
                return singleRedemption;
            }

            ITrenBoxManager(trenBoxManager).executePartialRedemption(
                _asset,
                _borrower,
                newDebt,
                newColl,
                newNICR,
                _upperPartialRedemptionHint,
                _lowerPartialRedemptionHint
            );
        }

        return singleRedemption;
    }

    function setRedemptionSofteningParam(uint256 _redemptionSofteningParam) public {
        if (msg.sender != timelockAddress) {
            revert TrenBoxManagerOperations__NotTimelock();
        }
        if (_redemptionSofteningParam < 9700 || _redemptionSofteningParam > PERCENTAGE_PRECISION) {
            revert TrenBoxManagerOperations__InvalidParam();
        }
        redemptionSofteningParam = _redemptionSofteningParam;
        emit RedemptionSoftenParamChanged(_redemptionSofteningParam);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}