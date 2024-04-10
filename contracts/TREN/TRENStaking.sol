// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { ITRENStaking } from "../Interfaces/ITRENStaking.sol";

import { TrenMath, DECIMAL_PRECISION } from "../Dependencies/TrenMath.sol";
import { SafetyTransfer } from "../Dependencies/SafetyTransfer.sol";

contract TRENStaking is
    ITRENStaking,
    PausableUpgradeable,
    OwnableUpgradeable,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;
    // ------------------------------------------- State ------------------------------------------

    string public constant NAME = "TRENStaking";

    address public debtToken;
    address public feeCollector;
    address public treasury;
    IERC20 public trenToken;

    address[] private assetsList;

    uint256 public totalTRENStaked;
    uint256 public totalDebtTokenFee;

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

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function stake(uint256 _TRENamount) external nonReentrant whenNotPaused {
        if (_TRENamount == 0) revert TRENStaking__InvalidAmount(0);

        uint256 currentStake = stakes[msg.sender];
        uint256 assetLength = assetsList.length;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = assetsList[i];

            if (currentStake != 0) {
                if (i == 0) {
                    checkDebtTokenGain();
                }

                checkAssetGain(asset);
            }

            _updateUserSnapshots(asset, msg.sender);
        }

        uint256 newStake = currentStake + _TRENamount;
        stakes[msg.sender] = newStake;
        totalTRENStaked += _TRENamount;

        emit TotalTRENStakedUpdated(totalTRENStaked);

        trenToken.safeTransferFrom(msg.sender, address(this), _TRENamount);

        emit StakeUpdated(msg.sender, newStake);
    }

    function unstake(uint256 _TRENamount) external nonReentrant {
        uint256 currentStake = stakes[msg.sender];
        if (currentStake == 0) revert TRENStaking__InvalidStakeAmount(0);

        uint256 assetLength = assetsList.length;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = assetsList[i];

            if (i == 0) {
                checkDebtTokenGain();
            }

            checkAssetGain(asset);

            _updateUserSnapshots(asset, msg.sender);
        }

        if (_TRENamount > 0) {
            uint256 trenToWithdraw = TrenMath._min(_TRENamount, currentStake);
            uint256 newStake = currentStake - trenToWithdraw;

            stakes[msg.sender] = newStake;
            totalTRENStaked -= trenToWithdraw;

            emit TotalTRENStakedUpdated(totalTRENStaked);

            trenToken.safeTransfer(msg.sender, trenToWithdraw);

            emit StakeUpdated(msg.sender, newStake);
        }
    }

    function increaseFeeAsset(
        address _asset,
        uint256 _assetFee
    )
        external
        onlyFeeCollector
        isPaused(_asset, _assetFee)
    {
        if (!isAssetTracked[_asset]) {
            isAssetTracked[_asset] = true;
            assetsList.push(_asset);
        }

        uint256 assetFeePerTRENStaked;
        if (totalTRENStaked > 0) assetFeePerTRENStaked = calculateFeePerTRENStaked(_assetFee);
        assetsFee[_asset] += assetFeePerTRENStaked;

        emit AssetFeeUpdated(_asset, assetsFee[_asset]);
    }

    function increaseFeeDebtToken(uint256 _debtTokenFee)
        external
        onlyFeeCollector
        isPaused(debtToken, _debtTokenFee)
    {
        uint256 debtTokenFeePerTRENStaked;
        if (totalTRENStaked > 0) {
            debtTokenFeePerTRENStaked = calculateFeePerTRENStaked(_debtTokenFee);
        }
        totalDebtTokenFee += debtTokenFeePerTRENStaked;

        emit TotalDebtTokenFeeUpdated(totalDebtTokenFee);
    }

    function getPendingAssetGain(address _asset, address _user) external view returns (uint256) {
        return _getPendingAssetGain(_asset, _user);
    }

    function getPendingDebtTokenGain(address _user) external view returns (uint256) {
        return _getPendingDebtTokenGain(_user);
    }

    function getAssetsList() external view returns (address[] memory) {
        return assetsList;
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

    function sendToTreasury(address _asset, uint256 _amount) private {
        _sendAsset(treasury, _asset, _amount);
        sentAssetFeeToTreasury[_asset] += _amount;

        emit SentAssetFeeToTreasury(_asset, _amount);
    }

    function checkDebtTokenGain() private {
        uint256 debtTokenGain = _getPendingDebtTokenGain(msg.sender);
        if (debtTokenGain != 0) {
            _sendAsset(msg.sender, debtToken, debtTokenGain);
            emit StakingDebtTokenGainWithdrawn(msg.sender, debtTokenGain);
        }
    }

    function _sendAsset(address _receiver, address _asset, uint256 _amount) private {
        IERC20(_asset).safeTransfer(_receiver, _amount);
    }

    function checkAssetGain(address _asset) private {
        uint256 assetGain = _getPendingDebtTokenGain(msg.sender);
        if (assetGain != 0) {
            _sendAssetGainToUser(_asset, assetGain);
            emit StakingAssetGainWithdrawn(msg.sender, _asset, assetGain);
        }
    }

    function calculateFeePerTRENStaked(uint256 _feeAmount) private view returns (uint256) {
        return (_feeAmount * DECIMAL_PRECISION) / totalTRENStaked;
    }

    function _getPendingAssetGain(address _asset, address _user) private view returns (uint256) {
        uint256 assetFeeSnapshot = snapshots[_user].assetsFeeSnapshot[_asset];
        return (stakes[_user] * (assetsFee[_asset] - assetFeeSnapshot)) / DECIMAL_PRECISION;
    }

    function _getPendingDebtTokenGain(address _user) private view returns (uint256) {
        uint256 debtTokenFeeSnapshot = snapshots[_user].debtTokenFeeSnapshot;
        return (stakes[_user] * (totalDebtTokenFee - debtTokenFeeSnapshot)) / DECIMAL_PRECISION;
    }
}
