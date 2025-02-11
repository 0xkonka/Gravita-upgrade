// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

import { AggregatorV3Interface } from
    "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";

/**
 * @dev Based on https://github.com/lidofinance/lido-dao/blob/master/contracts/0.6.12/WstETH.sol
 */
interface IWstETH {
    function stEthPerToken() external view returns (uint256);
}

/**
 * @notice Returns the USD price for 1 wstETH.
 *
 * @dev Queries the wstETH token for its stETH value/rate; then queries the stETH:USD oracle for the
 * price, and multiplies the results.
 * There is a known (minor) issue with the getRoundData() function, where the historical
 * value for a previous round (price) can be queried from the feed, but the current st/wstEth
 * rate is used (instead of the historical pair);
 * we do not see that as a problem as this contract's return values are
 * supposed to be used in short-time context checks (and not for long-term
 * single-source-of-truth queries)
 */
contract WstEth2UsdPriceAggregator is AggregatorV3Interface {
    error WstEth2UsdPriceAggregator__stEthZeroPrice();
    error WstEth2UsdPriceAggregator__stEthPerTokenZero();
    error WstEth2UsdPriceAggregator__InitializedWithAddressZero();

    int256 internal constant PRECISION = 1 ether;

    IWstETH public immutable wstETH;
    AggregatorV3Interface public immutable stETH2USDAggregator;

    constructor(address _wstETHAddress, address _stETH2USDAggregatorAddress) {
        if (_wstETHAddress == address(0) || _stETH2USDAggregatorAddress == address(0)) {
            revert WstEth2UsdPriceAggregator__InitializedWithAddressZero();
        }

        wstETH = IWstETH(_wstETHAddress);
        stETH2USDAggregator = AggregatorV3Interface(_stETH2USDAggregatorAddress);
    }

    // AggregatorV3Interface functions
    // ----------------------------------------------------------------------------------

    function decimals() external view override returns (uint8) {
        return stETH2USDAggregator.decimals();
    }

    function description() external pure override returns (string memory) {
        return "WstEth2UsdPriceAggregator";
    }

    function getRoundData(uint80 _roundId)
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (roundId, answer, startedAt, updatedAt, answeredInRound) =
            stETH2USDAggregator.getRoundData(_roundId);
        answer = _stETH2wstETH(answer);
    }

    function latestRoundData()
        external
        view
        override
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        )
    {
        (roundId, answer, startedAt, updatedAt, answeredInRound) =
            stETH2USDAggregator.latestRoundData();
        answer = _stETH2wstETH(answer);
    }

    function version() external pure override returns (uint256) {
        return 1;
    }

    // Internal/Helper functions
    // ----------------------------------------------------------------------------------------

    function _stETH2wstETH(int256 stETHValue) internal view returns (int256) {
        if (stETHValue == 0) {
            revert WstEth2UsdPriceAggregator__stEthZeroPrice();
        }

        int256 multiplier = int256(wstETH.stEthPerToken());
        if (multiplier == 0) {
            revert WstEth2UsdPriceAggregator__stEthPerTokenZero();
        }
        // wstETH.stEthPerToken() response has 18-digit precision, hence we need the denominator
        // below
        return (stETHValue * multiplier) / PRECISION;
    }
}
