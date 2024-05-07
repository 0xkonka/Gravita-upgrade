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

/// @title A contract storage of the collateral amount, debt and gas compensation for each
/// TrenBox.
contract TrenBoxStorage is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    ITrenBoxStorage,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    /// @notice A contract name.
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
    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __UUPSUpgradeable_init();
    }

    // ------------------------------------------ Getters -----------------------------------------

    function getActiveCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].active;
    }

    function getActiveDebtBalance(address _collateral) external view override returns (uint256) {
        return debtBalances[_collateral].active;
    }

    function getLiquidatedCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].liquidated;
    }

    function getLiquidatedDebtBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return debtBalances[_collateral].liquidated;
    }

    function getTotalDebtBalance(address _collateral) external view override returns (uint256) {
        return debtBalances[_collateral].active + debtBalances[_collateral].liquidated;
    }

    function getTotalCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].active + collateralBalances[_collateral].liquidated;
    }

    function getClaimableCollateralBalance(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralBalances[_collateral].claimable;
    }

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
        uint256 newLiquidatedDebt;
        uint256 newLiquidatedColl;
        if (_isActiveIncrease) {
            _updateActiveDebt(_collateral, _debtAmount, true);
            newLiquidatedDebt = debtBalances[_collateral].liquidated - _debtAmount;
            _updateActiveCollateral(_collateral, _collAmount, true);
            newLiquidatedColl = collateralBalances[_collateral].liquidated - _collAmount;
        } else {
            _updateActiveDebt(_collateral, _debtAmount, false);
            newLiquidatedDebt = debtBalances[_collateral].liquidated + _debtAmount;
            _updateActiveCollateral(_collateral, _collAmount, false);
            newLiquidatedColl = collateralBalances[_collateral].liquidated + _collAmount;
        }

        debtBalances[_collateral].liquidated = newLiquidatedDebt;
        emit LiquidatedDebtBalanceUpdated(_collateral, newLiquidatedDebt);

        collateralBalances[_collateral].liquidated = newLiquidatedColl;
        emit LiquidatedCollateralBalanceUpdated(_collateral, newLiquidatedColl);
    }

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

    function _updateActiveDebt(address _collateral, uint256 _amount, bool _isIncrease) private {
        uint256 newDebt;
        if (_isIncrease) newDebt = debtBalances[_collateral].active + _amount;
        else newDebt = debtBalances[_collateral].active - _amount;

        debtBalances[_collateral].active = newDebt;
        emit ActiveDebtBalanceUpdated(_collateral, newDebt);
    }

    function _updateActiveCollateral(
        address _collateral,
        uint256 _amount,
        bool _isIncrease
    )
        private
    {
        uint256 newColl;
        if (_isIncrease) newColl = collateralBalances[_collateral].active + _amount;
        else newColl = collateralBalances[_collateral].active - _amount;

        collateralBalances[_collateral].active = newColl;
        emit ActiveCollateralBalanceUpdated(_collateral, newColl);
    }

    function _updateClaimableCollateral(
        address _collateral,
        uint256 _amount,
        bool _isIncrease
    )
        private
    {
        uint256 newBalance;
        if (_isIncrease) newBalance = collateralBalances[_collateral].claimable + _amount;
        else newBalance = collateralBalances[_collateral].claimable - _amount;

        collateralBalances[_collateral].claimable = newBalance;
        emit ClaimableCollateralBalanceUpdated(_collateral, newBalance);
    }

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

    /// @dev Checks if caller is a Stability Pool contract
    /// @return A boolean value indicating whether the operation succeeded.
    function isStabilityPool(address _account) private view returns (bool) {
        return (_account == stabilityPool);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
