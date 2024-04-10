// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IPriceFeedL2 {
    // Custom Errors
    // --------------------------------------------------------------------------------------------------

    error PriceFeedL2__SequencerDown();
    error PriceFeedL2__SequencerGracePeriodNotOver();
    error PriceFeedL2__SequencerZeroAddress();

    // Events
    // -----------------------------------------------------------------------------------------------------------

    event SequencerUptimeFeedUpdated(address _sequencerUptimeFeed);

    // Functions
    // ------------------------------------------------------------------------------------------------------

    function setSequencerUptimeFeedAddress(address _sequencerUptimeFeedAddress) external;

    function fetchPrice(address _token) external view returns (uint256);
}
