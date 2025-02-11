// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";

import { ISortedTrenBoxes } from "./Interfaces/ISortedTrenBoxes.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";

/**
 * @title SortedTrenBoxes
 * @notice A sorted doubly linked list with nodes sorted in descending order.
 *
 * Nodes map to active TrenBoxes in the system - the ID property is the address of a TrenBox owner.
 * Nodes are ordered according to their current nominal individual collateral ratio (NICR),
 * which is like the ICR but without the price, i.e., just collateral / debt.
 *
 * The list optionally accepts insert position hints.
 *
 * @dev NICRs are computed dynamically at runtime, and not stored on the Node. This is because
 * NICRs of active TrenBoxes change dynamically as liquidation events occur.
 *
 * The list relies on the fact that liquidation events preserve ordering: a liquidation decreases
 * the NICRs of all active TrenBoxes, but maintains their order.
 * A node inserted based on current NICR will maintain the correct position,
 * relative to it's peers, as rewards accumulate, as long as it's raw collateral and debt have not
 * changed.
 * Thus, Nodes remain sorted by current NICR.
 *
 * Nodes need only be re-inserted upon a TrenBox operation - when the owner adds or removes
 * collateral or debt to their position.
 *
 * The list is a modification of the following audited SortedDoublyLinkedList:
 * https://github.com/livepeer/protocol/blob/master/contracts/libraries/SortedDoublyLL.sol
 *
 * Changes made in the Gravita implementation:
 *
 * - Keys have been removed from nodes
 *
 * - Ordering checks for insertion are performed by comparing an NICR argument to the current NICR,
 * calculated at runtime.
 *   The list relies on the property that ordering by ICR is maintained as the ETH:USD price varies.
 *
 * - Public functions with parameters have been made internal to save gas, and given an external
 * wrapper function for external access
 */
