// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { Addresses } from "./Addresses.sol";
import { IActivePool } from "./Interfaces/IActivePool.sol";
import { IDeposit } from "./Interfaces/IDeposit.sol";

/*
 * The Active Pool holds the collaterals and debt amounts for all active trenBoxes.
 *
* When a trenBox is liquidated, it's collateral and debt tokens are transferred from the Active
Pool,
to either the
 * Stability Pool, the Default Pool, or both, depending on the liquidation conditions.
 *
 */
contract ActivePool is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ReentrancyGuardUpgradeable,
    IActivePool,
    Addresses
{
    using SafeERC20 for IERC20;

    string public constant NAME = "ActivePool";

    mapping(address => uint256) internal assetsBalances;
    mapping(address => uint256) internal debtTokenBalances;

    // --- Modifiers ---

    modifier callerIsBorrowerOpsOrDefaultPool() {
        require(
            msg.sender == borrowerOperations || msg.sender == defaultPool,
            "ActivePool: Caller is not an authorized Tren contract"
        );
        _;
    }

    modifier callerIsBorrowerOpsOrTrenBoxMgr() {
        require(
            msg.sender == borrowerOperations || msg.sender == trenBoxManager,
            "ActivePool: Caller is not an authorized Tren contract"
        );
        _;
    }

    modifier callerIsBorrowerOpsOrStabilityPoolOrTrenBoxMgr() {
        require(
            msg.sender == borrowerOperations || msg.sender == stabilityPool
                || msg.sender == trenBoxManager,
            "ActivePool: Caller is not an authorized Tren contract"
        );
        _;
    }

    modifier callerIsBorrowerOpsOrStabilityPoolOrTrenBoxMgrOrTrenBoxMgrOps() {
        require(
            msg.sender == borrowerOperations || msg.sender == stabilityPool
                || msg.sender == trenBoxManager || msg.sender == trenBoxManagerOperations,
            "ActivePool: Caller is not an authorized Tren contract"
        );
        _;
    }

    // --- Initializer ---

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
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
        address _collateral,
        uint256 _amount
    )
        external
        override
        callerIsBorrowerOpsOrTrenBoxMgr
    {
        uint256 newDebt = debtTokenBalances[_collateral] + _amount;
        debtTokenBalances[_collateral] = newDebt;
        emit ActivePoolDebtUpdated(_collateral, newDebt);
    }

    function decreaseDebt(
        address _asset,
        uint256 _amount
    )
        external
        override
        callerIsBorrowerOpsOrStabilityPoolOrTrenBoxMgr
    {
        uint256 newDebt = debtTokenBalances[_asset] - _amount;
        debtTokenBalances[_asset] = newDebt;
        emit ActivePoolDebtUpdated(_asset, newDebt);
    }

    // --- Pool functionality ---

    function sendAsset(
        address _asset,
        address _account,
        uint256 _amount
    )
        external
        override
        nonReentrant
        callerIsBorrowerOpsOrStabilityPoolOrTrenBoxMgrOrTrenBoxMgrOps
    {
        if (_amount == 0) return;

        uint256 newBalance = assetsBalances[_asset] - _amount;
        assetsBalances[_asset] = newBalance;

        IERC20(_asset).safeTransfer(_account, _amount);

        if (isERC20DepositContract(_account)) {
            IDeposit(_account).receivedERC20(_asset, _amount);
        }

        emit ActivePoolAssetBalanceUpdated(_asset, newBalance);
        emit AssetSent(_account, _asset, _amount);
    }

    function isERC20DepositContract(address _account) private view returns (bool) {
        return (_account == defaultPool || _account == collSurplusPool || _account == stabilityPool);
    }

    function receivedERC20(
        address _asset,
        uint256 _amount
    )
        external
        override
        callerIsBorrowerOpsOrDefaultPool
    {
        uint256 newBalance = assetsBalances[_asset] + _amount;
        assetsBalances[_asset] = newBalance;
        emit ActivePoolAssetBalanceUpdated(_asset, newBalance);
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
