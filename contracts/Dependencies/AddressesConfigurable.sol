// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract AddressesConfigurable is OwnableUpgradeable {
    address public activePool;
    address public adminContract;
    address public borrowerOperations;
    address public collSurplusPool;
    address public communityIssuance;
    address public debtToken;
    address public defaultPool;
    address public feeCollector;
    address public flashLoanAddress;
    address public gasPoolAddress;
    address public trenStaking;
    address public priceFeed;
    address public sortedTrenBoxes;
    address public stabilityPool;
    address public timelockAddress;
    address public treasuryAddress;
    address public trenBoxManager;
    address public trenBoxManagerOperations;

    bool public isAddressSetupInitialized;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[33] private __gap; // Goerli uses 47; Arbitrum uses 33

    // Dependency setters
    // -----------------------------------------------------------------------------------------------

    function setAddresses(address[] calldata _addresses) external onlyOwner {
        require(!isAddressSetupInitialized, "Setup is already initialized");
        require(_addresses.length == 16, "Expected 16 addresses at setup");
        for (uint256 i = 0; i < 16; i++) {
            require(_addresses[i] != address(0), "Invalid address");
        }
        activePool = _addresses[0];
        adminContract = _addresses[1];
        borrowerOperations = _addresses[2];
        collSurplusPool = _addresses[3];
        debtToken = _addresses[4];
        defaultPool = _addresses[5];
        feeCollector = _addresses[6];
        flashLoanAddress = _addresses[7];
        gasPoolAddress = _addresses[8];
        priceFeed = _addresses[9];
        sortedTrenBoxes = _addresses[10];
        stabilityPool = _addresses[11];
        timelockAddress = _addresses[12];
        treasuryAddress = _addresses[13];
        trenBoxManager = _addresses[14];
        trenBoxManagerOperations = _addresses[15];

        isAddressSetupInitialized = true;
    }

    function setCommunityIssuance(address _communityIssuance) public onlyOwner {
        communityIssuance = _communityIssuance;
    }

    function setTRENStaking(address _trenStaking) public onlyOwner {
        trenStaking = _trenStaking;
    }
}
