// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

interface ITrenBase {
    struct Colls {
        // tokens and amounts should be the same length
        address[] tokens;
        uint256[] amounts;
    }
}
