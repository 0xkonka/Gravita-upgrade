// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { ILockedTREN } from "../Interfaces/ILockedTREN.sol";

/**
 * @notice This contract is reserved for Linear Vesting to the Team members and the Advisors team.
 */
contract LockedTREN is ILockedTREN, Ownable, Initializable {
    using SafeERC20 for IERC20;

    string public constant NAME = "LockedTREN";
    uint256 public constant SIX_MONTHS = 26 weeks;
    uint256 public constant TWO_YEARS = 730 days;

    IERC20 private trenToken;
    uint256 private assignedTRENTokens;

    mapping(address entity => Rule rule) public entitiesVesting;

    modifier entityRuleExists(address _entity) {
        if (entitiesVesting[_entity].createdDate == 0) {
            revert LockedTREN__NotHaveVestingRule();
        }
        _;
    }

    constructor(address initialOwner) Ownable(initialOwner) { }

    function setAddresses(address _trenAddress) public initializer onlyOwner {
        trenToken = IERC20(_trenAddress);
    }

    function addEntityVesting(address _entity, uint256 _totalSupply) public onlyOwner {
        if (_entity == address(0)) {
            revert LockedTREN__InvalidAddress();
        }

        if (entitiesVesting[_entity].createdDate != 0) {
            revert LockedTREN__AlreadyHaveVestingRule();
        }

        assignedTRENTokens += _totalSupply;

        entitiesVesting[_entity] = Rule(
            block.timestamp,
            _totalSupply,
            block.timestamp + SIX_MONTHS,
            block.timestamp + TWO_YEARS,
            0
        );

        trenToken.safeTransferFrom(msg.sender, address(this), _totalSupply);
    }

    function lowerEntityVesting(
        address _entity,
        uint256 newTotalSupply
    )
        public
        onlyOwner
        entityRuleExists(_entity)
    {
        sendTRENTokenToEntity(_entity);
        Rule storage vestingRule = entitiesVesting[_entity];

        if (newTotalSupply <= vestingRule.claimed) {
            revert LockedTREN__TotalSupplyLessThanClaimed();
        }

        vestingRule.totalSupply = newTotalSupply;
    }

    function removeEntityVesting(address _entity) public onlyOwner entityRuleExists(_entity) {
        sendTRENTokenToEntity(_entity);
        Rule memory vestingRule = entitiesVesting[_entity];

        assignedTRENTokens = assignedTRENTokens - (vestingRule.totalSupply - vestingRule.claimed);

        delete entitiesVesting[_entity];
    }

    function claimTRENToken() public entityRuleExists(msg.sender) {
        sendTRENTokenToEntity(msg.sender);
    }

    function sendTRENTokenToEntity(address _entity) private {
        uint256 unclaimedAmount = getClaimableTREN(_entity);
        if (unclaimedAmount == 0) return;

        Rule storage entityRule = entitiesVesting[_entity];
        entityRule.claimed += unclaimedAmount;

        assignedTRENTokens = assignedTRENTokens - unclaimedAmount;
        trenToken.safeTransfer(_entity, unclaimedAmount);
    }

    function transferUnassignedTREN() external onlyOwner {
        uint256 unassignedTokens = getUnassignTRENTokensAmount();

        if (unassignedTokens == 0) return;

        trenToken.safeTransfer(msg.sender, unassignedTokens);
    }

    function getClaimableTREN(address _entity) public view returns (uint256 claimable) {
        Rule memory entityRule = entitiesVesting[_entity];
        claimable = 0;

        if (entityRule.startVestingDate > block.timestamp) return claimable;

        if (block.timestamp >= entityRule.endVestingDate) {
            claimable = entityRule.totalSupply - entityRule.claimed;
        } else {
            claimable = (
                (entityRule.totalSupply / TWO_YEARS) * (block.timestamp - entityRule.createdDate)
            ) - entityRule.claimed;
        }

        return claimable;
    }

    function getUnassignTRENTokensAmount() public view returns (uint256) {
        return trenToken.balanceOf(address(this)) - assignedTRENTokens;
    }

    function isEntityExits(address _entity) public view returns (bool) {
        return entitiesVesting[_entity].createdDate != 0;
    }
}
