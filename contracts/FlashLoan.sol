// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { SafeERC20, IERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";

import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IBorrowerOperations } from "./Interfaces/IBorrowerOperations.sol";
import { IFeeCollector } from "./Interfaces/IFeeCollector.sol";
import { IFlashLoan } from "./Interfaces/IFlashLoan.sol";
import { IFlashLoanReceiver } from "./Interfaces/IFlashLoanReceiver.sol";
import { ITrenBoxManager } from "./Interfaces/ITrenBoxManager.sol";
import { IUniswapRouterV3 } from "./Interfaces/IUniswapRouterV3.sol";
import { IDebtToken } from "./Interfaces/IDebtToken.sol";
import { IERC20Decimals } from "./Interfaces/IERC20Decimals.sol";

/// @title FlashLoan
/// @notice This contract provides functionality for executing flash loans.
contract FlashLoan is
    IFlashLoan,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    ConfigurableAddresses,
    UUPSUpgradeable
{
    using SafeERC20 for IERC20;

    /// @notice The name of contract.
    string public constant NAME = "FlashLoan";

    /// @notice The denominator to calculate fee percentage.
    uint256 public constant FEE_DENOMINATOR = 1000;

    /// @notice The address of Swap Router contract.
    IUniswapRouterV3 public swapRouter;
    /// @notice The address of Stable Coin contract.
    address public stableCoin;

    /// @notice The index that setup is initialized or not.
    bool public isSetupInitialized;

    // ------------------------------------------ Initializer -------------------------------------

    /// @dev Sets an intiial owner for the contract.
    /// @param initialOwner The address of initial owner.
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // ------------------------------------------ Set functions -----------------------------------

    /**
     * @notice Sets addresses for stableCoin and swapRouter contracts.
     * @param _stableCoin The address of Stable Coin contract.
     * @param _swapRouter The address of Swap Router contract.
     */
    function setInternalAddresses(address _stableCoin, address _swapRouter) external onlyOwner {
        if (isSetupInitialized) revert FlashLoan__SetupIsInitialized();
        if (_stableCoin == address(0) || _swapRouter == address(0)) {
            revert FlashLoan__ZeroAddresses();
        }
        stableCoin = _stableCoin;
        swapRouter = IUniswapRouterV3(_swapRouter);

        isSetupInitialized = true;

        emit AddressesSet(_stableCoin, _swapRouter);
    }

    // ------------------------------------------ External functions ------------------------------

    /// @inheritdoc IFlashLoan
    function flashLoan(uint256 _amount) external nonReentrant {
        if (IAdminContract(adminContract).getFlashLoanMinNetDebt() > _amount) {
            revert FlashLoan__AmountBeyondMin();
        }
        if (IAdminContract(adminContract).getFlashLoanMaxNetDebt() < _amount) {
            revert FlashLoan__AmountBeyondMax();
        }

        mintTokens(_amount);
        uint256 balanceBefore = IDebtToken(debtToken).balanceOf(address(this));
        uint256 fee = calculateFee(_amount);

        IDebtToken(debtToken).transfer(msg.sender, _amount);

        IFlashLoanReceiver(msg.sender).executeOperation(_amount, fee, address(debtToken));

        if (IDebtToken(debtToken).balanceOf(address(this)) < balanceBefore + fee) {
            revert FlashLoan__LoanIsNotRepayable();
        }

        burnTokens(_amount);
        sendFeeToCollector();

        emit FlashLoanExecuted(msg.sender, _amount, fee);
    }

    /**
     * @notice Executes a flash loan specifically to repay a debt on the provided asset.
     * @param _asset The address of the asset for which the debt is to be repaid.
     * @dev This function initiates a flash loan transaction to repay a debt on the specified asset.
     */
    function flashLoanForRepay(address _asset) external nonReentrant {
        if (!IAdminContract(adminContract).getIsActive(_asset)) {
            revert FlashLoan__CollateralIsNotActive();
        }
        uint256 debt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset, msg.sender);
        uint256 gasCompensation = IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
        uint256 refund = IFeeCollector(feeCollector).simulateRefund(msg.sender, _asset, 1 ether);
        uint256 netDebt = debt - gasCompensation - refund;

        mintTokens(netDebt);

        IDebtToken(debtToken).transfer(msg.sender, netDebt);

        uint256 fee = calculateFee(netDebt);

        IBorrowerOperations(borrowerOperations).repayDebtTokensWithFlashloan(_asset, msg.sender);

        uint256 collAmountIn = IERC20(_asset).balanceOf(address(this));
        uint256 debtTokensToGet = netDebt + fee;

        swapTokens(_asset, collAmountIn, debtTokensToGet);

        if (IDebtToken(debtToken).balanceOf(address(this)) < debtTokensToGet) {
            revert FlashLoan__LoanIsNotRepayable();
        }

        burnTokens(netDebt);
        sendFeeToCollector();

        emit FlashLoanExecuted(msg.sender, netDebt, fee);
    }

    /**
     * @notice Gets the current flash loan rate.
     * @return The flash loan fee rate.
     */
    function getFlashLoanRate() external view returns (uint256) {
        return IAdminContract(adminContract).getFlashLoanFee();
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }

    // ------------------------------------------ Private functions -------------------------------

    /**
     * @dev Calculates the fee for a given loan amount.
     * @param _amount The amount of the loan.
     * @return The calculated fee for the loan amount.
     */
    function calculateFee(uint256 _amount) private view returns (uint256) {
        uint256 _feeRate = IAdminContract(adminContract).getFlashLoanFee();
        return (_amount * _feeRate) / FEE_DENOMINATOR;
    }

    /// @dev Sends the collected fees to the fee collector.
    function sendFeeToCollector() private {
        address collector = IFeeCollector(feeCollector).getProtocolRevenueDestination();
        uint256 feeAmount = IDebtToken(debtToken).balanceOf(address(this));
        IDebtToken(debtToken).transfer(collector, feeAmount);
    }

    /// @dev Mints the specified amount of debt tokens.
    /// @param _amount The amount of debt tokens to mint.
    function mintTokens(uint256 _amount) private {
        IDebtToken(debtToken).mintFromWhitelistedContract(_amount);
    }

    /// @dev Burns the specified amount of debt tokens.
    /// @param _amount The amount of debt tokens to burn.
    function burnTokens(uint256 _amount) private {
        IDebtToken(debtToken).burnFromWhitelistedContract(_amount);
    }

    /**
     * @dev Swaps as little as possible of one token for `amountOut` of another along the specified
     * path (reversed).
     * @param _collTokenIn The address of input collateral.
     * @param _collAmountIn The amount of collateral which will be swapped.
     * @param _debtAmountOut The amount of trenUSD which will (should) be received.
     */
    function swapTokens(
        address _collTokenIn,
        uint256 _collAmountIn,
        uint256 _debtAmountOut
    )
        private
    {
        // Approve swapRouter to spend amountInMaximum
        IERC20(_collTokenIn).approve(address(swapRouter), _collAmountIn);

        uint256 amountIn;

        if (IERC20Decimals(_collTokenIn).decimals() == 6) {
            IUniswapRouterV3.ExactOutputSingleParams memory params = IUniswapRouterV3
                .ExactOutputSingleParams({
                tokenIn: _collTokenIn,
                tokenOut: debtToken,
                fee: 3000,
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: _debtAmountOut,
                amountInMaximum: _collAmountIn,
                sqrtPriceLimitX96: 0
            });

            // Executes the swap, returning the amountIn actually spent.
            amountIn = swapRouter.exactOutputSingle(params);
        } else {
            // The tokenIn/tokenOut field is the shared token between the two pools used in the
            // multiple
            // pool swap. In this case stable coin is the "shared" token.
            // For an exactOutput swap, the first swap that occurs is the swap which returns the
            // eventual desired token.
            // In this case, our desired output token is debtToken so that swap happpens first, and
            // is
            // encoded in the path accordingly.
            IUniswapRouterV3.ExactOutputParams memory params = IUniswapRouterV3.ExactOutputParams({
                path: abi.encodePacked(
                    address(debtToken), uint24(3000), stableCoin, uint24(3000), _collTokenIn
                ),
                recipient: address(this),
                deadline: block.timestamp,
                amountOut: _debtAmountOut,
                amountInMaximum: _collAmountIn
            });

            amountIn = swapRouter.exactOutput(params);
        }

        // If the swap did not require the full _collAmountIn to achieve the exact amountOut then we
        // refund msg.sender and approve the router to spend 0.
        if (amountIn < _collAmountIn) {
            IERC20(_collTokenIn).approve(address(swapRouter), 0);
            IERC20(_collTokenIn).safeTransfer(msg.sender, _collAmountIn - amountIn);
        }
    }
}
