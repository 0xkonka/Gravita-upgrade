// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

/**
 * @title ISortedTrenBoxes
 * @notice Defines the basic interface for SortedTrenBoxes contract.
 */
interface ISortedTrenBoxes {
    // --- Structs ---

    /**
     * @dev Struct for storing Node information.
     * @param exists The existence indicator.
     * @param nextId The Id of next Node (smaller NICR) in the list.
     * @param prevId The Id of previous Node (larger NICR) in the list.
     */
    struct Node {
        bool exists;
        address nextId;
        address prevId;
    }

    /**
     * @dev Struct for storing Node list.
     * @param head The head of the list. Also the Node in the list with the largest NICR.
     * @param tail The tail of the list. Also the Node in the list with the smallest NICR.
     * @param size The current size of the list.
     * @param nodes The mapping from depositor address to its Node in the list.
     */
    struct TrenBoxesList {
        address head;
        address tail;
        uint256 size;
        mapping(address depositor => Node node) nodes;
    }

    // --- Events ---

    /**
     * @dev Emitted when the new Node is added to the list.
     * @param _asset The address of collateral asset.
     * @param _id The new Node's id.
     * @param _NICR The new Node's NICR.
     */
    event NodeAdded(address indexed _asset, address _id, uint256 _NICR);

    /**
     * @dev Emitted when a Node is removed from the list.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    event NodeRemoved(address indexed _asset, address _id);

    // --- Errors ---

    /// @dev Error emitted when the list does not contain the specific Node.
    error SortedTrenBoxes__ListDoesNotContainNode();

    /// @dev Error emitted when the list already contains the specific Node.
    error SortedTrenBoxes__ListAlreadyContainsNode();

    /// @dev Error emitted when the specific Node's id is zero.
    error SortedTrenBoxes__IdCannotBeZeroAddress();

    /// @dev Error emitted when the specific Node's NICR is zero.
    error SortedTrenBoxes__NICRMustBeGreaterThanZero();

    /// @dev Error emitted when the caller is not TrenBoxManager contract.
    error SortedTrenBoxes__CallerMustBeTrenBoxManager();

    /// @dev Error emitted when the caller is neither BorrowerOperations nor
    /// TrenBoxManager contract.
    error SortedTrenBoxes__CallerMustBeBorrowerOperationsOrTrenBoxManager();

    // --- Functions ---

    /**
     * @notice Adds a new Node to the list.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous node for the insert position.
     * @param _nextId The Id of next node for the insert position.
     */
    function insert(
        address _asset,
        address _id,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external;

    /**
     * @notice Removes a Node from the list.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    function remove(address _asset, address _id) external;

    /**
     * @notice Reinserts the Node at a new position based on its new NICR.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     * @param _newNICR The Node's new NICR.
     * @param _prevId The Id of previous Node for the new insert position.
     * @param _nextId The Id of next Node for the new insert position.
     */
    function reInsert(
        address _asset,
        address _id,
        uint256 _newNICR,
        address _prevId,
        address _nextId
    )
        external;

    /**
     * @notice Checks if the list contains a Node.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    function contains(address _asset, address _id) external view returns (bool);

    /**
     * @notice Checks if the list is empty.
     * @param _asset The address of collateral asset.
     */
    function isEmpty(address _asset) external view returns (bool);

    /**
     * @notice Returns the current size of the list.
     * @param _asset The address of collateral asset.
     */
    function getSize(address _asset) external view returns (uint256);

    /**
     * @notice Returns the first Node (with the largest NICR) in the list.
     * @param _asset The address of collateral asset.
     */
    function getFirst(address _asset) external view returns (address);

    /**
     * @notice Returns the last Node (with the smallest NICR) in the list.
     * @param _asset The address of collateral asset.
     */
    function getLast(address _asset) external view returns (address);

    /**
     * @notice Returns the next Node (with a smaller NICR) in the list for
     * a given Node.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    function getNext(address _asset, address _id) external view returns (address);

    /**
     * @notice Returns the previous Node (with a larger NICR) in the list for
     * a given Node.
     * @param _asset The address of collateral asset.
     * @param _id The Node's id.
     */
    function getPrev(address _asset, address _id) external view returns (address);

    /**
     * @notice Checks if a pair of Nodes is a valid insertion point for
     * a new Node with the given NICR.
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous Node for the insert position.
     * @param _nextId The Id of next Node for the insert position.
     */
    function validInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external
        view
        returns (bool);

    /**
     * @notice Finds the insert position for a new Node with the given NICR.
     * @param _asset The address of collateral asset.
     * @param _NICR The Node's NICR.
     * @param _prevId The Id of previous node for the insert position.
     * @param _nextId The Id of next node for the insert position.
     */
    function findInsertPosition(
        address _asset,
        uint256 _NICR,
        address _prevId,
        address _nextId
    )
        external
        view
        returns (address, address);
}
