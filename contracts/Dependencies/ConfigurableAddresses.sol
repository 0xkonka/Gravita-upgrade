// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

abstract contract ConfigurableAddresses is OwnableUpgradeable {
    address public adminContract;
    address public borrowerOperations;
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
    uint256[35] private __gap;

    error ConfigurableAddresses__SetupIsInitialized();
    error ConfigurableAddresses__ZeroAddresses(uint256 position, address address_);
    error ConfigurableAddresses__CommunityIssuanceZeroAddress();
    error ConfigurableAddresses__TRENStakingZeroAddress();
    error ConfigurableAddresses__LengthMismatch();

    event CommunityIssuanceAddressSet(address _communityIssuance);
    event TRENStakingAddressSet(address _trenStaking);

    // Dependency setters
    // -----------------------------------------------------------------------------------------------

    function setAddresses(address[] calldata _addresses) external onlyOwner {
        if (isAddressSetupInitialized) {
            revert ConfigurableAddresses__SetupIsInitialized();
        }
        if (_addresses.length != 13) {
            revert ConfigurableAddresses__LengthMismatch();
        }

        for (uint256 i = 0; i < 13;) {
            if (_addresses[i] == address(0)) {
                revert ConfigurableAddresses__ZeroAddresses(i, _addresses[i]);
            }

            unchecked {
                ++i;
            }
        }

        adminContract = _addresses[0];
        borrowerOperations = _addresses[1];
        debtToken = _addresses[2];
        feeCollector = _addresses[3];
        flashLoanAddress = _addresses[4];
        priceFeed = _addresses[5];
        sortedTrenBoxes = _addresses[6];
        stabilityPool = _addresses[7];
        timelockAddress = _addresses[8];
        treasuryAddress = _addresses[9];
        trenBoxManager = _addresses[10];
        trenBoxManagerOperations = _addresses[11];
        trenBoxStorage = _addresses[12];

        isAddressSetupInitialized = true;
    }

    function setCommunityIssuance(address _communityIssuance) public onlyOwner {
        if (_communityIssuance == address(0)) {
            revert ConfigurableAddresses__CommunityIssuanceZeroAddress();
        }
        communityIssuance = _communityIssuance;

        emit CommunityIssuanceAddressSet(communityIssuance);
    }

    function setTRENStaking(address _trenStaking) public onlyOwner {
        if (_trenStaking == address(0)) {
            revert ConfigurableAddresses__TRENStakingZeroAddress();
        }
        trenStaking = _trenStaking;

        emit TRENStakingAddressSet(trenStaking);
    }
}