contract SortedTrenBoxes is
    OwnableUpgradeable,
    UUPSUpgradeable,
    ISortedTrenBoxes,
    ConfigurableAddresses
{
    /// @notice The contract name.
    string public constant NAME = "SortedTrenBoxes";
    /// @notice The mapping from collateral asset to its Node list.
    mapping(address collateral => TrenBoxesList orderedList) public trenBoxes;

    // Modifiers
    // ------------------------------------------------------------------------------------------------------

    modifier onlyTrenBoxManager() {
        if (msg.sender != trenBoxManager) {
            revert SortedTrenBoxes__CallerMustBeTrenBoxManager();
        }
        _;
    }

    modifier onlyBorrowerOperationsOrTrenBoxManager() {
        if (msg.sender != borrowerOperations && msg.sender != trenBoxManager) {
            revert SortedTrenBoxes__CallerMustBeBorrowerOperationsOrTrenBoxManager();
        }
        _;
    }

    modifier hasNonZeroId(address _id) {
        if (_id == address(0)) {
            revert SortedTrenBoxes__IdCannotBeZeroAddress();
        }
        _;
    }

    modifier hasPositiveNICR(uint256 _NICR) {
        if (_NICR == 0) {
            revert SortedTrenBoxes__NICRMustBeGreaterThanZero();
        }
        _;
    }

    // Initializer
    // ------------------------------------------------------------------------------------------------------

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // External/public functions
    // --------------------------------------------------------------------------------------

    /// @inheritdoc ISortedTrenBoxes
    function insert(
        address _asset,
        address _id,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external
        override
        onlyBorrowerOperationsOrTrenBoxManager
    {
        _insert(_asset, _id, _NICR, _prevId, _nextId);
    }

    /// @inheritdoc ISortedTrenBoxes
    function remove(address _asset, address _id) external override onlyTrenBoxManager {
        _remove(_asset, _id);
    }

    /// @inheritdoc ISortedTrenBoxes
    function reInsert(
        address _asset,
        address _id,
        uint256 _newNICR,
        address _prevId,
        address _nextId
    )
        external
        override
        onlyBorrowerOperationsOrTrenBoxManager
    {
        if (!contains(_asset, _id)) {
            revert SortedTrenBoxes__ListDoesNotContainNode();
        }

        if (_newNICR == 0) {
            revert SortedTrenBoxes__NICRMustBeGreaterThanZero();
        }

        _remove(_asset, _id);
        _insert(_asset, _id, _newNICR, _prevId, _nextId);
    }

    /// @inheritdoc ISortedTrenBoxes
    function contains(address _asset, address _id) public view override returns (bool) {
        return trenBoxes[_asset].nodes[_id].exists;
    }

    /// @inheritdoc ISortedTrenBoxes
    function isEmpty(address _asset) public view override returns (bool) {
        return trenBoxes[_asset].size == 0;
    }

    /// @inheritdoc ISortedTrenBoxes
    function getSize(address _asset) external view override returns (uint256) {
        return trenBoxes[_asset].size;
    }

    /// @inheritdoc ISortedTrenBoxes
    function getFirst(address _asset) external view override returns (address) {
        return trenBoxes[_asset].head;
    }

    /// @inheritdoc ISortedTrenBoxes
    function getLast(address _asset) external view override returns (address) {
        return trenBoxes[_asset].tail;
    }

    /// @inheritdoc ISortedTrenBoxes
    function getNext(address _asset, address _id) external view override returns (address) {
        return trenBoxes[_asset].nodes[_id].nextId;
    }

    /// @inheritdoc ISortedTrenBoxes
    function getPrev(address _asset, address _id) external view override returns (address) {
        return trenBoxes[_asset].nodes[_id].prevId;
    }

    /// @inheritdoc ISortedTrenBoxes
    function validInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external
        view
        override
        returns (bool)
    {
        return _validInsertPosition(_asset, _NICR, _prevId, _nextId);
    }

    /// @inheritdoc ISortedTrenBoxes
    function findInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external
        view
        override
        returns (address, address)
    {
        return _findInsertPosition(_asset, _NICR, _prevId, _nextId);
    }

    // Internal functions
    // ---------------------------------------------------------------------------------------------

    /**
     * @dev Adds a new Node to the list.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous node for the insert position.
     * @param _nextId The Id of next node for the insert position.
     */
    function _insert(
        address _asset,
        address _id,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        internal
        hasNonZeroId(_id)
        hasPositiveNICR(_NICR)
    {
        TrenBoxesList storage assetData = trenBoxes[_asset];

        if (_contains(assetData, _id)) {
            revert SortedTrenBoxes__ListAlreadyContainsNode();
        }

        address prevId = _prevId;
        address nextId = _nextId;

        if (!_validInsertPosition(_asset, _NICR, prevId, nextId)) {
            // Sender's hint was not a valid insert position
            // Use sender's hint to find a valid insert position
            (prevId, nextId) = _findInsertPosition(_asset, _NICR, prevId, nextId);
        }

        Node storage node = assetData.nodes[_id];
        node.exists = true;

        if (prevId == address(0) && nextId == address(0)) {
            // Insert as head and tail
            assetData.head = _id;
            assetData.tail = _id;
        } else if (prevId == address(0)) {
            // Insert before `prevId` as the head
            node.nextId = assetData.head;
            assetData.nodes[assetData.head].prevId = _id;
            assetData.head = _id;
        } else if (nextId == address(0)) {
            // Insert after `nextId` as the tail
            node.prevId = assetData.tail;
            assetData.nodes[assetData.tail].nextId = _id;
            assetData.tail = _id;
        } else {
            // Insert at insert position between `prevId` and `nextId`
            node.nextId = nextId;
            node.prevId = prevId;
            assetData.nodes[prevId].nextId = _id;
            assetData.nodes[nextId].prevId = _id;
        }

        assetData.size = assetData.size + 1;
        emit NodeAdded(_asset, _id, _NICR);
    }

    /**
     * @dev Removes a Node from the list.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    function _remove(address _asset, address _id) internal {
        TrenBoxesList storage assetData = trenBoxes[_asset];

        if (!_contains(assetData, _id)) {
            revert SortedTrenBoxes__ListDoesNotContainNode();
        }

        Node storage node = assetData.nodes[_id];
        if (assetData.size > 1) {
            // List contains more than a single node
            if (_id == assetData.head) {
                // The removed node is the head
                // Set head to next node
                assetData.head = node.nextId;
                // Set prev pointer of new head to null
                assetData.nodes[assetData.head].prevId = address(0);
            } else if (_id == assetData.tail) {
                // The removed node is the tail
                // Set tail to previous node
                assetData.tail = node.prevId;
                // Set next pointer of new tail to null
                assetData.nodes[assetData.tail].nextId = address(0);
            } else {
                // The removed node is neither the head nor the tail
                // Set next pointer of previous node to the next node
                assetData.nodes[node.prevId].nextId = node.nextId;
                // Set prev pointer of next node to the previous node
                assetData.nodes[node.nextId].prevId = node.prevId;
            }
        } else {
            // List contains a single node
            // Set the head and tail to null
            assetData.head = address(0);
            assetData.tail = address(0);
        }

        delete assetData.nodes[_id];
        assetData.size = assetData.size - 1;
        emit NodeRemoved(_asset, _id);
    }

    /**
     * @dev Checks if the list contains a Node.
     * @param _dataAsset The Node list.
     * @param _id The Node's id.
     */
    function _contains(
        TrenBoxesList storage _dataAsset,
        address _id
    )
        internal
        view
        returns (bool)
    {
        return _dataAsset.nodes[_id].exists;
    }

    /**
     * @dev Checks if a pair of Nodes is a valid insertion point for
     * a new Node with the given NICR.
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous Node for the insert position.
     * @param _nextId The Id of next Node for the insert position.
     */
    function _validInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        internal
        view
        returns (bool)
    {
        if (_prevId == address(0) && _nextId == address(0)) {
            // `(null, null)` is a valid insert position if the list is empty
            return isEmpty(_asset);
        } else if (_prevId == address(0)) {
            // `(null, _nextId)` is a valid insert position if `_nextId` is the head of the list
            return trenBoxes[_asset].head == _nextId
                && _NICR >= ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _nextId);
        } else if (_nextId == address(0)) {
            // `(_prevId, null)` is a valid insert position if `_prevId` is the tail of the list
            return trenBoxes[_asset].tail == _prevId
                && _NICR <= ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _prevId);
        } else {
            // `(_prevId, _nextId)` is a valid insert position if they are adjacent nodes and
            // `_NICR` falls between the two nodes' NICRs
            return trenBoxes[_asset].nodes[_prevId].nextId == _nextId
                && ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _prevId) >= _NICR
                && _NICR >= ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _nextId);
        }
    }

    /**
     * @dev Descends the list (larger NICRs to smaller NICRs) to find a valid insert position.
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _startId The Id of Node to start descending the list from.
     */
    function _descendList(
        address _asset,
        uint256 _NICR,
        address _startId
    )
        internal
        view
        returns (address, address)
    {
        TrenBoxesList storage assetData = trenBoxes[_asset];

        // If `_startId` is the head, check if the insert position is before the head
        if (
            assetData.head == _startId
                && _NICR >= ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _startId)
        ) {
            return (address(0), _startId);
        }

        address prevId = _startId;
        address nextId = assetData.nodes[prevId].nextId;

        // Descend the list until we reach the end or until we find a valid insert position
        while (prevId != address(0) && !_validInsertPosition(_asset, _NICR, prevId, nextId)) {
            prevId = assetData.nodes[prevId].nextId;
            nextId = assetData.nodes[prevId].nextId;
        }

        return (prevId, nextId);
    }

    /**
     * @dev Ascends the list (smaller NICRs to larger NICRs) to find a valid insert position
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _startId The Id of Node to start ascending the list from.
     */
    function _ascendList(
        address _asset,
        uint256 _NICR,
        address _startId
    )
        internal
        view
        returns (address, address)
    {
        TrenBoxesList storage assetData = trenBoxes[_asset];

        // If `_startId` is the tail, check if the insert position is after the tail
        if (
            assetData.tail == _startId
                && _NICR <= ITrenBoxManager(trenBoxManager).getNominalICR(_asset, _startId)
        ) {
            return (_startId, address(0));
        }

        address nextId = _startId;
        address prevId = assetData.nodes[nextId].prevId;

        // Ascend the list until we reach the end or until we find a valid insertion point
        while (nextId != address(0) && !_validInsertPosition(_asset, _NICR, prevId, nextId)) {
            nextId = assetData.nodes[nextId].prevId;
            prevId = assetData.nodes[nextId].prevId;
        }

        return (prevId, nextId);
    }

    /**
     * @dev Finds the insert position for a new Node with the given NICR.
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous node for the insert position.
     * @param _nextId The Id of next node for the insert position.
     */
    function _findInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        internal
        view
        returns (address, address)
    {
        address prevId = _prevId;
        address nextId = _nextId;

        if (prevId != address(0)) {
            if (
                !contains(_asset, prevId)
                    || _NICR > ITrenBoxManager(trenBoxManager).getNominalICR(_asset, prevId)
            ) {
                // `prevId` does not exist anymore or now has a smaller NICR than the given NICR
                prevId = address(0);
            }
        }

        if (nextId != address(0)) {
            if (
                !contains(_asset, nextId)
                    || _NICR < ITrenBoxManager(trenBoxManager).getNominalICR(_asset, nextId)
            ) {
                // `nextId` does not exist anymore or now has a larger NICR than the given NICR
                nextId = address(0);
            }
        }

        if (prevId == address(0) && nextId == address(0)) {
            // No hint - descend list starting from head
            return _descendList(_asset, _NICR, trenBoxes[_asset].head);
        } else if (prevId == address(0)) {
            // No `prevId` for hint - ascend list starting from `nextId`
            return _ascendList(_asset, _NICR, nextId);
        } else if (nextId == address(0)) {
            // No `nextId` for hint - descend list starting from `prevId`
            return _descendList(_asset, _NICR, prevId);
        } else {
            // Descend list starting from `prevId`
            return _descendList(_asset, _NICR, prevId);
        }
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
