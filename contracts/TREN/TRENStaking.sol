// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { ITRENStaking } from "../Interfaces/ITRENStaking.sol";

import { BaseMath } from "../Dependencies/BaseMath.sol";
import { TrenMath } from "../Dependencies/TrenMath.sol";
import { SafetyTransfer } from "../Dependencies/SafetyTransfer.sol";

contract TRENStaking is
    ITRENStaking,
    PausableUpgradeable,
    OwnableUpgradeable,
    BaseMath,
    ReentrancyGuardUpgradeable
{
    string public constant NAME = "TRENStaking";

    address public debtToken;
    address public feeCollector;
    address public treasury;
    address public trenBoxManager;
    IERC20 public trenToken;

    address[] public assetsList;

    uint256 private totalTRENStaked;
    uint256 private totalDebtTokenFee;

    mapping(address user => Snapshot) private snapshots;
    mapping(address user => uint256 amount) private stakes;
    mapping(address asset => bool tracked) private isAssetTracked;
    mapping(address user => uint256 assetFeeAmount) private assetsFee;
    mapping(address asset => uint256 sentToTreasury) private sentAssetFeeToTreasury;

    bool public isSetupInitialized;

    // ------------------------------------------ Modifiers ---------------------------------------

    modifier onlyFeeCollector() {
        if (msg.sender != feeCollector) {
            revert TRENStaking__OnlyFeeCollector(msg.sender, feeCollector);
        }
        _;
    }

    modifier isPaused(address _token, uint256 _amount) {
        if (paused()) {
            sendToTreasury(_token, _amount);
            revert TRENStaking__StakingOnPause();
        }
        _;
    }

    // ------------------------------------------ Initializer -------------------------------------

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        _pause();
    }

    // ------------------------------------------ External Functions ------------------------------
    function setAddresses(
        address _debtToken,
        address _feeCollector,
        address _trenToken,
        address _treasury
    )
        external
        onlyOwner
    {
        if (isSetupInitialized) revert TRENStaking__SetupAlreadyInitialized();
        if (
            _debtToken != address(0) || _feeCollector != address(0) || _trenToken != address(0)
                || _treasury != address(0)
        ) revert TRENStaking__InvalidAddresses();

        debtToken = _debtToken;
        feeCollector = _feeCollector;
        trenToken = IERC20(_trenToken);
        treasury = _treasury;

        isSetupInitialized = true;
    }

    function stake(uint256 _TRENamount) external nonReentrant whenNotPaused {
        if (_TRENamount == 0) revert TRENStaking__InvalidAmount(0);

        uint256 currentStake = stakes[msg.sender];
        uint256 assetLength = assetsList.length;
        uint256 assetGain;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = assetsList[i];

            if (currentStake != 0) {
                assetGain = _getPendingAssetGain(asset, msg.sender);

                if (i == 0) {
                    checkDebtTokenGain();
                }

                _sendAssetGainToUser(asset, assetGain);
                emit StakingAssetGainWithdrawn(msg.sender, asset, assetGain);
            }

            _updateUserSnapshots(asset, msg.sender);
        }

        uint256 newStake = currentStake + _TRENamount;
        stakes[msg.sender] = newStake;
        totalTRENStaked += _TRENamount;

        emit TotalTRENStakedUpdated(totalTRENStaked);

        trenToken.transferFrom(msg.sender, address(this), _TRENamount);

        emit StakeUpdated(msg.sender, newStake);
    }

    function unstake(uint256 _TRENamount) external nonReentrant {
        uint256 currentStake = stakes[msg.sender];
        if (currentStake == 0) revert TRENStaking__InvalidStakeAmount(0);

        uint256 assetLength = assetsList.length;
        uint256 assetGain;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = assetsList[i];

            assetGain = _getPendingAssetGain(asset, msg.sender);

            if (i == 0) {
                checkDebtTokenGain();
            }

            _updateUserSnapshots(asset, msg.sender);

            emit StakingAssetGainWithdrawn(msg.sender, asset, assetGain);

            _sendAssetGainToUser(asset, assetGain);
        }

        if (_TRENamount > 0) {
            uint256 trenToWithdraw = TrenMath._min(_TRENamount, currentStake);
            uint256 newStake = currentStake - trenToWithdraw;

            stakes[msg.sender] = newStake;
            totalTRENStaked = totalTRENStaked - trenToWithdraw;

            emit TotalTRENStakedUpdated(totalTRENStaked);

            trenToken.transfer(msg.sender, trenToWithdraw);

            emit StakeUpdated(msg.sender, newStake);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // --- Reward-per-unit-staked increase functions, which called by Tren core contracts ---------

    function increaseFeeAsset(
        address _asset,
        uint256 _assetFee
    )
        external
        override
        onlyFeeCollector
        isPaused(_asset, _assetFee)
    {
        if (!isAssetTracked[_asset]) {
            isAssetTracked[_asset] = true;
            assetsList.push(_asset);
        }

        uint256 assetFeePerTRENStaked;
        if (totalTRENStaked > 0) {
            assetFeePerTRENStaked = (_assetFee * DECIMAL_PRECISION) / totalTRENStaked;
        }

        assetsFee[_asset] += assetFeePerTRENStaked;

        emit AssetFeeUpdated(_asset, assetsFee[_asset]);
    }

    function increaseFeeDebtToken(uint256 _debtTokenFee)
        external
        override
        onlyFeeCollector
        isPaused(debtToken, _debtTokenFee)
    {
        uint256 feePerTRENStaked;
        if (totalTRENStaked > 0) {
            feePerTRENStaked = (_debtTokenFee * DECIMAL_PRECISION) / totalTRENStaked;
        }

        totalDebtTokenFee += feePerTRENStaked;

        emit TotalDebtTokenFeeUpdated(totalDebtTokenFee);
    }

    function sendToTreasury(address _asset, uint256 _amount) internal {
        _sendAsset(treasury, _asset, _amount);
        sentAssetFeeToTreasury[_asset] += _amount;

        emit SentAssetFeeToTreasury(_asset, _amount);
    }

    // ------------------------------------------ Pending reward functions ------------------------

    function getPendingAssetGain(address _asset, address _user) external view returns (uint256) {
        return _getPendingAssetGain(_asset, _user);
    }

    function _getPendingAssetGain(address _asset, address _user) internal view returns (uint256) {
        uint256 assetFeeSnapshot = snapshots[_user].assetsFeeSnapshot[_asset];
        uint256 assetGain =
            (stakes[_user] * (assetsFee[_asset] - assetFeeSnapshot)) / DECIMAL_PRECISION;
        return assetGain;
    }

    function getPendingDebtTokenGain(address _user) external view returns (uint256) {
        return _getPendingDebtTokenGain(_user);
    }

    function _getPendingDebtTokenGain(address _user) internal view returns (uint256) {
        uint256 debtTokenFeeSnapshot = snapshots[_user].debtTokenFeeSnapshot;
        return (stakes[_user] * (totalDebtTokenFee - debtTokenFeeSnapshot)) / DECIMAL_PRECISION;
    }

    // ------------------------------------------ Private functions ------------------------------

    function _updateUserSnapshots(address _asset, address _user) private {
        snapshots[_user].assetsFeeSnapshot[_asset] = assetsFee[_asset];
        snapshots[_user].debtTokenFeeSnapshot = totalDebtTokenFee;

        emit StakerSnapshotsUpdated(_user, assetsFee[_asset], totalDebtTokenFee);
    }

    function _sendAssetGainToUser(address _asset, uint256 _assetGain) private {
        _assetGain = SafetyTransfer.decimalsCorrection(_asset, _assetGain);
        _sendAsset(msg.sender, _asset, _assetGain);

        emit SentAsset(_asset, msg.sender, _assetGain);
    }

    function _sendAsset(address _receiver, address _asset, uint256 _amount) private {
        IERC20(_asset).transfer(_receiver, _amount);
    }

    function checkDebtTokenGain() private {
        uint256 debtTokenGain = _getPendingDebtTokenGain(msg.sender);
        if (debtTokenGain != 0) {
            IERC20(debtToken).transfer(msg.sender, debtTokenGain);
            emit StakingDebtTokenGainWithdrawn(msg.sender, debtTokenGain);
        }
    }
}
