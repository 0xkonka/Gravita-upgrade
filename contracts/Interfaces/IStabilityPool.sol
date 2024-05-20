// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { IDeposit } from "./IDeposit.sol";

/**
 * @title IStabilityPool
 * @notice Defines the basic interface for StabilityPool contract.
 */
interface IStabilityPool is IDeposit {
    // --- Structs ---

    /**
     * @dev Struct for tracking a depositor's snapshot.
     * @param S The sum of collateral gains.
     * @param P The product.
     * @param G The sum of TREN gains.
     * @param scale The current scale.
     * @param epoch The current epoch.
     */
    struct Snapshots {
        mapping(address => uint256) S;
        uint256 P;
        uint256 G;
        uint128 scale;
        uint128 epoch;
    }

    // --- Events ---

    /**
     * @dev Emitted when the snapshot for a specific depositor is updated.
     * @param _depositor The caller address.
     * @param _P The product.
     * @param _G The sum of TREN gains.
     */
    event DepositSnapshotUpdated(address indexed _depositor, uint256 _P, uint256 _G);

    /**
     * @dev Emitted when collateral gains are transferred to a depositor.
     * @param _depositor The depositor address.
     * @param _collaterals The address array of collaterals gained.
     * @param _amounts The amount array of collaterals gained.
     * @param _debtTokenLoss The loss of debt tokens against initial deposit.
     */
    event GainsWithdrawn(
        address indexed _depositor,
        address[] _collaterals,
        uint256[] _amounts,
        uint256 _debtTokenLoss
    );

    /**
     * @dev Emitted when TREN gains are transferred to a depositor.
     * @param _depositor The depositor address.
     * @param _TREN The amount of TREN tokens.
     */
    event TRENPaidToDepositor(address indexed _depositor, uint256 _TREN);

    /**
     * @dev Emitted when the specific collateral is received from trenBoxStorage contract.
     * @param _asset The address of collateral asset.
     * @param _newBalance The updated balance of collateral asset.
     */
    event StabilityPoolAssetBalanceUpdated(address _asset, uint256 _newBalance);

    /**
     * @dev Emitted when debt tokens are sent to a user or moved to other pool.
     * @param _newBalance The updated balance of debt tokens.
     */
    event StabilityPoolDebtTokenBalanceUpdated(uint256 _newBalance);

    /**
     * @dev Emitted when a user deposits or withdraws debt tokens.
     * @param _depositor The depositor address.
     * @param _newDeposit The updated user balance.
     */
    event UserDepositChanged(address indexed _depositor, uint256 _newDeposit);

    /**
     * @dev Emitted when the product is updated.
     * @param _P The new product.
     */
    event ProductUpdated(uint256 _P);

    /**
     * @dev Emitted when the sum is updated.
     * @param _asset The address of collateral asset.
     * @param _S The new sum of collateral gains.
     * @param _epoch The current epoch.
     * @param _scale THe current scale.
     */
    event SumUpdated(address _asset, uint256 _S, uint128 _epoch, uint128 _scale);

    /**
     * @dev Emitted when the sum of TREN gains is updated.
     * @param _G The new sum of TREN gains.
     * @param _epoch The current epoch.
     * @param _scale The current scale.
     */
    event GainsUpdated(uint256 _G, uint128 _epoch, uint128 _scale);

    /**
     * @dev Emitted when the current epoch is updated.
     * @param _currentEpoch The new epoch.
     */
    event EpochUpdated(uint128 _currentEpoch);

    /**
     * @dev Emitted when the current scale is updated.
     * @param _currentScale The new scale.
     */
    event ScaleUpdated(uint128 _currentScale);

    // --- Errors ---

    /**
     * @dev Error emitted when the caller is not TrenBoxStorage.
     * @param _sender The caller address.
     * @param _expected The TrenBoxStorage address.
     */
    error StabilityPool__TrenBoxStorageOnly(address _sender, address _expected);

    /**
     * @dev Error emitted when the caller is not AdminContract.
     * @param _sender The caller address.
     * @param _expected The AdminContract address.
     */
    error StabilityPool__AdminContractOnly(address _sender, address _expected);

    /**
     * @dev Error emitted when the caller is not TrenBoxManager.
     * @param _sender The caller address.
     * @param _expected The TrenBoxManager address.
     */
    error StabilityPool__TrenBoxManagerOnly(address _sender, address _expected);

    /// @dev Error emitted when the asset list is not in ascending order.
    error StabilityPool__ArrayNotInAscendingOrder();

    /**
     * @dev Error emitted when the debt loss per unit staked is not less than
     * decimal precision.
     * @param _debtLoss The debt loss per unit staked.
     */
    error StabilityPool__DebtLossBelowOne(uint256 _debtLoss);

