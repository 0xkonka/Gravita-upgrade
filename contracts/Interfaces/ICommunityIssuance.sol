// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface ICommunityIssuance {
    // --- Events ---

    event TotalTRENIssuedUpdated(uint256 _totalTRENIssued);

    // --- Functions ---

    function issueTREN() external returns (uint256);

    function sendTREN(address _account, uint256 _TRENamount) external;

    function addFundToStabilityPool(uint256 _assignedSupply) external;

    function addFundToStabilityPoolFrom(uint256 _assignedSupply, address _spender) external;

    function setWeeklyTrenDistribution(uint256 _weeklyReward) external;
}
