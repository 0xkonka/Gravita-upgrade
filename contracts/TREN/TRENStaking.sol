// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { PausableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";

import { BaseMath } from "../Dependencies/BaseMath.sol";
import { TrenMath } from "../Dependencies/TrenMath.sol";

import { IDeposit } from "../Interfaces/IDeposit.sol";
import { ITRENStaking } from "../Interfaces/ITRENStaking.sol";

contract TRENStaking is
    ITRENStaking,
    PausableUpgradeable,
    OwnableUpgradeable,
    BaseMath,
    ReentrancyGuardUpgradeable
{
    using SafeERC20 for IERC20;

    // --- Data ---
    string public constant NAME = "TRENStaking";
    address constant ETH_REF_ADDRESS = address(0);

    mapping(address => uint256) public stakes;
    uint256 public totalTRENStaked;

    mapping(address => uint256) public F_ASSETS; // Running sum of asset fees per-TREN-staked
    uint256 public F_DEBT_TOKENS; // Running sum of debt token fees per-TREN-staked

    // User snapshots of F_ASSETS and F_DEBT_TOKENS, taken at the point at which their latest
    // deposit was made
    mapping(address => Snapshot) public snapshots;

    struct Snapshot {
        mapping(address => uint256) F_ASSETS_Snapshot;
        uint256 F_DEBT_TOKENS_Snapshot;
    }

    address[] ASSET_TYPE;
    mapping(address => bool) isAssetTracked;
    mapping(address => uint256) public sentToTreasuryTracker;

    IERC20 public override trenToken;

    address public debtTokenAddress;
    address public feeCollectorAddress;
    address public treasuryAddress;
    address public trenBoxManagerAddress;

    bool public isSetupInitialized;

    // --- Initializer ---

    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __ReentrancyGuard_init();
        __Pausable_init();
        _pause();
    }

    // --- Functions ---
    function setAddresses(
        address _debtTokenAddress,
        address _feeCollectorAddress,
        address _trenTokenAddress,
        address _treasuryAddress,
        address _trenBoxManagerAddress
    )
        external
        onlyOwner
    {
        require(!isSetupInitialized, "Setup is already initialized");

        debtTokenAddress = _debtTokenAddress;
        feeCollectorAddress = _feeCollectorAddress;
        trenToken = IERC20(_trenTokenAddress);
        treasuryAddress = _treasuryAddress;
        trenBoxManagerAddress = _trenBoxManagerAddress;

        isAssetTracked[ETH_REF_ADDRESS] = true;
        ASSET_TYPE.push(ETH_REF_ADDRESS);
        isSetupInitialized = true;
    }

    // If caller has a pre-existing stake, send any accumulated asset and debtToken gains to them.
    function stake(uint256 _TRENamount) external override nonReentrant whenNotPaused {
        require(_TRENamount > 0);

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
                    IERC20(debtTokenAddress).safeTransfer(msg.sender, debtTokenGain);
                    emit StakingGainsDebtTokensWithdrawn(msg.sender, debtTokenGain);
                }

                _sendAssetGainToUser(asset, assetGain);
                emit StakingGainsAssetWithdrawn(msg.sender, asset, assetGain);
            }

            _updateUserSnapshots(asset, msg.sender);
        }

        uint256 newStake = currentStake + _TRENamount;

        // Increase user’s stake and total TREN staked
        stakes[msg.sender] = newStake;
        totalTRENStaked = totalTRENStaked + _TRENamount;
        emit TotalTRENStakedUpdated(totalTRENStaked);

        // Transfer TREN from caller to this contract
        trenToken.transferFrom(msg.sender, address(this), _TRENamount);

        emit StakeChanged(msg.sender, newStake);
    }

    // Unstake the TREN and send the it back to the caller, along with their accumulated gains.
    // If requested amount > stake, send their entire stake.
    function unstake(uint256 _TRENamount) external override nonReentrant {
        uint256 currentStake = stakes[msg.sender];
        _requireUserHasStake(currentStake);

        uint256 assetLength = ASSET_TYPE.length;
        uint256 assetGain;
        address asset;

        for (uint256 i = 0; i < assetLength; i++) {
            asset = ASSET_TYPE[i];

            // Grab any accumulated asset and debtToken gains from the current stake
            assetGain = _getPendingAssetGain(asset, msg.sender);

            if (i == 0) {
                uint256 debtTokenGain = _getPendingDebtTokenGain(msg.sender);
                IERC20(debtTokenAddress).safeTransfer(msg.sender, debtTokenGain);
                emit StakingGainsDebtTokensWithdrawn(msg.sender, debtTokenGain);
            }

            _updateUserSnapshots(asset, msg.sender);
            emit StakingGainsAssetWithdrawn(msg.sender, asset, assetGain);
            _sendAssetGainToUser(asset, assetGain);
        }

        if (_TRENamount > 0) {
            uint256 TRENToWithdraw = TrenMath._min(_TRENamount, currentStake);
            uint256 newStake = currentStake - TRENToWithdraw;

            // Decrease user's stake and total TREN staked
            stakes[msg.sender] = newStake;
            totalTRENStaked = totalTRENStaked - TRENToWithdraw;
            emit TotalTRENStakedUpdated(totalTRENStaked);

            // Transfer unstaked TREN to user
            IERC20(address(trenToken)).safeTransfer(msg.sender, TRENToWithdraw);
            emit StakeChanged(msg.sender, newStake);
        }
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }

    // --- Reward-per-unit-staked increase functions. Called by Tren core contracts ---

    function increaseFee_Asset(
        address _asset,
        uint256 _assetFee
    )
        external
        override
        callerIsTrenBoxManager
    {
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

        F_ASSETS[_asset] = F_ASSETS[_asset] + assetFeePerTRENStaked;
        emit Fee_AssetUpdated(_asset, F_ASSETS[_asset]);
    }

    function increaseFee_DebtToken(uint256 _debtTokenFee) external override callerIsFeeCollector {
        if (paused()) {
            sendToTreasury(debtTokenAddress, _debtTokenFee);
            return;
        }

        uint256 feePerTRENStaked;
        if (totalTRENStaked > 0) {
            feePerTRENStaked = (_debtTokenFee * DECIMAL_PRECISION) / totalTRENStaked;
        }

        F_DEBT_TOKENS = F_DEBT_TOKENS + feePerTRENStaked;
        emit Fee_DebtTokenUpdated(F_DEBT_TOKENS);
    }

    function sendToTreasury(address _asset, uint256 _amount) internal {
        _sendAsset(treasuryAddress, _asset, _amount);
        sentToTreasuryTracker[_asset] += _amount;
        emit SentToTreasury(_asset, _amount);
    }

    // --- Pending reward functions ---

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
        uint256 F_ASSET_Snapshot = snapshots[_user].F_ASSETS_Snapshot[_asset];
        uint256 AssetGain =
            (stakes[_user] * (F_ASSETS[_asset] - F_ASSET_Snapshot)) / DECIMAL_PRECISION;
        return AssetGain;
    }

    function getPendingDebtTokenGain(address _user) external view override returns (uint256) {
        return _getPendingDebtTokenGain(_user);
    }

    function _getPendingDebtTokenGain(address _user) internal view returns (uint256) {
        uint256 debtTokenSnapshot = snapshots[_user].F_DEBT_TOKENS_Snapshot;
        return (stakes[_user] * (F_DEBT_TOKENS - debtTokenSnapshot)) / DECIMAL_PRECISION;
    }

    // --- Internal helper functions ---

    function _updateUserSnapshots(address _asset, address _user) internal {
        snapshots[_user].F_ASSETS_Snapshot[_asset] = F_ASSETS[_asset];
        snapshots[_user].F_DEBT_TOKENS_Snapshot = F_DEBT_TOKENS;
        emit StakerSnapshotsUpdated(_user, F_ASSETS[_asset], F_DEBT_TOKENS);
    }

    function _sendAssetGainToUser(address _asset, uint256 _assetGain) internal {
        _sendAsset(msg.sender, _asset, _assetGain);
        emit AssetSent(_asset, msg.sender, _assetGain);
    }

    function _sendAsset(address _sendTo, address _asset, uint256 _amount) internal {
        IERC20(_asset).safeTransfer(_sendTo, _amount);
    }

    // --- 'require' functions ---

    modifier callerIsTrenBoxManager() {
        require(msg.sender == trenBoxManagerAddress, "TRENStaking: caller is not TrenBoxManager");
        _;
    }

    modifier callerIsFeeCollector() {
        require(msg.sender == feeCollectorAddress, "TRENStaking: caller is not FeeCollector");
        _;
    }

    function _requireUserHasStake(uint256 currentStake) internal pure {
        require(currentStake > 0, "TRENStaking: User must have a non-zero stake");
    }
}
