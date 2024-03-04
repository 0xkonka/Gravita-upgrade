// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

contract Timelock {
    event NewAdmin(address indexed newAdmin);
    event NewPendingAdmin(address indexed newPendingAdmin);
    event NewDelay(uint256 indexed newDelay);
    event CancelTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string signature,
        bytes data,
        uint256 eta
    );
    event ExecuteTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string signature,
        bytes data,
        uint256 eta
    );
    event QueueTransaction(
        bytes32 indexed txHash,
        address indexed target,
        uint256 value,
        string signature,
        bytes data,
        uint256 eta
    );

    error Timelock__DelayMustExceedMininumDelay();
    error Timelock__DelayMustNotExceedMaximumDelay();
    error Timelock__TimelockOnly();
    error Timelock__PendingAdminOnly();
    error Timelock__AdminOnly();
    error Timelock__ETAMustSatisfyDelay();
    error Timelock__TxNoQueued();
    error Timelock__TxAlreadyQueued();
    error Timelock__TxStillLocked();
    error Timelock__TxExpired();
    error Timelock__TxReverted();

    string public constant NAME = "Timelock";

    uint256 public constant GRACE_PERIOD = 14 days;
    uint256 public constant MINIMUM_DELAY = 2 days;
    uint256 public constant MAXIMUM_DELAY = 15 days;

    address public admin;
    address public pendingAdmin;
    uint256 public delay;

    mapping(bytes32 => bool) public queuedTransactions;

    modifier isValidDelay(uint256 _delay) virtual {
        if (_delay < MINIMUM_DELAY) {
            revert Timelock__DelayMustExceedMininumDelay();
        }
        if (_delay > MAXIMUM_DELAY) {
            revert Timelock__DelayMustNotExceedMaximumDelay();
        }
        _;
    }

    modifier adminOnly() {
        if (msg.sender != admin) {
            revert Timelock__AdminOnly();
        }
        _;
    }

    constructor(uint256 _delay, address _adminAddress) isValidDelay(_delay) {
        require(_adminAddress != address(0));
        admin = _adminAddress;
        delay = _delay;
    }

    receive() external payable { }

    function setDelay(uint256 _delay) external isValidDelay(_delay) {
        if (msg.sender != address(this)) {
            revert Timelock__TimelockOnly();
        }
        delay = _delay;

        emit NewDelay(_delay);
    }

    function acceptAdmin() external {
        if (msg.sender != pendingAdmin) {
            revert Timelock__PendingAdminOnly();
        }
        admin = msg.sender;
        pendingAdmin = address(0);

        emit NewAdmin(msg.sender);
    }

    function setPendingAdmin(address _pendingAdmin) external {
        if (msg.sender != address(this)) {
            revert Timelock__TimelockOnly();
        }
        pendingAdmin = _pendingAdmin;

        emit NewPendingAdmin(_pendingAdmin);
    }

    function queueTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    )
        external
        adminOnly
        returns (bytes32)
    {
        if (eta < block.timestamp + delay || eta > block.timestamp + delay + GRACE_PERIOD) {
            revert Timelock__ETAMustSatisfyDelay();
        }

        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        if (queuedTransactions[txHash]) {
            revert Timelock__TxAlreadyQueued();
        }
        queuedTransactions[txHash] = true;

        emit QueueTransaction(txHash, target, value, signature, data, eta);
        return txHash;
    }

    function cancelTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    )
        external
        adminOnly
    {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        if (!queuedTransactions[txHash]) {
            revert Timelock__TxNoQueued();
        }
        queuedTransactions[txHash] = false;

        emit CancelTransaction(txHash, target, value, signature, data, eta);
    }

    function executeTransaction(
        address target,
        uint256 value,
        string memory signature,
        bytes memory data,
        uint256 eta
    )
        external
        payable
        adminOnly
        returns (bytes memory)
    {
        bytes32 txHash = keccak256(abi.encode(target, value, signature, data, eta));
        if (!queuedTransactions[txHash]) {
            revert Timelock__TxNoQueued();
        }
        if (block.timestamp < eta) {
            revert Timelock__TxStillLocked();
        }
        if (block.timestamp > eta + GRACE_PERIOD) {
            revert Timelock__TxExpired();
        }

        queuedTransactions[txHash] = false;

        bytes memory callData;

        if (bytes(signature).length == 0) {
            callData = data;
        } else {
            callData = abi.encodePacked(bytes4(keccak256(bytes(signature))), data);
        }

        // Execute the call
        (bool success, bytes memory returnData) = target.call{ value: value }(callData);
        if (!success) {
            revert Timelock__TxReverted();
        }

        emit ExecuteTransaction(txHash, target, value, signature, data, eta);

        return returnData;
    }
}