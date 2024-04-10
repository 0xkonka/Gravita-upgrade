// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { TrenMath } from "../Dependencies/TrenMath.sol";

import { ICommunityIssuance } from "../Interfaces/ICommunityIssuance.sol";
import { IStabilityPool } from "../Interfaces/IStabilityPool.sol";

contract CommunityIssuance is ICommunityIssuance, OwnableUpgradeable {
    using SafeERC20 for IERC20;

    string public constant NAME = "CommunityIssuance";

    uint256 public constant DISTRIBUTION_DURATION = 7 days / 60;
    uint256 public constant SECONDS_IN_ONE_MINUTE = 60;

    uint256 public totalTRENIssued;
    uint256 public lastUpdateTime;
    uint256 public TRENSupplyCap;
    uint256 public trenDistribution;

    IERC20 public trenToken;
    IStabilityPool public stabilityPool;

    address public adminContract;
    bool public isSetupInitialized;

    modifier isController() {
        require(msg.sender == owner() || msg.sender == adminContract, "Invalid Permission");
        _;
    }

    modifier isStabilityPool(address _pool) {
        require(address(stabilityPool) == _pool, "CommunityIssuance: caller is not SP");
        _;
    }

    modifier onlyStabilityPool() {
        require(address(stabilityPool) == msg.sender, "CommunityIssuance: caller is not SP");
        _;
    }

    // --- Initializer ---

    function initialize() public initializer {
        address initialOwner = _msgSender();
        __Ownable_init(initialOwner);
    }

    // --- Functions ---
    function setAddresses(
        address _trenTokenAddress,
        address _stabilityPoolAddress,
        address _adminContract
    )
        external
        onlyOwner
    {
        require(!isSetupInitialized, "Setup is already initialized");
        adminContract = _adminContract;
        trenToken = IERC20(_trenTokenAddress);
        stabilityPool = IStabilityPool(_stabilityPoolAddress);
        isSetupInitialized = true;
    }

    function setAdminContract(address _admin) external onlyOwner {
        require(_admin != address(0));
        adminContract = _admin;
    }

    function addFundToStabilityPool(uint256 _assignedSupply) external override isController {
        _addFundToStabilityPoolFrom(_assignedSupply, msg.sender);
    }

    function removeFundFromStabilityPool(uint256 _fundToRemove) external onlyOwner {
        uint256 newCap = TRENSupplyCap - _fundToRemove;
        require(
            totalTRENIssued <= newCap,
            "CommunityIssuance: Stability Pool doesn't have enough supply."
        );

        TRENSupplyCap -= _fundToRemove;

        trenToken.safeTransfer(msg.sender, _fundToRemove);
    }

    function addFundToStabilityPoolFrom(
        uint256 _assignedSupply,
        address _spender
    )
        external
        override
        isController
    {
        _addFundToStabilityPoolFrom(_assignedSupply, _spender);
    }

    function _addFundToStabilityPoolFrom(uint256 _assignedSupply, address _spender) internal {
        if (lastUpdateTime == 0) {
            lastUpdateTime = block.timestamp;
        }

        TRENSupplyCap += _assignedSupply;
        trenToken.safeTransferFrom(_spender, address(this), _assignedSupply);
    }

    function issueTREN() public override onlyStabilityPool returns (uint256) {
        uint256 maxPoolSupply = TRENSupplyCap;

        if (totalTRENIssued >= maxPoolSupply) return 0;

        uint256 issuance = _getLastUpdateTokenDistribution();
        uint256 totalIssuance = issuance + totalTRENIssued;

        if (totalIssuance > maxPoolSupply) {
            issuance = maxPoolSupply - totalTRENIssued;
            totalIssuance = maxPoolSupply;
        }

        lastUpdateTime = block.timestamp;
        totalTRENIssued = totalIssuance;
        emit TotalTRENIssuedUpdated(totalIssuance);

        return issuance;
    }

    function _getLastUpdateTokenDistribution() internal view returns (uint256) {
        require(lastUpdateTime != 0, "Stability pool hasn't been assigned");
        uint256 timePassed = (block.timestamp - lastUpdateTime) / SECONDS_IN_ONE_MINUTE;
        uint256 totalDistribuedSinceBeginning = trenDistribution * timePassed;

        return totalDistribuedSinceBeginning;
    }

    function sendTREN(address _account, uint256 _TRENamount) external override onlyStabilityPool {
        uint256 balanceTREN = trenToken.balanceOf(address(this));
        uint256 safeAmount = balanceTREN >= _TRENamount ? _TRENamount : balanceTREN;

        if (safeAmount == 0) {
            return;
        }

        IERC20(address(trenToken)).safeTransfer(_account, safeAmount);
    }

    function setWeeklyTrenDistribution(uint256 _weeklyReward) external isController {
        trenDistribution = _weeklyReward / DISTRIBUTION_DURATION;
    }
}
