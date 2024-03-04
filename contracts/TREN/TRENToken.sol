// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { ERC20Permit, ERC20 } from "../Dependencies/ERC20Permit.sol";

contract TRENToken is ERC20Permit {
    string public constant NAME = "TRENToken";

    uint256 internal _1_MILLION = 1e24; // 1e6 * 1e18 = 1e24

    address public immutable treasury;

    constructor(address _treasurySig) ERC20("TREN", "TREN") {
        require(_treasurySig != address(0), "Invalid Treasury Sig");
        treasury = _treasurySig;

        //Lazy Mint to setup protocol.
        //After the deployment scripts, deployer addr automatically send the fund to the treasury.
        _mint(msg.sender, _1_MILLION * 50);
        _mint(_treasurySig, _1_MILLION * 50);
    }
}
