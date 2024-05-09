// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";

contract DebtToken is IDebtToken, ERC20Permit, Ownable {
    /// @notice The debt token name.
    string public constant NAME = "TREN Debt Token";

    /// @notice The debt token symbol.
    string public constant SYMBOL = "trenUSD";

    /// @notice The address of BorrowerOperations
    address public borrowerOperationsAddress;

    /// @notice The address of StabilityPool
    address public stabilityPoolAddress;

    /// @notice The address of TrenBoxManager
    address public trenBoxManagerAddress;

    /// @notice The mapping from collateral asset address to mintable status
    mapping(address collateral => bool isStopped) public emergencyStopMintingCollateral;

    /// @notice The mapping from contract address to its whitelisted status
    mapping(address whitelistedContract => bool isWhitelisted) public whitelistedContracts;

    // ======================= Modifiers ======================= //

    modifier onlyWhitelistedContract() {
        if (!whitelistedContracts[msg.sender]) {
            revert DebtToken__NotWhitelistedContract(msg.sender);
        }
        _;
    }

    modifier shouldTransferToValidRecipent(address _recipient) {
        if (_recipient == address(0)) {
            revert DebtToken__CannotTransferTokensToZeroAddress();
        } else if (_recipient == address(this)) {
            revert DebtToken__CannotTransferTokensToTokenContract();
        }
        _;
    }

    modifier onlyBorrowerOperations() {
        if (msg.sender != borrowerOperationsAddress) {
            revert DebtToken__CallerIsNotBorrowerOperations(msg.sender);
        }
        _;
    }

    modifier onlyStabilityPool() {
        if (msg.sender != stabilityPoolAddress) {
            revert DebtToken__CallerIsNotStabilityPool(msg.sender);
        }
        _;
    }

    constructor(address initialOwner) ERC20(NAME, SYMBOL) ERC20Permit(NAME) Ownable(initialOwner) { }

    /**
     * @notice Stops minting debt tokens against specific collateral asset in emergency case.
     * @param _asset The address of collateral asset.
     * @param _status The indicator whether minting is possible or not.
     */
    function emergencyStopMinting(address _asset, bool _status) external onlyOwner {
        emergencyStopMintingCollateral[_asset] = _status;

        emit EmergencyStopMintingCollateral(_asset, _status);
    }

    /**
     * @notice Sets addresses of BorrowerOperations, StabilityPool, and TrenBoxManager.
     * @param _borrowerOperationsAddress The address of BorrowerOperations contract.
     * @param _stabilityPoolAddress The address of StabilityPool contract.
     * @param _trenBoxManagerAddress The  address of TrenBoxManager contract.
     */
    function setAddresses(
        address _borrowerOperationsAddress,
        address _stabilityPoolAddress,
        address _trenBoxManagerAddress
    )
        external
        onlyOwner
    {
        if (
            _borrowerOperationsAddress == address(0) || _stabilityPoolAddress == address(0)
                || _trenBoxManagerAddress == address(0)
        ) {
            revert DebtToken__InvalidAddressToConnect();
        }

        borrowerOperationsAddress = _borrowerOperationsAddress;
        stabilityPoolAddress = _stabilityPoolAddress;
        trenBoxManagerAddress = _trenBoxManagerAddress;

        emit ProtocolContractsAddressesSet(
            _borrowerOperationsAddress, _stabilityPoolAddress, _trenBoxManagerAddress
        );
    }

    /**
     * @notice Adds a contract to whitelist, called by only owner.
     * @param _address The address of contract to add.
     */
    function addWhitelist(address _address) external onlyOwner {
        whitelistedContracts[_address] = true;

        emit WhitelistChanged(_address, true);
    }

    /**
     * @notice Removes a contract from whitelist, called by only owner.
     * @param _address The address of contract to remove.
     */
    function removeWhitelist(address _address) external onlyOwner {
        whitelistedContracts[_address] = false;

        emit WhitelistChanged(_address, false);
    }

    function mintFromWhitelistedContract(uint256 _amount)
        external
        override
        onlyWhitelistedContract
    {
        _mint(msg.sender, _amount);
    }

    function burnFromWhitelistedContract(uint256 _amount)
        external
        override
        onlyWhitelistedContract
    {
        _burn(msg.sender, _amount);
    }

    function mint(
        address _asset,
        address _account,
        uint256 _amount
    )
        external
        override
        onlyBorrowerOperations
    {
        if (emergencyStopMintingCollateral[_asset]) {
            revert DebtToken__MintBlockedForCollateral(_asset);
        }

        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external override {
        if (
            msg.sender != borrowerOperationsAddress && msg.sender != trenBoxManagerAddress
                && msg.sender != stabilityPoolAddress
        ) {
            revert DebtToken__CannotBurnTokens();
        }
        _burn(_account, _amount);
    }

    function sendToPool(
        address _sender,
        address _poolAddress,
        uint256 _amount
    )
        external
        override
        onlyStabilityPool
    {
        _transfer(_sender, _poolAddress, _amount);
    }

    function returnFromPool(
        address _poolAddress,
        address _receiver,
        uint256 _amount
    )
        external
        override
    {
        if (msg.sender != stabilityPoolAddress && msg.sender != trenBoxManagerAddress) {
            revert DebtToken__CannotReturnFromPool();
        }
        _transfer(_poolAddress, _receiver, _amount);
    }

    /**
     * @notice Transfers debt tokens from caller to another account.
     * @param _recipient The address of account to receive debt tokens.
     * @param _amount The amount to transfer debt tokens.
     */
    function transfer(
        address _recipient,
        uint256 _amount
    )
        public
        override(IERC20, ERC20)
        shouldTransferToValidRecipent(_recipient)
        returns (bool)
    {
        return super.transfer(_recipient, _amount);
    }

    /**
     * @notice Transfers debt tokens from specified sender to another account.
     * @param _sender The address of account that sends debt tokens.
     * @param _recipient The address of account to receive debt tokens.
     * @param _amount The amount to transfer debt tokens.
     */
    function transferFrom(
        address _sender,
        address _recipient,
        uint256 _amount
    )
        public
        override(IERC20, ERC20)
        shouldTransferToValidRecipent(_recipient)
        returns (bool)
    {
        return super.transferFrom(_sender, _recipient, _amount);
    }
}
