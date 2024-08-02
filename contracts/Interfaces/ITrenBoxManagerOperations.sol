// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { ITrenBoxManager } from "./ITrenBoxManager.sol";

/**
 * @title ITrenBoxManagerOperations
 * @notice Defines the basic interface for TrenBoxManagerOperations contract.
 */
interface ITrenBoxManagerOperations {
    // ------------------------------------------ Structs -----------------------------------------
    /**
     * @dev The struct for local variables storing of liquidation total parameters.
     * @param totalCollInSequence The total amount of collateral in list.
     * @param totalDebtInSequence The total amount of debt in list.
     * @param totalCollGasCompensation The total amount of gas compensation, expressed in
     * collateral.
     * @param totalDebtTokenGasCompensation The total amount of gas compensation, expressed in
     * trenUSD.
     * @param totalDebtToOffset The total amount to be offset, expressed in trenUSD.
     * @param totalCollToSendToSP The total amount of collateral to be sent to Stability Pool.
     * @param totalDebtToRedistribute The total amount of debt to be redistributed, expressed in
     * trenUSD.
     * @param totalCollToRedistribute The total amount of collateral to be redistributed.
     * @param totalCollToClaim The total amount of collateral to be claimed.
     */
    struct LiquidationTotals {
        uint256 totalCollInSequence;
        uint256 totalDebtInSequence;
        uint256 totalCollGasCompensation;
        uint256 totalDebtTokenGasCompensation;
        uint256 totalDebtToOffset;
        uint256 totalCollToSendToSP;
        uint256 totalDebtToRedistribute;
        uint256 totalCollToRedistribute;
        uint256 totalCollToClaim;
    }

    /**
     * @dev The struct for local variables storing of signle liquidation parameters.
     * @param entireTrenBoxDebt The entire amount of debt.
     * @param entireTrenBoxColl The entire amount of collateral.
     * @param collGasCompensation The amount of gas compensation, expressed in collateral.
     * @param debtTokenGasCompensation The amount of gas compensation, expressed in trenUSD.
     * @param debtToOffset The amount to be offset, expressed in trenUSD.
     * @param collToSendToSP The amount of collateral to be sent to Stability Pool.
     * @param debtToRedistribute The amount of debt to be redistributed, expressed in trenUSD.
     * @param collToRedistribute The amount of collateral to be redistributed.
     * @param collToClaim The amount of collateral to be claimed.
     */
    struct LiquidationValues {
        uint256 entireTrenBoxDebt;
        uint256 entireTrenBoxColl;
        uint256 collGasCompensation;
        uint256 debtTokenGasCompensation;
        uint256 debtToOffset;
        uint256 collToSendToSP;
        uint256 debtToRedistribute;
        uint256 collToRedistribute;
        uint256 collToClaim;
    }

    /**
     * @dev The struct for local variables storing of inner single liquidation parameters.
     * @param collToLiquidate The amount of collateral to be liquidated.
     * @param pendingDebtReward The amount of pending rewards, expressed in trenUSD.
     * @param pendingCollReward The amount of pending rewards, expressed in collateral.
     */
    struct LocalVariables_InnerSingleLiquidateFunction {
        uint256 collToLiquidate;
        uint256 pendingDebtReward;
        uint256 pendingCollReward;
    }

    /**
     * @dev The struct for local variables storing of outer single liquidation parameters.
     * @param price The amount of collateral price.
     * @param debtTokenInStabPool The amount of debt to be sent in Stability Pool, expressed in
     * trenUSD.
     * @param recoveryModeAtStart The index of Recovery Mode at the beginning.
     * @param liquidatedDebt The amount of liquidated debt.
     * @param liquidatedColl The amount of liquidated collateral.
     */
    struct LocalVariables_OuterLiquidationFunction {
        uint256 price;
        uint256 debtTokenInStabPool;
        bool recoveryModeAtStart;
        uint256 liquidatedDebt;
        uint256 liquidatedColl;
    }

    /**
     * @dev The struct for local variables storing of liquidation list.
     * @param remainingDebtTokenInStabPool The remaining amount of debt in Stability Pool.
     * @param price The amount of collateral price.
     * @param ICR The individual collateral ratio.
     * @param user The address of borrower.
     * @param backToNormalMode The index of backing to normal mode or no.
     * @param entireSystemDebt The entire amount of system debt.
     * @param entireSystemColl The entire amount of system collateral.
     */
    struct LocalVariables_LiquidationSequence {
        uint256 remainingDebtTokenInStabPool;
        uint256 price;
        uint256 ICR;
        address user;
        bool backToNormalMode;
        uint256 entireSystemDebt;
        uint256 entireSystemColl;
    }

    /**
     * @dev The struct for local variables storing of hint helper parameters.
     * @param asset The address of collateral asset.
     * @param debtTokenAmount The amount of debt.
     * @param price The price of collateral asset.
     * @param maxIterations The maximum number of iterations.
     */
    struct LocalVariables_HintHelper {
        address asset;
        uint256 debtTokenAmount;
        uint256 price;
        uint256 maxIterations;
    }

    // ------------------------------------------ Events ------------------------------------------

