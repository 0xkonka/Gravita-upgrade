// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

contract GasPool is Ownable {
    // do nothing, as the core contracts have permission to send to and burn from this address

    string public constant NAME = "GasPool";

    constructor(address initialOwner) Ownable(initialOwner) { }
}
