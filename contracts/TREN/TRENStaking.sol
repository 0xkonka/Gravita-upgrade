// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { BaseMath } from "../Dependencies/BaseMath.sol";
import { TrenMath } from "../Dependencies/TrenMath.sol";
import { SafetyTransfer } from "../Dependencies/SafetyTransfer.sol";

import { IDeposit } from "../Interfaces/IDeposit.sol";
import { ITRENStaking } from "../Interfaces/ITRENStaking.sol";

contract TRENStaking is
    ITRENStaking,
    PausableUpgradeable,
    OwnableUpgradeable,
    BaseMath,
    ReentrancyGuardUpgradeable
{
    string public constant NAME = "TRENStaking";

    address constant ETH_REF_ADDRESS = address(0); // TODO: what is this?
    address public debtToken;
    address public feeCollector;
    address public treasuryAddress;
    address public trenBoxManager;
    IERC20 public override trenToken;

    address[] ASSET_TYPE;

    uint256 public totalTRENStaked;
    uint256 public TOTAL_FEE_DEBT_TOKENS_AMOUNT; // Running sum of debt token fees per-TREN-staked

    mapping(address user => uint256 amount) private stakes;
    mapping(address user => uint256 assetFeeAmount) private FEE_ASSETS;

    // User snapshots of FEE_ASSETS and FEE_DEBT_TOKENS, taken at the point at which their latest
    // deposit was made
    mapping(address user => Snapshot) private snapshots;
    mapping(address asset => bool tracked) private isAssetTracked;
    mapping(address asset => uint256 sentToTreasury) private sentToTreasuryTracker;

    bool public isSetupInitialized;

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
        address _trenTokenAddress,
        address _treasuryAddress,
        address _trenBoxManager
    )
        external
        onlyOwner
    {
        if (isSetupInitialized) revert TRENStaking__SetupAlreadyInitialized();

        debtToken = _debtToken;
        feeCollector = _feeCollector;
        trenToken = IERC20(_trenTokenAddress);
        treasuryAddress = _treasuryAddress;
        trenBoxManager = _trenBoxManager;

        isAssetTracked[ETH_REF_ADDRESS] = true;
        ASSET_TYPE.push(ETH_REF_ADDRESS);
        isSetupInitialized = true;
    }

    // If caller has a pre-existing stake, send any accumulated asset and debtToken gains to them.
    function stake(uint256 _TRENamount) external override nonReentrant whenNotPaused {
        if (_TRENamount == 0) revert TRENStaking__InvalidAmount(0);

        uint256 currentStake = stakes[msg.sender];

        uint256 assetLength = ASSET_TYPE.length;
        uint256 assetGain;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = ASSET_TYPE[i];

            if (currentStake != 0) {
                assetGain = _getPendingAssetGain(asset, msg.sender);

                if (i == 0) {
                    uint256 debtTokenGain = _getPendingDebtTokenGain(msg.sender);
                    IERC20(debtToken).transfer(msg.sender, debtTokenGain);
                    emit StakingGainsDebtTokensWithdrawn(msg.sender, debtTokenGain);
                }

                _sendAssetGainToUser(asset, assetGain);
                emit StakingGainsAssetWithdrawn(msg.sender, asset, assetGain);
            }

            _updateUserSnapshots(asset, msg.sender);
        }

        uint256 newStake = currentStake + _TRENamount;

        stakes[msg.sender] = newStake;
        totalTRENStaked = totalTRENStaked + _TRENamount;
        emit TotalTRENStakedUpdated(totalTRENStaked);

        trenToken.transferFrom(msg.sender, address(this), _TRENamount);

        emit StakeChanged(msg.sender, newStake);
    }

    // Unstake the TREN and send the it back to the caller, along with their accumulated gains.
    // If requested amount > stake, send their entire stake.
    function unstake(uint256 _TRENamount) external override nonReentrant {
        uint256 currentStake = stakes[msg.sender];
        if (currentStake == 0) revert TRENStaking__InvalidStakeAmount(0);

        uint256 assetLength = ASSET_TYPE.length;
        uint256 assetGain;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = ASSET_TYPE[i];

            assetGain = _getPendingAssetGain(asset, msg.sender);

            if (i == 0) {
                uint256 debtTokenGain = _getPendingDebtTokenGain(msg.sender);
                IERC20(debtToken).transfer(msg.sender, debtTokenGain);
                emit StakingGainsDebtTokensWithdrawn(msg.sender, debtTokenGain);
            }

            _updateUserSnapshots(asset, msg.sender);
            emit StakingGainsAssetWithdrawn(msg.sender, asset, assetGain);
            _sendAssetGainToUser(asset, assetGain);
        }

        if (_TRENamount > 0) {
            uint256 TRENToWithdraw = TrenMath._min(_TRENamount, currentStake);
            uint256 newStake = currentStake - TRENToWithdraw;

            stakes[msg.sender] = newStake;
            totalTRENStaked = totalTRENStaked - TRENToWithdraw;
            emit TotalTRENStakedUpdated(totalTRENStaked);

            IERC20(address(trenToken)).transfer(msg.sender, TRENToWithdraw);
            emit StakeChanged(msg.sender, newStake);
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // --- Reward-per-unit-staked increase functions, which called by Tren core contracts ---------

    function increaseFee_Asset(address _asset, uint256 _assetFee) external override {
        if (msg.sender != trenBoxManager) {
            revert TRENStaking__OnlyTrenBoxManager(msg.sender, trenBoxManager);
        }
        if (paused()) {
            sendToTreasury(_asset, _assetFee);
            return;
        }

        if (!isAssetTracked[_asset]) {
            isAssetTracked[_asset] = true;
            ASSET_TYPE.push(_asset);
        }

        uint256 assetFeePerTRENStaked;

        if (totalTRENStaked > 0) {
            assetFeePerTRENStaked = (_assetFee * DECIMAL_PRECISION) / totalTRENStaked;
        }

        FEE_ASSETS[_asset] = FEE_ASSETS[_asset] + assetFeePerTRENStaked;
        emit Fee_AssetUpdated(_asset, FEE_ASSETS[_asset]);
    }

    function increaseFee_DebtToken(uint256 _debtTokenFee) external override {
        if (msg.sender != feeCollector) {
            revert TRENStaking__OnlyFeeCollector(msg.sender, trenBoxManager);
        }
        if (paused()) {
            sendToTreasury(debtToken, _debtTokenFee);
            return;
        }

        uint256 feePerTRENStaked;
        if (totalTRENStaked > 0) {
            feePerTRENStaked = (_debtTokenFee * DECIMAL_PRECISION) / totalTRENStaked;
        }

        TOTAL_FEE_DEBT_TOKENS_AMOUNT = TOTAL_FEE_DEBT_TOKENS_AMOUNT + feePerTRENStaked;
        emit Fee_DebtTokenUpdated(TOTAL_FEE_DEBT_TOKENS_AMOUNT);
    }

    function sendToTreasury(address _asset, uint256 _amount) internal {
        _sendAsset(treasuryAddress, _asset, _amount);
        sentToTreasuryTracker[_asset] += _amount;
        emit SentToTreasury(_asset, _amount);
    }

    // ------------------------------------------ Pending reward functions ------------------------

    function getPendingAssetGain(
        address _asset,
        address _user
    )
        external
        view
        override
        returns (uint256)
    {
        return _getPendingAssetGain(_asset, _user);
    }

    function _getPendingAssetGain(address _asset, address _user) internal view returns (uint256) {
        uint256 FEE_ASSET_Snapshot = snapshots[_user].FEE_ASSETS_Snapshot[_asset];
        uint256 AssetGain =
            (stakes[_user] * (FEE_ASSETS[_asset] - FEE_ASSET_Snapshot)) / DECIMAL_PRECISION;
        return AssetGain;
    }

    function getPendingDebtTokenGain(address _user) external view override returns (uint256) {
        return _getPendingDebtTokenGain(_user);
    }

    function _getPendingDebtTokenGain(address _user) internal view returns (uint256) {
        uint256 debtTokenSnapshot = snapshots[_user].FEE_DEBT_TOKENS_Snapshot;
        return
            (stakes[_user] * (TOTAL_FEE_DEBT_TOKENS_AMOUNT - debtTokenSnapshot)) / DECIMAL_PRECISION;
    }

    // ------------------------------------------ Internal functions ------------------------------

    function _updateUserSnapshots(address _asset, address _user) internal {
        snapshots[_user].FEE_ASSETS_Snapshot[_asset] = FEE_ASSETS[_asset];
        snapshots[_user].FEE_DEBT_TOKENS_Snapshot = TOTAL_FEE_DEBT_TOKENS_AMOUNT;
        emit StakerSnapshotsUpdated(_user, FEE_ASSETS[_asset], TOTAL_FEE_DEBT_TOKENS_AMOUNT);
    }

    function _sendAssetGainToUser(address _asset, uint256 _assetGain) internal {
        _assetGain = SafetyTransfer.decimalsCorrection(_asset, _assetGain);
        _sendAsset(msg.sender, _asset, _assetGain);
        emit AssetSent(_asset, msg.sender, _assetGain);
    }

    function _sendAsset(address _sendTo, address _asset, uint256 _amount) internal {
        IERC20(_asset).transfer(_sendTo, _amount);
    }
}
