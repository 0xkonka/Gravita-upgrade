// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { SafetyTransfer } from "./Dependencies/SafetyTransfer.sol";
import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";

import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";
import { IDeposit } from "./Interfaces/IDeposit.sol";

/// @title TrenboxStorage
/// @notice A contract storage of the collateral amount, debt and gas compensation for each
/// TrenBox.
contract TrenBoxStorage is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    ITrenBoxStorage,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    /// @notice The contract name.
    string public constant NAME = "TrenBoxStorage";

    /// @notice The balances of each collateral asset in the storage.
    mapping(address collateral => CollBalances) internal collateralBalances;

    /// @notice The balances of each debt in the storage.
    mapping(address collateral => DebtBalances) internal debtBalances;

    /// @notice The balances of each collateral asset that the user can claim from storage.
    mapping(address user => mapping(address collateral => uint256 balance)) internal
        userClaimableCollateralBalances;

    // ------------------------------------------ Modifiers ---------------------------------------

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert TrenBoxStorage__TrenBoxManagerOnly();
        }
        _;
    }

    modifier onlyBorrowerOperations() {
        if (msg.sender != borrowerOperations) {
            revert TrenBoxStorage__BorrowerOperationsOnly();
        }
        _;
    }

    modifier onlyTrenBoxManagerOperations() {
        if (msg.sender != trenBoxManagerOperations) {
            revert TrenBoxStorage__TrenBoxManagerOperationsOnly();
        }
        _;
    }

    modifier onlyBorrowerOperationsOrTrenBoxManager() {
        if (msg.sender != borrowerOperations && msg.sender != trenBoxManager) {
            revert TrenBoxStorage__BorrowerOperationsOrTrenBoxManagerOnly();
        }
        _;
    }

    modifier onlyAuthorizedProtocolContracts() {
        if (
            msg.sender != borrowerOperations && msg.sender != stabilityPool
                && msg.sender != trenBoxManager
        ) {
            revert TrenBoxStorage__NotAuthorizedContract();
        }
        _;
    }

    // ------------------------------------------ Initializer -------------------------------------

    /// @dev Sets an intiial owner for the contract.
    /// @param initialOwner The address of initial owner.
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    // ------------------------------------------ Getters -----------------------------------------

    /// @inheritdoc ITrenBoxStorage
    function getActiveCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].active;
    }

    /// @inheritdoc ITrenBoxStorage
    function getActiveDebtBalance(address _collateral) external view override returns (uint256) {
        return debtBalances[_collateral].active;
    }

    /// @inheritdoc ITrenBoxStorage
    function getLiquidatedCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].liquidated;
    }

    /// @inheritdoc ITrenBoxStorage
    function getLiquidatedDebtBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return debtBalances[_collateral].liquidated;
    }

    /// @inheritdoc ITrenBoxStorage
    function getTotalDebtBalance(address _collateral) external view override returns (uint256) {
        DebtBalances storage balances = debtBalances[_collateral];
        return balances.active + balances.liquidated;
    }

    /// @inheritdoc ITrenBoxStorage
    function getTotalCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        CollBalances storage balances = collateralBalances[_collateral];
        return balances.active + balances.liquidated;
    }

    /// @inheritdoc ITrenBoxStorage
    function getClaimableCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].claimable;
    }

    /// @inheritdoc ITrenBoxStorage
    function getUserClaimableCollateralBalance(
        address _collateral,
        address _account
    )
        external
        view
        override
        returns (uint256)
    {
        return userClaimableCollateralBalances[_account][_collateral];
    }

    // ------------------------------------------ External functions ------------------------------

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by BorrowerOperations contract
    function increaseActiveDebt(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyBorrowerOperations
    {
        _updateActiveDebt(_collateral, _amount, true);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by BorrowerOperations or TrenBoxManager or StabilityPool contracts
    function decreaseActiveDebt(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyAuthorizedProtocolContracts
    {
        _updateActiveDebt(_collateral, _amount, false);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManager contract
    function decreaseActiveBalancesAfterRedemption(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount
    )
        external
        override
        onlyTrenBoxManager
    {
        _updateActiveDebt(_collateral, _debtAmount, false);
        _updateActiveCollateral(_collateral, _collAmount, false);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by BorrowerOperations contract
    function increaseActiveCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyBorrowerOperations
    {
        _updateActiveCollateral(_collateral, _amount, true);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManagerOperations contract
    function decreaseActiveCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _updateActiveCollateral(_collateral, _amount, false);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManager contract
    function updateDebtAndCollateralBalances(
        address _collateral,
        uint256 _debtAmount,
        uint256 _collAmount,
        bool _isActiveIncrease
    )
        external
        override
        onlyTrenBoxManager
    {
        DebtBalances storage _debtBalances = debtBalances[_collateral];
        CollBalances storage _collateralBalances = collateralBalances[_collateral];
        uint256 newLiquidatedDebt;
        uint256 newLiquidatedColl;

        if (_isActiveIncrease) {
            _updateActiveDebt(_collateral, _debtAmount, true);
            newLiquidatedDebt = _debtBalances.liquidated - _debtAmount;
            _updateActiveCollateral(_collateral, _collAmount, true);
            newLiquidatedColl = _collateralBalances.liquidated - _collAmount;
        } else {
            _updateActiveDebt(_collateral, _debtAmount, false);
            newLiquidatedDebt = _debtBalances.liquidated + _debtAmount;
            _updateActiveCollateral(_collateral, _collAmount, false);
            newLiquidatedColl = _collateralBalances.liquidated + _collAmount;
        }

        _debtBalances.liquidated = newLiquidatedDebt;

        emit LiquidatedDebtBalanceUpdated(_collateral, newLiquidatedDebt);

        _collateralBalances.liquidated = newLiquidatedColl;

        emit LiquidatedCollateralBalanceUpdated(_collateral, newLiquidatedColl);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManager contract
    function updateUserAndEntireClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManager
    {
        _updateClaimableCollateral(_collateral, _amount, true);
        _updateUserClaimableBalance(_collateral, _account, _amount);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManagerOperations contract
    function increaseClaimableCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _updateClaimableCollateral(_collateral, _amount, true);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by TrenBoxManagerOperations contract
    function updateUserClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManagerOperations
    {
        _updateUserClaimableBalance(_collateral, _account, _amount);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by BorrowerOperations or TrenBoxManager or StabilityPool contract
    function sendCollateral(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external
        override
        nonReentrant
        onlyAuthorizedProtocolContracts
    {
        uint256 safetyTransferAmount = SafetyTransfer.decimalsCorrection(_collateral, _amount);
        if (safetyTransferAmount == 0) return;

        _updateActiveCollateral(_collateral, _amount, false);

        IERC20(_collateral).safeTransfer(_account, safetyTransferAmount);

        if (isStabilityPool(_account)) {
            IDeposit(_account).receivedERC20(_collateral, _amount);
        }

        emit CollateralSent(_account, _collateral, safetyTransferAmount);
    }

    /// @inheritdoc ITrenBoxStorage
    /// @dev Can only be called by BorrowerOperations contract
    function claimCollateral(
        address _collateral,
        address _account
    )
        external
        override
        onlyBorrowerOperations
    {
        mapping(address => uint256) storage userBalance = userClaimableCollateralBalances[_account];
        uint256 claimableColl = userBalance[_collateral];

        uint256 safetyTransferAmount = SafetyTransfer.decimalsCorrection(_collateral, claimableColl);
        if (safetyTransferAmount == 0) {
            revert TrenBoxStorage__NoClaimableCollateral();
        }
        userBalance[_collateral] = 0;

        emit UserClaimableCollateralBalanceUpdated(_account, _collateral, 0);

        _updateClaimableCollateral(_collateral, claimableColl, false);

        IERC20(_collateral).safeTransfer(_account, safetyTransferAmount);
    }

    function authorizeUpgrade(address _newImplementation) public {
        _authorizeUpgrade(_newImplementation);
    }

    // ------------------------------------------ Private/internal functions ----------------------

    /**
     * @dev Updates active debt balance for a specific collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _amount The number of debt to update.
     * @param _isIncrease The indicator that shows increasing or decreasing of active debt balance.
     */
    function _updateActiveDebt(address _collateral, uint256 _amount, bool _isIncrease) private {
        DebtBalances storage _debtBalances = debtBalances[_collateral];
        uint256 newDebt;

        if (_isIncrease) newDebt = _debtBalances.active + _amount;
        else newDebt = _debtBalances.active - _amount;
        _debtBalances.active = newDebt;

        emit ActiveDebtBalanceUpdated(_collateral, newDebt);
    }

    /**
     * @dev Updates active balance for a specific collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _amount The number of collateral to update.
     * @param _isIncrease The indicator that shows increasing or decreasing of active balance.
     */
    function _updateActiveCollateral(
        address _collateral,
        uint256 _amount,
        bool _isIncrease
    )
        private
    {
        CollBalances storage _collateralBalances = collateralBalances[_collateral];
        uint256 newColl;

        if (_isIncrease) newColl = _collateralBalances.active + _amount;
        else newColl = _collateralBalances.active - _amount;
        _collateralBalances.active = newColl;

        emit ActiveCollateralBalanceUpdated(_collateral, newColl);
    }

    /**
     * @dev Updates entire claimable balance for a specific collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _amount The number of collateral to update.
     * @param _isIncrease The indicator that shows increasing or decreasing of entire claimable
     * balance.
     */
    function _updateClaimableCollateral(
        address _collateral,
        uint256 _amount,
        bool _isIncrease
    )
        private
    {
        CollBalances storage _collateralBalances = collateralBalances[_collateral];
        uint256 newBalance;

        if (_isIncrease) newBalance = _collateralBalances.claimable + _amount;
        else newBalance = _collateralBalances.claimable - _amount;
        _collateralBalances.claimable = newBalance;

        emit ClaimableCollateralBalanceUpdated(_collateral, newBalance);
    }

    /**
     * @dev Updates user claimable balance for a specific collateral asset.
     * @param _collateral The address of collateral asset.
     * @param _account The address of the caller.
     * @param _amount The number of collateral to update.
     */
    function _updateUserClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        private
    {
        mapping(address => uint256) storage userBalance = userClaimableCollateralBalances[_account];
        uint256 newAmount = userBalance[_collateral] + _amount;
        userBalance[_collateral] = newAmount;

        emit UserClaimableCollateralBalanceUpdated(_account, _collateral, newAmount);
    }

    /**
     * @dev Checks if caller is a Stability Pool contract.
     * @param _account The address of the caller.
     * @return The boolean value indicating whether the operation succeeded.
     */
    function isStabilityPool(address _account) private view returns (bool) {
        return _account == stabilityPool;
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
