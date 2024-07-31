// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { TrenBase } from "./Dependencies/TrenBase.sol";
import { TrenMath } from "./Dependencies/TrenMath.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IPriceFeed } from "./Interfaces/IPriceFeed.sol";
import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { ITrenBoxManagerOperations } from "./Interfaces/ITrenBoxManagerOperations.sol";
import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";

/// @title TrenBoxManagerOperations
/// @notice A contract with main operation functionality such as redemption, redistribution and
/// liquidation.
contract TrenBoxManagerOperations is
    ITrenBoxManagerOperations,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    TrenBase
{
    /// @notice The contract name.
    string public constant NAME = "TrenBoxManagerOperations";

    /// @notice The percentage divider.
    uint256 public constant PERCENTAGE_PRECISION = 10_000;
    /// @notice The array limit.
    uint256 public constant BATCH_SIZE_LIMIT = 25;
    /// @notice The redemption softening peram.
    uint256 public redemptionSofteningParam;

    // ------------------------------------- Initializer ------------------------------------------

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
        __ReentrancyGuard_init();
    }

    // -------------------------------- Liquidation external functions ----------------------------

    /// @inheritdoc ITrenBoxManagerOperations
    function liquidate(address _asset, address _borrower) external override {
        if (!ITrenBoxManager(trenBoxManager).isTrenBoxActive(_asset, _borrower)) {
            revert TrenBoxManagerOperations__TrenBoxNotActive();
        }
        address[] memory borrowers = new address[](1);
        borrowers[0] = _borrower;
        batchLiquidateTrenBoxes(_asset, borrowers);
    }

    /// @inheritdoc ITrenBoxManagerOperations
    function liquidateTrenBoxes(address _asset, uint256 _n) external override nonReentrant {
        LocalVariables_OuterLiquidationFunction memory vars;
        LiquidationTotals memory totals;
        vars.price = IPriceFeed(priceFeed).fetchPrice(_asset);
        vars.debtTokenInStabPool = IStabilityPool(stabilityPool).getTotalDebtTokenDeposits();
        vars.recoveryModeAtStart = _checkRecoveryMode(_asset, vars.price);

        if (vars.recoveryModeAtStart) {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(
                _asset, vars.price, vars.debtTokenInStabPool, _n, false
            );
        } else {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_NormalMode(
                _asset, vars.price, vars.debtTokenInStabPool, _n, false
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
        if (totals.totalCollToClaim != 0) {
            ITrenBoxStorage(trenBoxStorage).decreaseActiveCollateral(
                _asset, totals.totalCollToClaim
            );
            ITrenBoxStorage(trenBoxStorage).increaseClaimableCollateral(
                _asset, totals.totalCollToClaim
            );
        }

        ITrenBoxManager(trenBoxManager).updateSystemSnapshots_excludeCollRemainder(
            _asset, totals.totalCollGasCompensation
        );

        vars.liquidatedDebt = totals.totalDebtInSequence;
        vars.liquidatedColl =
            totals.totalCollInSequence - totals.totalCollGasCompensation - totals.totalCollToClaim;
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

    /// @inheritdoc ITrenBoxManagerOperations
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
        if (totals.totalCollToClaim != 0) {
            ITrenBoxStorage(trenBoxStorage).decreaseActiveCollateral(
                _asset, totals.totalCollToClaim
            );
            ITrenBoxStorage(trenBoxStorage).increaseClaimableCollateral(
                _asset, totals.totalCollToClaim
            );
        }

        // Update system snapshots
        ITrenBoxManager(trenBoxManager).updateSystemSnapshots_excludeCollRemainder(
            _asset, totals.totalCollGasCompensation
        );

        vars.liquidatedDebt = totals.totalDebtInSequence;
        vars.liquidatedColl =
            totals.totalCollInSequence - totals.totalCollGasCompensation - totals.totalCollToClaim;
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

    /**
     * @notice Redistribute (liquidate by protocol) a sequence of low-value trenBoxes.
     * Closes a maximum number of _trenBoxes under-collateralized TrenBoxes,
     * starting from the one with the lowest collateral ratio in the system, and moving upwards.
     * @param _asset The address of collateral asset.
     * @param _trenBoxes The list of TrenBoxes that should be redistributed.
     */
    function redistributeTrenBoxes(
        address _asset,
        uint256 _trenBoxes
    )
        external
        nonReentrant
        onlyOwner
    {
        LocalVariables_OuterLiquidationFunction memory vars;
        LiquidationTotals memory totals;

        vars.debtTokenInStabPool = IStabilityPool(stabilityPool).getTotalDebtTokenDeposits();
        vars.price = IPriceFeed(priceFeed).fetchPrice(_asset);
        vars.recoveryModeAtStart = _checkRecoveryMode(_asset, vars.price);

        if (vars.recoveryModeAtStart) {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(
                _asset, vars.price, vars.debtTokenInStabPool, _trenBoxes, true
            );
        } else {
            totals = _getTotalsFromLiquidateTrenBoxesSequence_NormalMode(
                _asset, vars.price, vars.debtTokenInStabPool, _trenBoxes, true
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
            0
        );

        emit Redistribution(
            _asset,
            totals.totalDebtInSequence,
            totals.totalCollInSequence - totals.totalCollToClaim,
            totals.totalDebtTokenGasCompensation
        );
    }

    // ------------------------------------- Hint helper functions --------------------------------

    /// @inheritdoc ITrenBoxManagerOperations
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

    /// @inheritdoc ITrenBoxManagerOperations
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

    // ------------------------------------- Internal functions -----------------------------------

    /**
     * @dev This function is used when the batch liquidation sequence starts during Recovery
     * Mode.
     * However, it handles the case where the system *leaves* Recovery Mode, part way
     * through the liquidation sequence.
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
                // Skip this TrenBox if ICR is greater than MCR and Stability Pool is empty
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
                    _asset,
                    vars.user,
                    vars.ICR,
                    vars.remainingDebtTokenInStabPool,
                    TCR,
                    _price,
                    false
                );

                // Update aggregate trackers
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;
                vars.entireSystemDebt = vars.entireSystemDebt - singleLiquidation.debtToOffset;
                vars.entireSystemColl = vars.entireSystemColl - singleLiquidation.collToSendToSP
                    - singleLiquidation.collGasCompensation - singleLiquidation.collToClaim;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);

                vars.backToNormalMode = !_checkPotentialRecoveryMode(
                    _asset, vars.entireSystemColl, vars.entireSystemDebt, _price
                );
            } else if (
                vars.backToNormalMode && vars.ICR < IAdminContract(adminContract).getMcr(_asset)
            ) {
                singleLiquidation = _liquidateNormalMode(
                    _asset, vars.user, vars.remainingDebtTokenInStabPool, false
                );

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

    /**
     * @dev This function is used when the batch liquidation sequence starts during Normal
     * Mode.
     */
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
                singleLiquidation = _liquidateNormalMode(
                    _asset, vars.user, vars.remainingDebtTokenInStabPool, false
                );

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

    /**
     * @dev Adds liquidation values to total value of all TrenBoxes.
     */
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
        newTotals.totalCollToClaim = oldTotals.totalCollToClaim + singleLiquidation.collToClaim;
        return newTotals;
    }

    function _getTotalsFromLiquidateTrenBoxesSequence_NormalMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        uint256 _n,
        bool _fullRedistribution
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
                if (_fullRedistribution) {
                    singleLiquidation = _liquidateNormalMode(
                        _asset, vars.user, vars.remainingDebtTokenInStabPool, true
                    );
                } else {
                    singleLiquidation = _liquidateNormalMode(
                        _asset, vars.user, vars.remainingDebtTokenInStabPool, false
                    );
                }

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

    /**
     * @dev Attempt to liquidated single TrenBox during Normal Mode.
     */
    function _liquidateNormalMode(
        address _asset,
        address _borrower,
        uint256 _debtTokenInStabPool,
        bool _fullRedistribution
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

        ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(
            _asset, vars.pendingDebtReward, vars.pendingCollReward
        );
        ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);

        singleLiquidation.debtTokenGasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);

        uint256 collToLiquidate;
        if (_fullRedistribution) {
            collToLiquidate = singleLiquidation.entireTrenBoxColl;
        } else {
            singleLiquidation.collGasCompensation =
                _getCollGasCompensation(_asset, singleLiquidation.entireTrenBoxColl);
            collToLiquidate =
                singleLiquidation.entireTrenBoxColl - singleLiquidation.collGasCompensation;
        }

        (
            singleLiquidation.debtToOffset,
            singleLiquidation.collToSendToSP,
            singleLiquidation.debtToRedistribute,
            singleLiquidation.collToRedistribute
        ) = _getOffsetAndRedistributionVals(
            singleLiquidation.entireTrenBoxDebt, collToLiquidate, _debtTokenInStabPool
        );

        if (_fullRedistribution) {
            ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(
                _asset, _borrower, singleLiquidation.debtTokenGasCompensation
            );
        } else {
            ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
        }
        emit TrenBoxLiquidated(
            _asset,
            _borrower,
            singleLiquidation.entireTrenBoxDebt,
            singleLiquidation.entireTrenBoxColl,
            ITrenBoxManager.TrenBoxManagerOperation.liquidateInNormalMode
        );
        return singleLiquidation;
    }

    /**
     * @dev Attempt to liquidated single TrenBox during Recovery Mode.
     */
    function _liquidateRecoveryMode(
        address _asset,
        address _borrower,
        uint256 _ICR,
        uint256 _debtTokenInStabPool,
        uint256 _TCR,
        uint256 _price,
        bool _fullRedistribution
    )
        internal
        returns (LiquidationValues memory singleLiquidation)
    {
        LocalVariables_InnerSingleLiquidateFunction memory vars;
        if (ITrenBoxManager(trenBoxManager).getTrenBoxOwnersCount(_asset) <= 1) {
            return singleLiquidation;
        } // don't liquidate if last TrenBox
        (
            singleLiquidation.entireTrenBoxDebt,
            singleLiquidation.entireTrenBoxColl,
            vars.pendingDebtReward,
            vars.pendingCollReward
        ) = ITrenBoxManager(trenBoxManager).getEntireDebtAndColl(_asset, _borrower);

        singleLiquidation.debtTokenGasCompensation =
            IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);

        if (_fullRedistribution) {
            vars.collToLiquidate = singleLiquidation.entireTrenBoxColl;
        } else {
            singleLiquidation.collGasCompensation =
                _getCollGasCompensation(_asset, singleLiquidation.entireTrenBoxColl);
            vars.collToLiquidate =
                singleLiquidation.entireTrenBoxColl - singleLiquidation.collGasCompensation;
        }

        // If ICR <= 100%, purely redistribute the TrenBox across all active TrenBoxes
        if (_ICR <= IAdminContract(adminContract)._100pct() || _fullRedistribution) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(
                _asset, vars.pendingDebtReward, vars.pendingCollReward
            );
            ITrenBoxManager(trenBoxManager).removeStake(_asset, _borrower);

            singleLiquidation.debtToOffset = 0;
            singleLiquidation.collToSendToSP = 0;
            singleLiquidation.debtToRedistribute = singleLiquidation.entireTrenBoxDebt;
            singleLiquidation.collToRedistribute = vars.collToLiquidate;

            if (_fullRedistribution) {
                ITrenBoxManager(trenBoxManager).closeTrenBoxRedistribution(
                    _asset, _borrower, singleLiquidation.debtTokenGasCompensation
                );
                emit TrenBoxLiquidated(
                    _asset,
                    _borrower,
                    singleLiquidation.entireTrenBoxDebt,
                    singleLiquidation.entireTrenBoxColl,
                    ITrenBoxManager.TrenBoxManagerOperation.redistributeCollateral
                );
            } else {
                ITrenBoxManager(trenBoxManager).closeTrenBoxLiquidation(_asset, _borrower);
                emit TrenBoxLiquidated(
                    _asset,
                    _borrower,
                    singleLiquidation.entireTrenBoxDebt,
                    singleLiquidation.entireTrenBoxColl,
                    ITrenBoxManager.TrenBoxManagerOperation.liquidateInRecoveryMode
                );
            }

            // If 100% < ICR < MCR, offset as much as possible, and redistribute the remainder
        } else if (
            (_ICR > IAdminContract(adminContract)._100pct())
                && (_ICR < IAdminContract(adminContract).getMcr(_asset))
        ) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(
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

            /**
             * If 110% <= ICR < current TCR (accounting for the preceding liquidations in the
             * current sequence) and
             * there are debt tokens in the Stability Pool, only offset, with no redistribution,
             * but at a capped rate of 1.1 and only if the whole debt can be liquidated.
             * The remainder due to the capped rate will be claimable as collateral surplus.
             */
        } else if (
            (_ICR >= IAdminContract(adminContract).getMcr(_asset)) && (_ICR < _TCR)
                && (singleLiquidation.entireTrenBoxDebt <= _debtTokenInStabPool)
        ) {
            ITrenBoxManager(trenBoxManager).movePendingTrenBoxRewardsFromLiquidatedToActive(
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
            if (singleLiquidation.collToClaim != 0) {
                ITrenBoxStorage(trenBoxStorage).updateUserClaimableBalance(
                    _asset, _borrower, singleLiquidation.collToClaim
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
            LiquidationValues memory zeroVals;
            return zeroVals;
        }

        return singleLiquidation;
    }

    /**
     * @dev This function is used when the liquidateTrenBoxes sequence starts during Recovery
     * Mode.
     * However, it handles the case where the system *leaves* Recovery Mode, part way
     * through the liquidation sequence
     */
    function _getTotalsFromLiquidateTrenBoxesSequence_RecoveryMode(
        address _asset,
        uint256 _price,
        uint256 _debtTokenInStabPool,
        uint256 _n,
        bool _fullRedistribution
    )
        internal
        returns (LiquidationTotals memory totals)
    {
        LocalVariables_LiquidationSequence memory vars;
        LiquidationValues memory singleLiquidation;

        vars.remainingDebtTokenInStabPool = _debtTokenInStabPool;
        vars.backToNormalMode = false;
        vars.price = _price;
        vars.entireSystemDebt = getEntireSystemDebt(_asset);
        vars.entireSystemColl = getEntireSystemColl(_asset);

        vars.user = ISortedTrenBoxes(sortedTrenBoxes).getLast(_asset);
        address firstUser = ISortedTrenBoxes(sortedTrenBoxes).getFirst(_asset);
        for (uint256 i = 0; i < _n && vars.user != firstUser;) {
            // we need to cache it, because current user is likely going to be deleted
            address nextUser = ISortedTrenBoxes(sortedTrenBoxes).getPrev(_asset, vars.user);

            vars.ICR = ITrenBoxManager(trenBoxManager).getCurrentICR(_asset, vars.user, vars.price);

            if (!vars.backToNormalMode) {
                // Break the loop if ICR is greater than MCR and Stability Pool is empty
                if (
                    vars.ICR >= IAdminContract(adminContract).getMcr(_asset)
                        && vars.remainingDebtTokenInStabPool == 0
                ) {
                    break;
                }

                uint256 TCR =
                    TrenMath._computeCR(vars.entireSystemColl, vars.entireSystemDebt, vars.price);

                if (_fullRedistribution) {
                    singleLiquidation = _liquidateRecoveryMode(
                        _asset,
                        vars.user,
                        vars.ICR,
                        vars.remainingDebtTokenInStabPool,
                        TCR,
                        vars.price,
                        true
                    );
                } else {
                    singleLiquidation = _liquidateRecoveryMode(
                        _asset,
                        vars.user,
                        vars.ICR,
                        vars.remainingDebtTokenInStabPool,
                        TCR,
                        vars.price,
                        false
                    );
                }

                // Update aggregate trackers
                vars.remainingDebtTokenInStabPool =
                    vars.remainingDebtTokenInStabPool - singleLiquidation.debtToOffset;
                vars.entireSystemDebt = vars.entireSystemDebt - singleLiquidation.debtToOffset;
                vars.entireSystemColl = vars.entireSystemColl - singleLiquidation.collToSendToSP
                    - singleLiquidation.collGasCompensation - singleLiquidation.collToClaim;

                // Add liquidation values to their respective running totals
                totals = _addLiquidationValuesToTotals(totals, singleLiquidation);

                vars.backToNormalMode = !_checkPotentialRecoveryMode(
                    _asset, vars.entireSystemColl, vars.entireSystemDebt, vars.price
                );
            } else if (
                vars.backToNormalMode && vars.ICR < IAdminContract(adminContract).getMcr(_asset)
            ) {
                if (_fullRedistribution) {
                    singleLiquidation = _liquidateNormalMode(
                        _asset, vars.user, vars.remainingDebtTokenInStabPool, true
                    );
                } else {
                    singleLiquidation = _liquidateNormalMode(
                        _asset, vars.user, vars.remainingDebtTokenInStabPool, false
                    );
                }

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

    /**
     * @dev In a full liquidation, returns the values for a TrenBox's coll and debt to be offset,
     * and coll and debt to be redistributed to active trenBoxes.
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
            /**
             * Offset as much debt & collateral as possible against the Stability Pool, and
             * redistribute the remainder between all active trenBoxes.
             *
             * If the TrenBox's debt is larger than the deposited debt token in the Stability Pool:
             *
             * - Offset an amount of the TrenBox's debt equal to the debt token in the
             * Stability Pool
             * - Send a fraction of the TrenBox's collateral to the Stability Pool, equal to the
             * fraction of its offset debt
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

    /**
     * @dev Get its offset coll/debt and coll gas comp, and close the TrenBox.
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
        singleLiquidation.collToClaim = _entireTrenBoxColl - cappedCollPortion;
        singleLiquidation.debtToRedistribute = 0;
        singleLiquidation.collToRedistribute = 0;
    }

    /**
     *  @dev Checks if its Recovery mode or no by comparing current TCR to CCR.
     */
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

    // -------------------------------- Public/Internal functions ---------------------------------

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
