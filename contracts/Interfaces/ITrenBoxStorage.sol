// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ITrenBoxStorage {
    /// @dev Struct for storing debt balances.
    /// @param active The entire debt of all active TrenBoxes.
    /// @param liquidated The entire debt of all liquidated TrenBoxes.
    struct DebtBalances {
        uint256 active;
        uint256 liquidated;
    }

    /// @dev Struct for storing collateral balances.
    /// @param active The entire collateral amount of all active TrenBoxes.
    /// @param liquidated The entire collateral amount of all liquidated TrenBoxes.
    /// @param claimable The entire collateral amount of all liquidated TrenBoxes that can be
    /// claimed by user.
    struct CollBalances {
        uint256 active;
        uint256 liquidated;
        uint256 claimable;
    }

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
     * @param _to The recipient address.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount of collateral sent.
     */
    event CollateralSent(address indexed _to, address indexed _collateral, uint256 _amount);

    /**
     * @dev Emitted when the user claimable collateral balance is updated.
     * @param _account The account address.
     * @param _collateral The address of the collateral asset.
     * @param _newBalance The new user claimable collateral balance.
     */
    event UserClaimableCollateralBalanceUpdated(
        address indexed _account, address indexed _collateral, uint256 _newBalance
    );

    /**
     * @dev Error emitted when contract is not authorized.
     */
    error TrenBoxStorage__NotAuthorizedContract();

    /**
     * @dev Error emitted when only TrenBox manager can perform an operation.
     */
    error TrenBoxStorage__TrenBoxManagerOnly();

    /**
     * @dev Error emitted when only borrower operations are allowed.
     */
    error TrenBoxStorage__BorrowerOperationsOnly();

    /**
     * @dev Error emitted when only borrower operations or TrenBox manager can perform an operation.
     */
    error TrenBoxStorage__BorrowerOperationsOrTrenBoxManagerOnly();

    /**
     * @dev Error emitted when only TrenBox manager or TrenBox manager operations are allowed.
     */
    error TrenBoxStorage__TrenBoxManagerOperationsOnly();

    /**
     * @dev Error emitted when there is no claimable collateral available.
     */
    error TrenBoxStorage__NoClaimableCollateral();

    /**
     * @notice Returns the active collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     */
    function getActiveCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the active debt balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     */
    function getActiveDebtBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the liquidated collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     */
    function getLiquidatedCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the liquidated debt balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     */
    function getLiquidatedDebtBalance(address _collateral) external view returns (uint256);

    function getTotalDebtBalance(address _collateral) external view returns (uint256);

    function getTotalCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the claimable collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     */
    function getClaimableCollateralBalance(address _collateral) external view returns (uint256);

    /**
     * @notice Returns the claimable collateral balance for a specific collateral and user.
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
     * @notice Increases the active debt balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the debt balance.
     */
    function increaseActiveDebt(address _collateral, uint256 _amount) external;

    /**
     * @notice Decreases the active debt balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to decrease the debt balance.
     */
    function decreaseActiveDebt(address _collateral, uint256 _amount) external;

    function decreaseActiveBalancesAfterRedemption(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount
    )
        external;

    /**
     * @notice Increases the active collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the debt balance.
     */
    function increaseActiveCollateral(address _collateral, uint256 _amount) external;

    /**
     * @notice Decreases the active collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to decrease the collateral balance.
     */
    function decreaseActiveCollateral(address _collateral, uint256 _amount) external;

    function updateDebtAndCollateralBalances(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount,
        bool _isActiveIncrease
    )
        external;

    function updateUserAndEntireClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external;

    /**
     * @notice Increases the claimable collateral balance for a specific collateral.
     * @param _collateral The address of the collateral asset.
     * @param _amount The amount to increase the claimable collateral balance.
     */
    function increaseClaimableCollateral(address _collateral, uint256 _amount) external;

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
