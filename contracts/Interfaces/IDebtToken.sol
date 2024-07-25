// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title IDebtToken
 * @notice Defines the basic interface for DebtToken contract.
 */
interface IDebtToken is IERC20 {
    /**
     * @dev Emitted when minting debt tokens against specific collateral asset
     * is stopped.
     * @param _asset The address of the collateral asset.
     * @param _state The indicator that shows if minting is stopped or not.
     */
    event EmergencyStopMintingCollateral(address indexed _asset, bool _state);

    /**
     * @dev Emitted when a contract is added to whitelist or removed from it.
     * @param _address The address of contract to add or remove.
     * @param _whitelisted The indicator that shows if contract is added or removed.
     */
    event WhitelistChanged(address indexed _address, bool _whitelisted);

    /**
     * @dev Emitted when BorrowerOperations, StabilityPool, and TrenBoxManager addresses
     * are set.
     * @param _borrowerOperations The address of BorrowerOperations.
     * @param _stabilityPool The address of StabilityPool.
     * @param _trenBoxManager The address of TrenBoxManager.
     */
    event ProtocolContractsAddressesSet(
        address indexed _borrowerOperations,
        address indexed _stabilityPool,
        address indexed _trenBoxManager
    );

    /**
     * @dev Error emitted when a specific collateral has been already blocked from minting.
     * @param _collateral The address of the collateral asset.
     */
    error DebtToken__MintBlockedForCollateral(address _collateral);

    /**
     * @dev Error emitted when zero address is set as BorrowerOperations, StabilityPool
     * or TrenBoxManager.
     */
    error DebtToken__InvalidAddressToConnect();

    /**
     * @dev Error emitted when BorrowerOperations, StabilityPool or TrenBoxManager addresses
     * are already connected.
     */
    error DebtToken__AddressesAlreadyConnected();

    /**
     * @dev Error emitted when the recipient address is zero address.
     */
    error DebtToken__CannotTransferTokensToZeroAddress();

    /**
     * @dev Error emitted when the recipient address is token contract address itself.
     */
    error DebtToken__CannotTransferTokensToTokenContract();

    /**
     * @dev Error emitted when caller is not whitelisted contract.
     * @param _notWhitelistedContract The address of not whitelisted contract.
     */
    error DebtToken__NotWhitelistedContract(address _notWhitelistedContract);

    /**
     * @dev Error emitted when caller is not BorrowerOperations.
     * @param _caller The address of caller.
     */
    error DebtToken__CallerIsNotBorrowerOperations(address _caller);

    /**
     * @dev Error emitted when caller is not StabilityPool.
     * @param _caller The address of caller.
     */
    error DebtToken__CallerIsNotStabilityPool(address _caller);

    /**
     * @dev Error emitted when caller is neither BorrowerOperations nor StabilityPool.
     * nor TrenBoxManager
     */
    error DebtToken__CannotBurnTokens();

    /**
     * @dev Error emitted when caller is neither StabilityPool nor TrenBoxManager.
     */
    error DebtToken__CannotReturnFromPool();

    /**
     * @notice Allows the whitelisted contracts to mint debt tokens without any collateral.
     * @param _amount The amount to mint debt token.
     */
    function mintFromWhitelistedContract(uint256 _amount) external;

    /**
     * @notice Allows the whitelisted contracts to burn their debt tokens.
     * @param _amount The amount to burn debt token.
     */
    function burnFromWhitelistedContract(uint256 _amount) external;

    /**
     * @notice Allows BorrowerOperations to mint debt tokens to the specific account.
     * @param _asset The address of collateral asset.
     * @param _account The address of account to receive debt tokens.
     * @param _amount The amount to mint debt token.
     */
    function mint(address _asset, address _account, uint256 _amount) external;

    /**
     * @notice Allows BorrowerOperations, TrenBoxManager & StabilityPool to
     * burn debt tokens from the specific account
     * @param _account The address of account to burn debt tokens
     * @param _amount THe amount to burn debt tokens.
     */
    function burn(address _account, uint256 _amount) external;

    /**
     * @notice Transfers the debt tokens from a user to a pool contract.
     * @param _sender The address of account that sends debt tokens.
     * @param _poolAddress The address of pool to receive debt tokens.
     * @param _amount The amount to transfer debt tokens.
     */
    function sendToPool(address _sender, address _poolAddress, uint256 _amount) external;

    /**
     * @notice Sends debt tokens to a user from a pool contract.
     * @param _poolAddress The address of pool that sends debt tokens.
     * @param _receiver The address of account to receive debt tokens.
     * @param _amount The amount to send debt token.
     */
    function returnFromPool(address _poolAddress, address _receiver, uint256 _amount) external;
}
