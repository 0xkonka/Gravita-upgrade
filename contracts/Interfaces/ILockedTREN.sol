// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

interface ILockedTREN {
    struct Rule {
        uint256 createdDate;
        uint256 totalSupply;
        uint256 startVestingDate;
        uint256 endVestingDate;
        uint256 claimed;
    }

    error LockedTREN__NotHaveVestingRule();
    error LockedTREN__InvalidAddress();
    error LockedTREN__AlreadyHaveVestingRule();
    error LockedTREN__NewValueMustBeLower();
    error LockedTREN__TotalSupplyLessThanClaimed();

    event AddEntityVesting(
        address indexed entity,
        uint256 totalSupply,
        uint256 startVestingDate,
        uint256 endVestingDate
    );
}
