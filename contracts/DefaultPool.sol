// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";
import { SafetyTransfer } from "./Dependencies/SafetyTransfer.sol";
import { IDefaultPool } from "./Interfaces/IDefaultPool.sol";
import { IDeposit } from "./Interfaces/IDeposit.sol";

/**
 * @notice The Default Pool holds the collateral and debt token amounts from liquidations that have
 * been redistributed to active trenBoxes
 * but not yet "applied", i.e. not yet recorded on a recipient active trenBox's struct.
 *
 * When a trenBox makes an operation that applies to its pending collateral and debt, they are moved
 * from the Default Pool to the Active Pool.
 */
contract DefaultPool is OwnableUpgradeable, UUPSUpgradeable, IDefaultPool, ConfigurableAddresses {
    using SafeERC20 for IERC20;

    string public constant NAME = "DefaultPool";

    mapping(address asset => uint256 balance) internal assetsBalances;
    mapping(address asset => uint256 balance) internal debtTokenBalances;

    // --- modifiers ---

    modifier callerIsActivePool() {
        if (msg.sender != activePool) {
            revert DefaultPool__NotActivePool();
        }
        _;
    }

    modifier callerIsTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert DefaultPool__NotTrenBoxManager();
        }
        _;
    }

    // --- Initializer ---

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // --- Getters for public variables. Required by IPool interface ---

    function getAssetBalance(address _asset) external view override returns (uint256) {
        return assetsBalances[_asset];
    }

    function getDebtTokenBalance(address _asset) external view override returns (uint256) {
        return debtTokenBalances[_asset];
    }

    function increaseDebt(
        address _asset,
        uint256 _amount
    )
        external
        override
        callerIsTrenBoxManager
    {
        uint256 newDebt = debtTokenBalances[_asset] + _amount;
        debtTokenBalances[_asset] = newDebt;
        emit DefaultPoolDebtUpdated(_asset, newDebt);
    }

    function decreaseDebt(
        address _asset,
        uint256 _amount
    )
        external
        override
        callerIsTrenBoxManager
    {
        uint256 newDebt = debtTokenBalances[_asset] - _amount;
        debtTokenBalances[_asset] = newDebt;
        emit DefaultPoolDebtUpdated(_asset, newDebt);
    }

    // --- Pool functionality ---

    function sendAssetToActivePool(
        address _asset,
        uint256 _amount
    )
        external
        override
        callerIsTrenBoxManager
    {
        uint256 safetyTransferAmount = SafetyTransfer.decimalsCorrection(_asset, _amount);
        if (safetyTransferAmount == 0) {
            return;
        }

        uint256 newBalance = assetsBalances[_asset] - _amount;
        assetsBalances[_asset] = newBalance;

        IERC20(_asset).safeTransfer(activePool, safetyTransferAmount);
        IDeposit(activePool).receivedERC20(_asset, _amount);

        emit DefaultPoolAssetBalanceUpdated(_asset, newBalance);
        emit AssetSent(activePool, _asset, safetyTransferAmount);
    }

    function receivedERC20(address _asset, uint256 _amount) external callerIsActivePool {
        uint256 newBalance = assetsBalances[_asset] + _amount;
        assetsBalances[_asset] = newBalance;
        emit DefaultPoolAssetBalanceUpdated(_asset, newBalance);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
