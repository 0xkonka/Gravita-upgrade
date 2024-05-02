// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract ConfigurableAddresses is OwnableUpgradeable {
    address public adminContract;
    address public borrowerOperations;
    address public collSurplusPool;
    address public communityIssuance;
    address public debtToken;
    address public feeCollector;
    address public flashLoanAddress;
    address public trenStaking;
    address public priceFeed;
    address public sortedTrenBoxes;
    address public stabilityPool;
    address public timelockAddress;
    address public treasuryAddress;
    address public trenBoxManager;
    address public trenBoxManagerOperations;
    address public trenBoxStorage;

    bool public isAddressSetupInitialized;

    /**
     * @dev This empty reserved space is put in place to allow future versions to add new
     * variables without shifting down storage in the inheritance chain.
     * See https://docs.openzeppelin.com/contracts/4.x/upgradeable#storage_gaps
     */
    uint256[33] private __gap; // Goerli uses 47; Arbitrum uses 33

    error ConfigurableAddresses__SetupIsInitialized();
    error ConfigurableAddresses__ZeroAddresses(uint256 position, address address_);
    error ConfigurableAddresses__CommunityIssuanceZeroAddress();
    error ConfigurableAddresses__TRENStakingZeroAddress();
    error ConfigurableAddresses__LengthMismatch();

    // Dependency setters
    // -----------------------------------------------------------------------------------------------

    function setAddresses(address[] calldata _addresses) external onlyOwner {
        if (isAddressSetupInitialized) {
            revert ConfigurableAddresses__SetupIsInitialized();
        }
        if (_addresses.length != 14) {
            revert ConfigurableAddresses__LengthMismatch();
        }

        for (uint256 i = 0; i < 14; i++) {
            if (_addresses[i] == address(0)) {
                revert ConfigurableAddresses__ZeroAddresses(i, _addresses[i]);
            }
        }
        adminContract = _addresses[0];
        borrowerOperations = _addresses[1];
        collSurplusPool = _addresses[2];
        debtToken = _addresses[3];
        feeCollector = _addresses[4];
        flashLoanAddress = _addresses[5];
        priceFeed = _addresses[6];
        sortedTrenBoxes = _addresses[7];
        stabilityPool = _addresses[8];
        timelockAddress = _addresses[9];
        treasuryAddress = _addresses[10];
        trenBoxManager = _addresses[11];
        trenBoxManagerOperations = _addresses[12];
        trenBoxStorage = _addresses[13];

        isAddressSetupInitialized = true;
    }

    function setCommunityIssuance(address _communityIssuance) public onlyOwner {
        if (_communityIssuance == address(0)) {
            revert ConfigurableAddresses__CommunityIssuanceZeroAddress();
        }
        communityIssuance = _communityIssuance;
    }

    function setTRENStaking(address _trenStaking) public onlyOwner {
        if (_trenStaking == address(0)) {
            revert ConfigurableAddresses__TRENStakingZeroAddress();
        }
        trenStaking = _trenStaking;
    }
}
