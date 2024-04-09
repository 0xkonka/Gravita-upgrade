// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { TrenMath } from "../Dependencies/TrenMath.sol";

contract TrenMathTester {
    function min(uint256 _a, uint256 _b) external pure returns (uint256) {
        return TrenMath._min(_a, _b);
    }

    function max(uint256 _a, uint256 _b) external pure returns (uint256) {
        return TrenMath._max(_a, _b);
    }

    /**
     * @dev Multiply two decimal numbers and use normal rounding rules:
     * -round product up if 19'th mantissa digit >= 5
     * -round product down if 19'th mantissa digit < 5
     *
     * Used only inside the exponentiation, _decPow().
     */
    function decMul(uint256 x, uint256 y) external pure returns (uint256) {
        return TrenMath.decMul(x, y);
    }

    /**
     * @dev Exponentiation function for 18-digit decimal base, and integer exponent n.
     * Uses the efficient "exponentiation by squaring" algorithm. O(log(n)) complexity.
     */
    function decPow(uint256 _base, uint256 _minutes) external pure returns (uint256) {
        return TrenMath._decPow(_base, _minutes);
    }

    function getAbsoluteDifference(uint256 _a, uint256 _b) external pure returns (uint256) {
        return TrenMath._getAbsoluteDifference(_a, _b);
    }

    function computeNominalCR(uint256 _coll, uint256 _debt) external pure returns (uint256) {
        return TrenMath._computeNominalCR(_coll, _debt);
    }

    function computeCR(
        uint256 _coll,
        uint256 _debt,
        uint256 _price
    )
        external
        pure
        returns (uint256)
    {
        return TrenMath._computeCR(_coll, _debt, _price);
    }
}
