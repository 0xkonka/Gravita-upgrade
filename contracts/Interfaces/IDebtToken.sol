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

    /**
     * @notice Allow whitelisted contracts to mint debt tokens without any collateral
     * @param _amount debt token amount to mint
     */
    function mintFromWhitelistedContract(uint256 _amount) external;

    /**
     * @notice Allow whitelisted contracts to burn their debt tokens
     * @param _amount debt token amount to burn
     */
    function burnFromWhitelistedContract(uint256 _amount) external;

    /**
     * @notice Allow BorrowerOperations to mint debt tokens to the specified account
     * @param _asset address of collateral asset
     * @param _account address of account to receive debt tokens
     * @param _amount debt token amount to mint
     */
    function mint(address _asset, address _account, uint256 _amount) external;

    /**
     * @notice Allow BorrowerOperations, TrenBoxManager & StabilityPool to
     * burn debt tokens from the specified account
     * @param _account address of account to burn debt tokens
     * @param _amount debt token amount to burn
     */
    function burn(address _account, uint256 _amount) external;

    /**
     * @notice Transfer the debt tokens from a user to Pool
     * @param _sender address of account that sends debt tokens
     * @param _poolAddress address of pool to receive debt tokens
     * @param _amount debt token amount to transfer
     */
    function sendToPool(address _sender, address _poolAddress, uint256 _amount) external;

    /**
     * @notice Send debt tokens to a user from Pool
     * @param _poolAddress address of pool that sends debt tokens
     * @param _receiver address of account to receive debt tokens
     * @param _amount debt token amount to send
     */
    function returnFromPool(address _poolAddress, address _receiver, uint256 _amount) external;
}