    /// @dev Error emitted when the amount of debt to offset is larger than
    /// total deposits.
    error StabilityPool__DebtLargerThanTotalDeposits();

    /// @dev Error emitted when the new product is zero.
    error StabilityPool__ProductZero();

    /// @dev Error emitted when the array length is mismatched.
    error StabilityPool__AssetsAndAmountsLengthMismatch();

    /// @dev Error emitted when the user's initial deposit is zero.
    error StabilityPool__UserHasNoDeposit();

    /// @dev Error emitted when the amount is zero.
    error StabilityPool__AmountMustBeNonZero();

    // --- Functions ---

    /**
     * @notice Gets collateral balance in the Stability Pool for a given collateral type.
     * @dev Not necessarily this contract's actual collateral balance;
     * just what is stored in state
     * @param _collateral The address of collateral asset.
     * @return The amount of collateral asset.
     */
    function getCollateral(address _collateral) external view returns (uint256);

    /**
     * @notice Gets all collateral assets and amounts.
     */
    function getAllCollateral() external view returns (address[] memory, uint256[] memory);

    /**
     * @notice Returns total deposits of debt tokens held in the pool.
     * Changes when users deposit/withdraw, and when a TrenBox debt is offset.
     */
    function getTotalDebtTokenDeposits() external view returns (uint256);

    /**
     * @notice Calculates the gains earned by a deposit since its last snapshots were taken for
     * selected assets.
     * @dev Given by the formula: E = d0 * (S - S(0))/P(0),
     * where S(0) and P(0) are the depositor's snapshots of the sum S and product P, respectively.
     * d0 is the last recorded deposit value.
     * @param _depositor The depositor address.
     * @param _assets The array of collateral assets to check gains for.
     */
    function getDepositorGains(
        address _depositor,
        address[] calldata _assets
    )
        external
        view
        returns (address[] memory, uint256[] memory);

    /**
     * @notice Calculates the TREN gain earned by a deposit since its last snapshots were taken.
     * @dev Given by the formula: TREN = d0 * (G - G(0))/P(0),
     * where G(0) and P(0) are the depositor's snapshots of the sum G and product P, respectively.
     * d0 is the last recorded deposit value.
     * @param _depositor The depositor address.
     */
    function getDepositorTRENGain(address _depositor) external view returns (uint256);

    /**
     * @notice Returns the user's compounded deposit.
     * @dev Given by the formula: d = d0 * P/P(0),
     * where P(0) is the depositor's snapshot of the product P, taken when they last updated their
     * deposit.
     * @param _depositor The depositor address.
     */
    function getCompoundedDebtTokenDeposits(address _depositor) external view returns (uint256);

    /**
     * @notice Adds new collateral type.
     * @param _collateral The address of collateral asset to add.
     */
    function addCollateralType(address _collateral) external;

    /**
     * @notice Provides debt tokens to the Stability Pool.
     * @dev Triggers a TREN issuance, based on time passed since the last issuance.
     * The TREN issuance is shared between all depositors.
     * - Sends depositor's accumulated gains (TREN, collateral assets) to depositor.
     * - Increases deposit stake, and takes new snapshots for each.
     * Skipping a collateral forfeits the available rewards (can be useful for gas optimizations).
     * @param _amount The amount of debt tokens provided.
     * @param _assets The array of collateral assets to be claimed.
     */
    function provideToSP(uint256 _amount, address[] calldata _assets) external;

    /**
     * @notice Withdraws debt tokens from the Stability Pool.
     * @dev Triggers a TREN issuance, based on time passed since the last issuance.
     * The TREN issuance is shared between all depositors.
     * - Sends all depositor's accumulated gains (TREN, assets) to depositor
     * - Decreases deposit's stake, and takes new snapshots.
     * If _amount > userDeposit, the user withdraws all of their compounded deposit.
     * @param _amount The amount of debt tokens to withdraw.
     * @param _assets The array of collateral assets to be claimed.
     */
    function withdrawFromSP(uint256 _amount, address[] calldata _assets) external;

    /**
     * @notice Sets the offset for liquidation.
     * @dev Cancels out the specified debt against the debt tokens contained in the
     * Stability Pool (as far as possible)
     * and transfers the TrenBox's collateral from TrenBoxStorage to Stability Pool.
     * Only called by liquidation functions in the TrenBoxManager.
     * @param _debtToOffset The amount of debt tokens to offset.
     * @param _asset The address of collateral asset.
     * @param _amountAdded The amount of collateral asset to be added.
     */
    function offset(uint256 _debtToOffset, address _asset, uint256 _amountAdded) external;
}
