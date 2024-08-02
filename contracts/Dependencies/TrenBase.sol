// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { ConfigurableAddresses } from "./ConfigurableAddresses.sol";
import { TrenMath } from "./TrenMath.sol";
import { TrenMath } from "./TrenMath.sol";

import { IAdminContract } from "../Interfaces/IAdminContract.sol";
import { ITrenBoxStorage } from "../Interfaces/ITrenBoxStorage.sol";

/**
 * @title TrenBase
 * @notice Base contract for TrenBoxManager, BorrowerOperations and StabilityPool.
 * It contains global system constants and common functions.
 */
abstract contract TrenBase is OwnableUpgradeable, ConfigurableAddresses {
    /**
     * @dev Struct for storing arrays of collateral assets and their amounts.
     * @param tokens The address array of collateral assets.
     * @param amounts The amount array of collateral assets.
     */
    struct Colls {
        address[] tokens;
        uint256[] amounts;
    }

    /// @dev Error emitted when the fee percentage exceeds max value.
    error TrenBase__FeeExceededMax(uint256 feePercentage, uint256 maxFeePercentage);

    /**
     * @notice Returns the entire collateral amount of a specific asset.
     * @param _asset The address of collateral asset.
     */
    function getEntireSystemColl(address _asset) public view returns (uint256 entireSystemColl) {
        return ITrenBoxStorage(trenBoxStorage).getTotalCollateralBalance(_asset);
    }

    /**
     * @notice Returns the entire debt amount of a specific asset.
     * @param _asset The address of collateral asset.
     */
    function getEntireSystemDebt(address _asset) public view returns (uint256 entireSystemDebt) {
        return ITrenBoxStorage(trenBoxStorage).getTotalDebtBalance(_asset);
    }

    // --- Gas compensation functions ---

    /**
     * @dev Returns the composite debt (drawn debt + gas compensation) of a TrenBox, for
     * the purpose of ICR calculation.
     * @param _asset The address of collateral asset.
     * @param _debt The amount of debt tokens to draw.
     */
    function _getCompositeDebt(address _asset, uint256 _debt) internal view returns (uint256) {
        return _debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
    }

    /**
     * @dev Returns the net debt excluded gas compensation.
     * @param _asset The address of collateral asset.
     * @param _debt The total debt issued.
     */
    function _getNetDebt(address _asset, uint256 _debt) internal view returns (uint256) {
        return _debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
    }

    /**
     * @dev Returns the amount of collateral to be drawn from a TrenBox's collateral and sent as
     * gas compensation.
     * @param _asset The address of collateral asset.
     * @param _entireColl The entire collateral amount.
     */
    function _getCollGasCompensation(
        address _asset,
        uint256 _entireColl
    )
        internal
        view
        returns (uint256)
    {
        return _entireColl / IAdminContract(adminContract).getPercentDivisor(_asset);
    }

    /**
     * @dev Returns the total collateral ratio for a specific asset.
     * @param _asset The address of collateral asset.
     * @param _price The price collateral asset.
     */
    function _getTCR(address _asset, uint256 _price) internal view returns (uint256 TCR) {
        uint256 entireSystemColl = getEntireSystemColl(_asset);
        uint256 entireSystemDebt = getEntireSystemDebt(_asset);
        TCR = TrenMath._computeCR(entireSystemColl, entireSystemDebt, _price);
    }

    /**
     * @dev Checks if the current mode is Recovery Mode.
     * @param _asset The address of collateral asset.
     * @param _price The price collateral asset.
     */
    function _checkRecoveryMode(address _asset, uint256 _price) internal view returns (bool) {
        uint256 TCR = _getTCR(_asset, _price);
        return TCR < IAdminContract(adminContract).getCcr(_asset);
    }
}
