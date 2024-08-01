// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;
pragma abicoder v2;

interface IUniswapRouterV3 {
    struct ExactOutputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
        uint160 sqrtPriceLimitX96;
    }

    struct ExactOutputParams {
        bytes path;
        address recipient;
        uint256 deadline;
        uint256 amountOut;
        uint256 amountInMaximum;
    }

    function exactOutput(ExactOutputParams memory params) external returns (uint256 amountIn);
    function exactOutputSingle(ExactOutputSingleParams memory params)
        external
        returns (uint256 amountIn);
}
