// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

interface IDebtToken is IERC20 {
    event TokenBalanceUpdated(address _user, uint256 _amount);
    event EmergencyStopMintingCollateral(address _asset, bool state);
    event WhitelistChanged(address _whitelisted, bool whitelisted);
    event ProtocolContractsAddressesSet(
        address borrowerOperations, address stabilityPool, address trenBoxManager
    );

    error DebtToken__MintBlockedForCollateral(address collateral);
    error DebtToken__InvalidAddressToConnect();
    error DebtToken__CannotTransferTokensToZeroAddress();
    error DebtToken__CannotTransferTokensToTokenContract();
    error DebtToken__NotWhitelistedContract(address notWhitelistedContract);
    error DebtToken__CallerIsNotBorrowerOperations(address caller);
    error DebtToken__CallerIsNotStabilityPool(address caller);
    error DebtToken__CannotBurnTokens();
    error DebtToken__CannotReturnFromPool();

    function emergencyStopMinting(address _asset, bool status) external;

    function mint(address _asset, address _account, uint256 _amount) external;

    function mintFromWhitelistedContract(uint256 _amount) external;

    function burnFromWhitelistedContract(uint256 _amount) external;

    function burn(address _account, uint256 _amount) external;

    function sendToPool(address _sender, address poolAddress, uint256 _amount) external;

    function returnFromPool(address poolAddress, address user, uint256 _amount) external;

    function addWhitelist(address _address) external;

    function removeWhitelist(address _address) external;
}
