// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/interfaces/IERC20.sol";
import "../Interfaces/IUniswapRouterV3.sol";

contract MockUniswapRouterV3 is IUniswapRouterV3 {
    using BytesLib for bytes;

    uint256 private constant FEE_DENOMINATOR = 1_000_000;
    uint256 private constant ADDR_SIZE = 20;
    uint256 private constant FEE_SIZE = 3;
    uint256 private constant NEXT_OFFSET = ADDR_SIZE + FEE_SIZE;

    uint256 ratioAssetToStable = 3000;
    uint256 ratioStableToDebt = 1;

    struct SwapCallbackData {
        bytes path;
        address payer;
    }

    function setRatio(uint256 _ratioAssetToStable, uint256 _ratioStableToDebt) external {
        ratioAssetToStable = _ratioAssetToStable;
        ratioStableToDebt = _ratioStableToDebt;
    }

    function exactOutput(ExactOutputParams memory params)
        external
        payable
        returns (uint256 amountIn)
    {
        (address debtToken, address stableCoin, address assetToken, uint24 fee1, uint24 fee2) =
            decodePath(params.path);

        uint256 stableCoinsNeeded = params.amountOut * ratioStableToDebt;
        uint256 fee_1 = (stableCoinsNeeded * fee1) / FEE_DENOMINATOR;
        uint256 assetTokensNeeded = (stableCoinsNeeded + fee_1) / ratioAssetToStable;
        uint256 fee_2 = (assetTokensNeeded * fee2) / FEE_DENOMINATOR;
        uint256 assetTokensNeededPlusFee = assetTokensNeeded + fee_2;

        IERC20(assetToken).transferFrom(params.recipient, address(this), assetTokensNeededPlusFee);
        IERC20(debtToken).transfer(params.recipient, params.amountOut);

        return assetTokensNeededPlusFee;
    }

    function decodePath(bytes memory path)
        internal
        pure
        returns (address tokenA, address tokenB, address tokenC, uint24 fee1, uint24 fee2)
    {
        tokenA = path.toAddress(0);
        fee1 = path.toUint24(ADDR_SIZE);
        tokenB = path.toAddress(NEXT_OFFSET);
        fee2 = path.toUint24(NEXT_OFFSET + ADDR_SIZE);
        tokenC = path.toAddress(NEXT_OFFSET + ADDR_SIZE + FEE_SIZE);
    }
}

library BytesLib {
    function toAddress(bytes memory _bytes, uint256 _start) internal pure returns (address) {
        require(_start + 20 >= _start, "toAddress_overflow");
        require(_bytes.length >= _start + 20, "toAddress_outOfBounds");
        address tempAddress;

        assembly {
            tempAddress := div(mload(add(add(_bytes, 0x20), _start)), 0x1000000000000000000000000)
        }

        return tempAddress;
    }

    function toUint24(bytes memory _bytes, uint256 _start) internal pure returns (uint24) {
        require(_start + 3 >= _start, "toUint24_overflow");
        require(_bytes.length >= _start + 3, "toUint24_outOfBounds");
        uint24 tempUint;

        assembly {
            tempUint := mload(add(add(_bytes, 0x3), _start))
        }

        return tempUint;
    }
}
