// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { API3ProxyInterface } from "../Pricing/API3ProxyInterface.sol";

contract MockApi3Proxy is API3ProxyInterface {
    int224 public value = 1_012_695_777_067_725_000;

    function setValue(int224 _newValue) external {
        value = _newValue;
    }

    function read() external view override returns (int224, uint32) {
        return (value, uint32(block.timestamp));
    }
}
