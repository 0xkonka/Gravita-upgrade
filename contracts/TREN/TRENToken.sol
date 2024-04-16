// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import { ERC20Permit } from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

contract TRENToken is ERC20Permit {
    error TRENToken__InvalidTreasurySig();

    string public constant NAME = "TREN";
    string public constant SYMBOL = "TREN";

    uint256 internal constant _1_MILLION = 1e24; // 1e6 * 1e18 = 1e24

    address public immutable TREASURY;

    constructor(address _treasurySig) ERC20(NAME, SYMBOL) ERC20Permit(NAME) {
        if (_treasurySig == address(0)) {
            revert TRENToken__InvalidTreasurySig();
        }

        TREASURY = _treasurySig;

        // Lazy Mint to setup protocol.
        // After the deployment scripts, deployer addr automatically send the fund to the treasury.
        _mint(msg.sender, _1_MILLION * 50);
        _mint(_treasurySig, _1_MILLION * 50);
    }
}
