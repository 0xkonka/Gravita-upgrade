// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
pragma abicoder v2;

interface IUniswapRouterV3 {
    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    function exactOutput(ExactOutputParams memory params) external returns (uint256 amountIn);
}
