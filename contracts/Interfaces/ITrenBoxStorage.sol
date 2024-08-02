// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

/**
 * @title ITrenBoxStorage
 * @notice Defines the basic interface for TrenBoxStorage contract.
 */
interface ITrenBoxStorage {
    // ------------------------------------------ Structs -----------------------------------------

    /// @dev Struct for storing debt balances of a specific collateral asset.
    /// @param active The entire debt of all active TrenBoxes.
    /// @param liquidated The entire debt of all liquidated TrenBoxes.
    struct DebtBalances {
        uint256 active;
        uint256 liquidated;
    }

    /// @dev Struct for storing balances of a specific collateral asset.
    /// @param active The entire collateral amount of all active TrenBoxes.
    /// @param liquidated The entire collateral amount of all liquidated TrenBoxes.
    /// @param claimable The entire collateral amount of all liquidated TrenBoxes that can be
    /// claimed by user.
    struct CollBalances {
        uint256 active;
        uint256 liquidated;
        uint256 claimable;
    }

    // ------------------------------------------ Events ------------------------------------------

    /**
     * @dev Emitted when the active collateral balance is updated.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new active collateral balance.
     */
    event ActiveCollateralBalanceUpdated(address indexed _collateral, uint256 _newBalance);

    /**
     * @dev Emitted when the active debt balance is updated.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new active debt balance.
     */
    event ActiveDebtBalanceUpdated(address indexed _collateral, uint256 _newBalance);

    /**
     * @dev Emitted when the liquidated collateral balance is updated.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new liquidated collateral balance.
     */
    event LiquidatedCollateralBalanceUpdated(address indexed _collateral, uint256 _newBalance);

    /**
     * @dev Emitted when the liquidated debt balance is updated.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new liquidated debt balance.
     */
    event LiquidatedDebtBalanceUpdated(address indexed _collateral, uint256 _newBalance);

    /**
     * @dev Emitted when the claimable collateral balance is updated.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new claimable collateral balance.
     */
    event ClaimableCollateralBalanceUpdated(address indexed _collateral, uint256 _newBalance);

    /**
     * @dev Emitted when collateral is sent.
     * @param _to The address of the user which get collateral amount.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount of collateral sent.
     */
    event CollateralSent(address indexed _to, address indexed _collateral, uint256 _amount);

    /**
     * @dev Emitted when the user claimable collateral balance is updated.
     * @param _account The address of the user.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new user claimable collateral balance.
     */
    event UserClaimableCollateralBalanceUpdated(
        address indexed _account, address indexed _collateral, uint256 _newBalance
    );

    // ------------------------------------------ Custom Errors -----------------------------------

    /**
     * @dev Thrown when contract is not authorized.
     */
    error TrenBoxStorage__NotAuthorizedContract();

    /**
     * @dev Thrown when caller is not TrenBoxManager contract.
     */
    error TrenBoxStorage__TrenBoxManagerOnly();

    /**
     * @dev Thrown when caller is not BorrowerOperations contract.
     */
    error TrenBoxStorage__BorrowerOperationsOnly();

    /**
     * @dev Thrown when caller is not BorrowerOperations nor TrenBoxManager contract.
     */
    error TrenBoxStorage__BorrowerOperationsOrTrenBoxManagerOnly();

    /**
     * @dev Thrown when caller is not TrenBoxManagerOperations contract.
     */
    error TrenBoxStorage__TrenBoxManagerOperationsOnly();

    /**
     * @dev Thrown when there is no claimable collateral available.
     */
    error TrenBoxStorage__NoClaimableCollateral();

    // ------------------------------------------ Functions ---------------------------------------

    /**
     * @notice Returns the active collateral balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getActiveCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the active debt balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getActiveDebtBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the liquidated collateral balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getLiquidatedCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the liquidated debt balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getLiquidatedDebtBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns sum of active and liquidated debt for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getTotalDebtBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns sum of active and liquidated amount of a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getTotalCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the claimable collateral balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     */
    function getClaimableCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the claimable collateral balance for a specific user.
     * @param _collateral The address of the collateral asset.
     * @param _account The address of the user.
     */
    function getUserClaimableCollateralBalance(
        address _collateral,
        address _account
    )
        external
        view
        returns (uint256);

    /**
     * @notice Increases the active debt balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the debt balance.
     */
    function increaseActiveDebt(address _collateral, uint256 _amount) external;

    /**
     * @notice Decreases the active debt balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to decrease the debt balance.
     */
    function decreaseActiveDebt(address _collateral, uint256 _amount) external;

    /**
     * @notice Decreases the active balances of debt and collateral for a specific collateral after
     * redemption exists.
     * @param _collateral The address of the collateral asset.
     * @param _debtAmount The amount to decrease the debt balance.
     * @param _collAmount The amount to decrease the collateral balance.
     */
    function decreaseActiveBalancesAfterRedemption(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount
    )
        external;

    /**
     * @notice Increases the active balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the debt balance.
     */
    function increaseActiveCollateral(address _collateral, uint256 _amount) external;

    /**
     * @notice Decreases the active balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to decrease the collateral balance.
     */
    function decreaseActiveCollateral(address _collateral, uint256 _amount) external;

    /**
     * @notice Updates the active and liquidated debt and collateral balances.
     * @param _collateral The address of the collateral asset.
     * @param _debtAmount The amount to decrease the debt balance.
     * @param _collAmount The amount to decrease the collateral balance.
     * @param _isActiveIncrease The indicator that shows increasing or decreasing of active
     * balances.
     */
    function updateDebtAndCollateralBalances(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount,
        bool _isActiveIncrease
    )
        external;

    /**
     * @notice Updates the entire and user claimable balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _account The address of the user.
     * @param _amount The amount to update the claimable balance.
     */
    function updateUserAndEntireClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external;

    /**
     * @notice Increases the claimable collateral balance for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the claimable collateral balance.
     */
    function increaseClaimableCollateral(address _collateral, uint256 _amount) external;

    /**
     * @notice Updates the claimable collateral balance of the user for a specific collateral asset.
     * @param _collateral The address of the collateral asset.
     * @param _account The address of the user.
     * @param _amount The amount to update the claimable balance.
     */
    function updateUserClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external;

    /**
     * @notice Sends amount of active collateral from contract to user.
     * @param _collateral The address of the collateral asset.
     * @param _account The address of the user to send.
     * @param _amount The amount of the collateral to send.
     */
    function sendCollateral(address _collateral, address _account, uint256 _amount) external;

    /**
     * @notice Sends amount of claimable collateral from contract to user.
     * @param _collateral The address of the collateral asset.
     * @param _account The address of the user to send.
     */
    function claimCollateral(address _collateral, address _account) external;
}
