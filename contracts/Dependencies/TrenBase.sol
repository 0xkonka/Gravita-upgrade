// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { ConfigurableAddresses } from "./ConfigurableAddresses.sol";
import { TrenMath } from "./TrenMath.sol";
import { TrenMath } from "./TrenMath.sol";

import { IAdminContract } from "../Interfaces/IAdminContract.sol";
import { ITrenBoxStorage } from "../Interfaces/ITrenBoxStorage.sol";

/*
* Base contract for TrenBoxManager, BorrowerOperations and StabilityPool. Contains global system
constants and
 * common functions.
 */
abstract contract TrenBase is OwnableUpgradeable, ConfigurableAddresses {
    struct Colls {
        address[] tokens;
        uint256[] amounts;
    }

    error TrenBase__FeeExceededMax(uint256 feePercentage, uint256 maxFeePercentage);

    // --- Gas compensation functions ---

    // Returns the composite debt (drawn debt + gas compensation) of a trenBox, for the purpose of
    // ICR calculation
    function _getCompositeDebt(address _asset, uint256 _debt) internal view returns (uint256) {
        return _debt + IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
    }

    function _getNetDebt(address _asset, uint256 _debt) internal view returns (uint256) {
        return _debt - IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
    }

    // Return the amount of ETH to be drawn from a trenBox's collateral and sent as gas
    // compensation.
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

    function getEntireSystemColl(address _asset) public view returns (uint256 entireSystemColl) {
        uint256 activeColl = ITrenBoxStorage(trenBoxStorage).getActiveCollateralBalance(_asset);
        uint256 liquidatedColl =
            ITrenBoxStorage(trenBoxStorage).getLiquidatedCollateralBalance(_asset);
        return activeColl + liquidatedColl;
    }

    function getEntireSystemDebt(address _asset) public view returns (uint256 entireSystemDebt) {
        uint256 activeDebt = ITrenBoxStorage(trenBoxStorage).getActiveDebtBalance(_asset);
        uint256 closedDebt = ITrenBoxStorage(trenBoxStorage).getLiquidatedDebtBalance(_asset);
        return activeDebt + closedDebt;
    }

    function _getTCR(address _asset, uint256 _price) internal view returns (uint256 TCR) {
        uint256 entireSystemColl = getEntireSystemColl(_asset);
        uint256 entireSystemDebt = getEntireSystemDebt(_asset);
        TCR = TrenMath._computeCR(entireSystemColl, entireSystemDebt, _price);
    }

    function _checkRecoveryMode(address _asset, uint256 _price) internal view returns (bool) {
        uint256 TCR = _getTCR(_asset, _price);
        return TCR < IAdminContract(adminContract).getCcr(_asset);
    }

    function _requireUserAcceptsFee(
        uint256 _fee,
        uint256 _amount,
        uint256 _maxFeePercentage
    )
        internal
        view
    {
        uint256 feePercentage = (_fee * IAdminContract(adminContract).DECIMAL_PRECISION()) / _amount;
        if (feePercentage > _maxFeePercentage) {
            revert TrenBase__FeeExceededMax(feePercentage, _maxFeePercentage);
        }
    }
}