    /**
     * @dev Emitted when the TrenBox is liquidated.
     * @param _asset The address of collateral asset.
     * @param _liquidatedDebt The liquidated amount of debt.
     * @param _liquidatedColl The liquidated amount of collateral.
     * @param _collGasCompensation The amount of gas compensation, expressed in collateral.
     * @param _debtTokenGasCompensation The amount of gas compensation, expressed in trenUSD.
     */
    event Liquidation(
        address indexed _asset,
        uint256 _liquidatedDebt,
        uint256 _liquidatedColl,
        uint256 _collGasCompensation,
        uint256 _debtTokenGasCompensation
    );

    /**
     * @dev Emitted when the TrenBox is redistributed.
     * @param _asset The address of collateral asset.
     * @param _redistributedDebt The redistributed amount of debt.
     * @param _redistributedColl The redistributed amount of collateral.
     */
    event Redistribution(
        address indexed _asset, uint256 _redistributedDebt, uint256 _redistributedColl
    );

    /**
     * @dev Emitted when the exact TrenBox is liquidated.
     * @param _asset The address of collateral asset.
     * @param _borrower The address of borrower.
     * @param _debt The amount of debt.
     * @param _coll The amount of collateral.
     * @param _operation The index of liquidation.
     */
    event TrenBoxLiquidated(
        address indexed _asset,
        address indexed _borrower,
        uint256 _debt,
        uint256 _coll,
        ITrenBoxManager.TrenBoxManagerOperation _operation
    );

    // ------------------------------------------ Custom Errors -----------------------------------

    /// @dev Thrown when an operation involves an array with an invalid size.
    error TrenBoxManagerOperations__InvalidArraySize();

    /// @dev Thrown when an operation involves an amount that is empty or zero.
    error TrenBoxManagerOperations__EmptyAmount();

    /// @dev Thrown when the fee percentage is outside the allowed boundaries.
    /// @param lowerBoundary The lower boundary of the allowed fee percentage.
    /// @param upperBoundary The upper boundary of the allowed fee percentage.
    error TrenBoxManagerOperations__FeePercentOutOfBounds(
        uint256 lowerBoundary, uint256 upperBoundary
    );

    /// @dev Thrown when there is insufficient balance of the debt token to complete an
    /// operation.
    /// @param availableBalance The available balance of the debt token.
    error TrenBoxManagerOperations__InsufficientDebtTokenBalance(uint256 availableBalance);

    /// @dev Thrown when there is nothing to liquidate during a liquidation process.
    error TrenBoxManagerOperations__NothingToLiquidate();

    /// @dev Thrown when a function is called by an entity that is not the TrenBox Manager.
    error TrenBoxManagerOperations__OnlyTrenBoxManager();

    /// @dev Thrown when the Total Collateral Ratio (TCR) is below the Minimum Collateral Ratio
    /// (MCR).
    /// @param tcr The current Total Collateral Ratio.
    /// @param mcr The Minimum Collateral Ratio that must be met or exceeded.
    error TrenBoxManagerOperations__TCRMustBeAboveMCR(uint256 tcr, uint256 mcr);

    /// @dev Thrown when an operation is attempted on an inactive TrenBox.
    error TrenBoxManagerOperations__TrenBoxNotActive();

    /// @dev Thrown when a provided parameter is invalid.
    error TrenBoxManagerOperations__InvalidParam();

    /// @dev Thrown when a function is called by caller that is not the Timelock contract.
    error TrenBoxManagerOperations__NotTimelock();

    // ------------------------------------------ Functions ---------------------------------------

    /**
     * @notice Liquidate a single TrenBox.
     * @dev Closes the TrenBox if its ICR is lower than the minimum collateral ratio.
     * @param _asset The address of asset.
     * @param _borrower The address of borrower.
     */
    function liquidate(address _asset, address _borrower) external;

    /**
     * @notice Liquidate a sequence of TrenBoxes.
     * @dev Closes a maximum number of n under-collateralized TrenBoxes,
     * starting from the one with the lowest collateral ratio in the system, and moving upwards.
     * @param _asset The address of asset.
     * @param _n The list TrenBoxes that should be liquidated.
     */
    function liquidateTrenBoxes(address _asset, uint256 _n) external;

    /**
     * @notice Attempt to liquidate a custom list of TrenBoxes provided by the caller.
     * @param _asset The address of asset.
     * @param _trenBoxArray The array of custom TrenBoxes.
     */
    function batchLiquidateTrenBoxes(address _asset, address[] memory _trenBoxArray) external;

    /**
     * @notice Return address of a TrenBox that is, on average, (length /
     * numTrials) positions away in the sortedTrenBoxes list from the correct insert position of the
     * TrenBox to be inserted.
     *
     * Note: The output address is worst-case O(n) positions away from the correct insert position,
     * however, the function is probabilistic.
     * Input can be tuned to guarantee results to a high degree of confidence,
     * e.g:
     * Submitting numTrials = k * sqrt(length), with k = 15 makes it very, very likely that the
     * ouput address will be <= sqrt(length) positions away from the correct insert position.
     */
    function getApproxHint(
        address _asset,
        uint256 _CR,
        uint256 _numTrials,
        uint256 _inputRandomSeed
    )
        external
        returns (address hintAddress, uint256 diff, uint256 latestRandomSeed);

    /**
     *
     * @notice Return nominal collateral ratio.
     * @param _coll The amount of collateral.
     * @param _debt The amount of debt.
     */
    function computeNominalCR(uint256 _coll, uint256 _debt) external returns (uint256);
}
