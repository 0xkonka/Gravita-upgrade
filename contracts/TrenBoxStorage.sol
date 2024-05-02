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

contract TrenBoxStorage is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    ITrenBoxStorage,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    string public constant NAME = "TrenBoxStorage";

    mapping(address collateral => Balance) internal collateralBalances;
    mapping(address collateral => Balance) internal debtBalances;

    // ------------------------------------------ Modifiers ---------------------------------------

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert TrenBoxStorage__NotAuthorizedContract();
        }
        _;
    }

    modifier onlyBorrowerOperationsOrTrenBoxManager() {
        if (msg.sender != borrowerOperations && msg.sender != trenBoxManager) {
            revert TrenBoxStorage__NotAuthorizedContract();
        }
        _;
    }

    modifier onlyAuthorizedProtocolContracts() {
        if (
            msg.sender != borrowerOperations && msg.sender != stabilityPool
                && msg.sender != trenBoxManager && msg.sender != trenBoxManagerOperations
        ) {
            revert TrenBoxStorage__NotAuthorizedContract();
        }
        _;
    }

    // ------------------------------------------ Initializer -------------------------------------

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

    // ------------------------------------------ External functions ------------------------------

    function increaseActiveDebt(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyBorrowerOperationsOrTrenBoxManager
    {
        uint256 newDebt = debtBalances[_collateral].active + _amount;
        debtBalances[_collateral].active = newDebt;
        emit ActiveDebtBalanceUpdated(_collateral, newDebt);
    }

    function decreaseActiveDebt(
        address _asset,
        uint256 _amount
    )
        external
        override
        onlyAuthorizedProtocolContracts
    {
        uint256 newDebt = debtBalances[_asset].active - _amount;
        debtBalances[_asset].active = newDebt;
        emit ActiveDebtBalanceUpdated(_asset, newDebt);
    }

    function increaseLiquidatedDebt(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManager
    {
        uint256 newDebt = debtBalances[_collateral].liquidated + _amount;
        debtBalances[_collateral].liquidated = newDebt;
        emit LiquidatedDebtBalanceUpdated(_collateral, newDebt);
    }

    function decreaseLiquidatedDebt(
        address _collateral,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManager
    {
        uint256 newDebt = debtBalances[_collateral].liquidated - _amount;
        debtBalances[_collateral].liquidated = newDebt;
        emit LiquidatedDebtBalanceUpdated(_collateral, newDebt);
    }

    function increaseActiveCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        onlyBorrowerOperationsOrTrenBoxManager
    {
        uint256 newBalance = collateralBalances[_collateral].active + _amount;
        collateralBalances[_collateral].active = newBalance;
        emit ActiveCollateralBalanceUpdated(_collateral, newBalance);
    }

    function decreaseActiveCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        onlyTrenBoxManager
    {
        uint256 newBalance = collateralBalances[_collateral].active - _amount;
        collateralBalances[_collateral].active = newBalance;
        emit ActiveCollateralBalanceUpdated(_collateral, newBalance);
    }

    function increaseLiquidatedCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        onlyTrenBoxManager
    {
        uint256 newBalance = collateralBalances[_collateral].liquidated + _amount;
        collateralBalances[_collateral].liquidated = newBalance;
        emit LiquidatedCollateralBalanceUpdated(_collateral, newBalance);
    }

    function decreaseLiquidatedCollateral(
        address _collateral,
        uint256 _amount
    )
        external
        onlyTrenBoxManager
    {
        uint256 newBalance = collateralBalances[_collateral].liquidated - _amount;
        collateralBalances[_collateral].liquidated = newBalance;
        emit LiquidatedCollateralBalanceUpdated(_collateral, newBalance);
    }

    function sendAsset(
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

        this.decreaseActiveCollateral(_collateral, _amount);

        IERC20(_collateral).safeTransfer(_account, safetyTransferAmount);

        if (isERC20DepositContract(_account)) {
            IDeposit(_account).receivedERC20(_collateral, _amount);
        }

        emit CollateralSent(_account, _collateral, safetyTransferAmount);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    // ------------------------------------------ Private/internal functions ----------------------

    function _authorizeUpgrade(address) internal override onlyOwner { }

    function isERC20DepositContract(address _account) private view returns (bool) {
        return (_account == collSurplusPool || _account == stabilityPool);
    }
}
