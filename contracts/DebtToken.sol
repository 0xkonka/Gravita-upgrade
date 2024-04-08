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

    mapping(address asset => bool blocked) public emergencyStopMintingCollateral;

    mapping(address smartContract => bool whitelisted) public whitelistedContracts;

    constructor(address initialOwner) ERC20(NAME, SYMBOL) ERC20Permit(NAME) Ownable(initialOwner) { }

    function setAddresses(
        address _borrowerOperationsAddress,
        address _stabilityPoolAddress,
        address _trenBoxManagerAddress
    )
        public
        onlyOwner
    {
        require(
            _borrowerOperationsAddress != address(0) && _stabilityPoolAddress != address(0)
                && _trenBoxManagerAddress != address(0),
            "Invalid address"
        );
        borrowerOperationsAddress = _borrowerOperationsAddress;
        stabilityPoolAddress = _stabilityPoolAddress;
        trenBoxManagerAddress = _trenBoxManagerAddress;
    }

    function emergencyStopMinting(address _asset, bool status) external override onlyOwner {
        emergencyStopMintingCollateral[_asset] = status;

        emit EmergencyStopMintingCollateral(_asset, status);
    }

    function mintFromWhitelistedContract(uint256 _amount) external override {
        _requireCallerIsWhitelistedContract();
        _mint(msg.sender, _amount);
    }

    function burnFromWhitelistedContract(uint256 _amount) external override {
        _requireCallerIsWhitelistedContract();
        _burn(msg.sender, _amount);
    }

    function mint(address _asset, address _account, uint256 _amount) external override {
        _requireCallerIsBorrowerOperations();
        require(!emergencyStopMintingCollateral[_asset], "Mint is blocked on this collateral");

        _mint(_account, _amount);
    }

    function burn(address _account, uint256 _amount) external override {
        _requireCallerIsBOorTrenBoxMorSP();
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

    function sendToPool(address _sender, address _poolAddress, uint256 _amount) external override {
        _requireCallerIsStabilityPool();
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
        _requireCallerIsTrenBoxMorSP();
        _transfer(_poolAddress, _receiver, _amount);
    }

    // --- External functions ---

    function transfer(
        address recipient,
        uint256 amount
    )
        public
        override(IERC20, ERC20)
        returns (bool)
    {
        _requireValidRecipient(recipient);
        return super.transfer(recipient, amount);
    }

    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    )
        public
        override(IERC20, ERC20)
        returns (bool)
    {
        _requireValidRecipient(recipient);
        return super.transferFrom(sender, recipient, amount);
    }

    // --- 'require' functions ---

    function _requireValidRecipient(address _recipient) internal view {
        require(
            _recipient != address(0) && _recipient != address(this),
            "DebtToken: Cannot transfer tokens directly to the token contract or the zero address"
        );
    }

    function _requireCallerIsWhitelistedContract() internal view {
        require(whitelistedContracts[msg.sender], "DebtToken: Caller is not a whitelisted SC");
    }

    function _requireCallerIsBorrowerOperations() internal view {
        require(
            msg.sender == borrowerOperationsAddress, "DebtToken: Caller is not BorrowerOperations"
        );
    }

    function _requireCallerIsBOorTrenBoxMorSP() internal view {
        require(
            msg.sender == borrowerOperationsAddress || msg.sender == trenBoxManagerAddress
                || msg.sender == stabilityPoolAddress,
            "DebtToken: Caller is neither BorrowerOperations nor TrenBoxManager nor StabilityPool"
        );
    }

    function _requireCallerIsStabilityPool() internal view {
        require(msg.sender == stabilityPoolAddress, "DebtToken: Caller is not the StabilityPool");
    }

    function _requireCallerIsTrenBoxMorSP() internal view {
        require(
            msg.sender == trenBoxManagerAddress || msg.sender == stabilityPoolAddress,
            "DebtToken: Caller is neither TrenBoxManager nor StabilityPool"
        );
    }
}
