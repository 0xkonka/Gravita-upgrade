// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ICollSurplusPool } from "./Interfaces/ICollSurplusPool.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";
import { SafetyTransfer } from "./Dependencies/SafetyTransfer.sol";

contract CollSurplusPool is
    UUPSUpgradeable,
    OwnableUpgradeable,
    ICollSurplusPool,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    string public constant NAME = "CollSurplusPool";

    mapping(address collateral => uint256 balance) internal collateralBalances;
    mapping(address user => mapping(address collateral => uint256 balance)) internal userBalances;

    // --- modifiers ---

    modifier onlyBorrowerOperations() {
        if (msg.sender != borrowerOperations) {
            revert CollSurplusPool__NotBorrowerOperations();
        }
        _;
    }

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert CollSurplusPool__NotTrenBoxManager();
        }
        _;
    }

    modifier onlyActivePool() {
        if (msg.sender != activePool) {
            revert CollSurplusPool__NotActivePool();
        }
        _;
    }

    // --- Initializer ---

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    function getAssetBalance(address _asset) external view override returns (uint256) {
        return collateralBalances[_asset];
    }

    function getCollateral(
        address _asset,
        address _account
    )
        external
        view
        override
        returns (uint256)
    {
        return userBalances[_account][_asset];
    }

    // --- Pool functionality ---

    function accountSurplus(
        address _asset,
        address _account,
        uint256 _amount
    )
        external
        override
        onlyTrenBoxManager
    {
        mapping(address => uint256) storage userBalance = userBalances[_account];
        uint256 newAmount = userBalance[_asset] + _amount;
        userBalance[_asset] = newAmount;

        emit CollBalanceUpdated(_account, newAmount);
    }

    function claimColl(address _asset, address _account) external override onlyBorrowerOperations {
        mapping(address => uint256) storage userBalance = userBalances[_account];
        uint256 claimableColl = userBalance[_asset];

        uint256 safetyTransferclaimableColl =
            SafetyTransfer.decimalsCorrection(_asset, claimableColl);

        if (safetyTransferclaimableColl == 0) {
            revert CollSurplusPool__NoClaimableColl();
        }

        userBalance[_asset] = 0;
        emit CollBalanceUpdated(_account, 0);

        collateralBalances[_asset] = collateralBalances[_asset] - claimableColl;
        emit AssetSent(_account, safetyTransferclaimableColl);

        IERC20(_asset).safeTransfer(_account, safetyTransferclaimableColl);
    }

    function receivedERC20(address _asset, uint256 _amount) external override onlyActivePool {
        collateralBalances[_asset] = collateralBalances[_asset] + _amount;
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
