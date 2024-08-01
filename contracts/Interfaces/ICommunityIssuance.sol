// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface ICommunityIssuance {
    // --- Errors ---

    error CommunityIssuance__SetupAlreadyInitialized();
    error CommunityIssuance__InvalidAddresses();
    error CommunityIssuance__InvalidAdminContract();
    error CommunityIssuance__InvalidPermission();
    error CommunityIssuance__NotStabilityPool();
    error CommunityIssuance__SPHaveInsufficientSupply();
    error CommunityIssuance__SPNotAssigned();

    // --- Events ---

    event AdminContractAddressSet(address _adminContract);
    event TotalTRENIssuedUpdated(uint256 _totalTRENIssued);

    // --- Functions ---

    function issueTREN() external returns (uint256);

    function sendTREN(address _account, uint256 _TRENamount) external;

    function addFundToStabilityPool(uint256 _assignedSupply) external;

    function addFundToStabilityPoolFrom(uint256 _assignedSupply, address _spender) external;

    function setWeeklyTrenDistribution(uint256 _weeklyReward) external;
}
