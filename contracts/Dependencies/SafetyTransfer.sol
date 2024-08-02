// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { IERC20Decimals } from "../Interfaces/IERC20Decimals.sol";

library SafetyTransfer {
    /// @dev Error emitted when the specific token is ETH or zero address.
    error EthUnsupportedError();
    /// @dev Error emitted when the amount for decimal correction is invalid.
    error InvalidAmountError();

    /**
     * @dev Converts the amount in ether (1e18) to the specific token decimal.
     * @param _token The token address to get the decimal of.
     * @param _amount The amount for decimal correction.
     */
    function decimalsCorrection(address _token, uint256 _amount) internal view returns (uint256) {
        if (_token == address(0)) {
            revert EthUnsupportedError();
        }
        if (_amount == 0) {
            return 0;
        }
        uint8 decimals = IERC20Decimals(_token).decimals();
        if (decimals < 18) {
            uint256 divisor;
            unchecked {
                divisor = 10 ** (18 - decimals);
            }
            if (_amount % divisor != 0) {
                revert InvalidAmountError();
            }
            return _amount / divisor;
        } else if (decimals > 18) {
            uint256 multiplier;
            unchecked {
                multiplier = 10 ** (decimals - 18);
            }
            return _amount * multiplier;
        }
        return _amount;
    }
}
