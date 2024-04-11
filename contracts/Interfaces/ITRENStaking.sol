// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ITRENStaking {
    struct Snapshot {
        mapping(address asset => uint256 feeAmount) assetsFeeSnapshot;
        uint256 debtTokenFeeSnapshot;
    }

    error TRENStaking__SetupAlreadyInitialized();
    error TRENStaking__StakingOnPause();
    error TRENStaking__InvalidAddresses();
    error TRENStaking__InvalidAmount(uint256 zeroValue);
    error TRENStaking__OnlyFeeCollector(address caller, address expected);
    error TRENStaking__InvalidStakeAmount(uint256 zeroValue);

    event SentAssetFeeToTreasury(address indexed _asset, uint256 _amount);
    event StakeUpdated(address indexed _staker, uint256 _newStake);
    event StakingAssetGainWithdrawn(
        address indexed _staker, address indexed _asset, uint256 _assetGain
    );

    event StakingDebtTokenGainWithdrawn(address indexed _staker, uint256 _debtTokenAmount);
    event AssetFeeUpdated(address indexed _asset, uint256 _amount);
    event TotalDebtTokenFeeUpdated(uint256 _amount);
    event TotalTRENStakedUpdated(uint256 _totalTRENStaked);
    event SentAsset(address indexed _asset, address indexed _account, uint256 _amount);
    event StakerSnapshotsUpdated(address _staker, uint256 _feeAsset, uint256 _feeDebtToken);

    function increaseFeeAsset(address _asset, uint256 _feeAsset) external;
    function increaseFeeDebtToken(uint256 _TRENFee) external;
}
