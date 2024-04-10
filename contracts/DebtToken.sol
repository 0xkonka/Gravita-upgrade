// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";
import { ERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";

contract DebtToken is IDebtToken, ERC20Permit, Ownable {
    string public constant NAME = "TREN Debt Token";
    string public constant SYMBOL = "trenUSD";

    address public borrowerOperationsAddress;
    address public stabilityPoolAddress;
    address public trenBoxManagerAddress;

    mapping(address collateral => bool isStopped) public emergencyStopMintingCollateral;
    mapping(address whitelistedContract => bool isWhitelisted) public whitelistedContracts;

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

    function emergencyStopMinting(address _asset, bool status) external override onlyOwner {
        emergencyStopMintingCollateral[_asset] = status;

        emit EmergencyStopMintingCollateral(_asset, status);
    }

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

    function addWhitelist(address _address) external override onlyOwner {
        whitelistedContracts[_address] = true;

        emit WhitelistChanged(_address, true);
    }

    function removeWhitelist(address _address) external override onlyOwner {
        whitelistedContracts[_address] = false;

        emit WhitelistChanged(_address, false);
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

    function transfer(
        address recipient,
        uint256 amount
    )
        public
        override(IERC20, ERC20)
        shouldTransferToValidRecipent(recipient)
        returns (bool)
    {
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
        public
        override(IERC20, ERC20)
        shouldTransferToValidRecipent(recipient)
        returns (bool)
    {
        return super.transferFrom(sender, recipient, amount);
    }
}
