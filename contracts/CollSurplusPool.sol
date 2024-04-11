// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";
import { SafetyTransfer } from "./Dependencies/SafetyTransfer.sol";
import { ICollSurplusPool } from "./Interfaces/ICollSurplusPool.sol";

contract CollSurplusPool is
    UUPSUpgradeable,
    OwnableUpgradeable,
    ICollSurplusPool,
    ConfigurableAddresses
{
    using SafeERC20 for IERC20;

    string public constant NAME = "CollSurplusPool";

    // deposited ether tracker
    mapping(address collateral => uint256 collateralBalances) internal balances;
    // Collateral surplus claimable by trenBox owners
    mapping(address user => mapping(address => uint256)) internal userBalances;

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

    /**
     * @notice Returns the Asset state variable at ActivePool address.
     * Not necessarily equal to the raw ether balance - ether can be forcibly sent to contracts.
     */
    function getAssetBalance(address _asset) external view override returns (uint256) {
        return balances[_asset];
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
        uint256 claimableCollEther = userBalance[_asset];

        uint256 safetyTransferclaimableColl =
            SafetyTransfer.decimalsCorrection(_asset, claimableCollEther);

        if (safetyTransferclaimableColl == 0) {
            revert CollSurplusPool__NoClaimableColl();
        }

        userBalance[_asset] = 0;
        emit CollBalanceUpdated(_account, 0);

        balances[_asset] = balances[_asset] - claimableCollEther;
        emit AssetSent(_account, safetyTransferclaimableColl);

        IERC20(_asset).safeTransfer(_account, safetyTransferclaimableColl);
    }

    function receivedERC20(address _asset, uint256 _amount) external override onlyActivePool {
        balances[_asset] = balances[_asset] + _amount;
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
