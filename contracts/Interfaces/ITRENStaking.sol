// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

interface ITRENStaking {
    // Events
    // -----------------------------------------------------------------------------------------------------------

    event TreasuryAddressChanged(address _treausury);
    event SentToTreasury(address indexed _asset, uint256 _amount);

    event StakeChanged(address indexed staker, uint256 newStake);
    event StakingGainsAssetWithdrawn(
        address indexed staker, address indexed asset, uint256 AssetGain
    );
    event StakingGainsDebtTokensWithdrawn(address indexed staker, uint256 debtTokenAmount);
    event Fee_AssetUpdated(address indexed _asset, uint256 _amount);
    event Fee_DebtTokenUpdated(uint256 _amount);
    event TotalTRENStakedUpdated(uint256 _totalTRENStaked);
    event AssetSent(address indexed _asset, address indexed _account, uint256 _amount);
    event StakerSnapshotsUpdated(address _staker, uint256 _F_Asset, uint256 _F_DebtToken);

    // Functions
    // --------------------------------------------------------------------------------------------------------

    function trenToken() external view returns (IERC20);

    function stake(uint256 _TRENamount) external;

    function unstake(uint256 _TRENamount) external;

    function increaseFee_Asset(address _asset, uint256 _AssetFee) external;

    function increaseFee_DebtToken(uint256 _TRENFee) external;

    function getPendingAssetGain(address _asset, address _user) external view returns (uint256);

    function getPendingDebtTokenGain(address _user) external view returns (uint256);
}
