// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { ReentrancyGuardUpgradeable } from
    "@openzeppelin/contracts-upgradeable/utils/ReentrancyGuardUpgradeable.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "./Interfaces/IAdminContract.sol";
import "./Interfaces/IBorrowerOperations.sol";
import "./Interfaces/IFeeCollector.sol";
import "./Interfaces/IFlashLoan.sol";
import "./Interfaces/IFlashLoanReceiver.sol";
import "./Interfaces/ITrenBoxManager.sol";
import "./Interfaces/IUniswapRouterV3.sol";
import "./Addresses.sol";

contract FlashLoan is
    IFlashLoan,
    ReentrancyGuardUpgradeable,
    OwnableUpgradeable,
    Addresses,
    UUPSUpgradeable
{
    string public constant NAME = "FlashLoan";

    uint256 public constant FEE_DENOMINATOR = 1000;

    IUniswapRouterV3 public swapRouter;
    address public stableCoin;

    bool public isSetupInitialized;

    // TODO: fix here
    function initialize() public initializer {
        address initialOwner = _msgSender();

        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    // ------------------------------------------ Set functions -----------------------------------

    function setAddresses(address _stableCoin, address _swapRouter) external onlyOwner {
        require(!isSetupInitialized, "Setup is already initialized");
        stableCoin = _stableCoin;
        swapRouter = IUniswapRouterV3(_swapRouter);

        isSetupInitialized = true;

        emit AddressesSet(_stableCoin, _swapRouter);
    }

    // ------------------------------------------ External functions ------------------------------

    // Get a simple flash loan of trenUSD
    function flashLoan(uint256 _amount) external nonReentrant {
        if (IAdminContract(adminContract).getFlashLoanMinNetDebt() > _amount) {
            revert FlashLoan__AmountBeyondMin();
        }
        if (IAdminContract(adminContract).getFlashLoanMaxNetDebt() < _amount) {
            revert FlashLoan__AmountBeyondMax();
        }

        // Mint exact amount of trenUSD
        mintTokens(_amount);
        // Store the balance before transfering to borrower
        uint256 balanceBefore = IDebtToken(debtToken).balanceOf(address(this));

        // Calculate a fee
        uint256 fee = calculateFee(_amount);

        // Do the transfering of exact amount of trenUSD to borrower
        IDebtToken(debtToken).transfer(msg.sender, _amount);

        // Execute function from user's contract
        IFlashLoanReceiver(msg.sender).executeOperation(_amount, fee, address(debtToken));

        // Check that exact amount of trenUSD returned + fee amount
        if (IDebtToken(debtToken).balanceOf(address(this)) < balanceBefore + fee) {
            revert FlashLoan__LoanIsNotRepayable();
        }

        // Burn exact amount of trenUSD
        burnTokens(_amount);

        // Send fee amount to our collector
        sendFeeToCollector();

        emit FlashLoanExecuted(msg.sender, _amount, fee);
    }

    function flashLoanBorrowRepay(address _asset) external nonReentrant {
        // TODO: Rethink how to get calculation only only in one place
        uint256 debt = ITrenBoxManager(trenBoxManager).getTrenBoxDebt(_asset, msg.sender);
        uint256 gasCompensation = IAdminContract(adminContract).getDebtTokenGasCompensation(_asset);
        uint256 refund = IFeeCollector(feeCollector).simulateRefund(msg.sender, _asset, 1 ether);
        uint256 netDebt = debt - gasCompensation - refund;

        mintTokens(netDebt);

        IDebtToken(debtToken).transfer(msg.sender, netDebt);

        uint256 fee = calculateFee(netDebt);

        IBorrowerOperations(borrowerOperations).closeTrenBox(_asset);

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

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }

    // ------------------------------------------ Private functions -------------------------------

    function calculateFee(uint256 _amount) private view returns (uint256) {
        uint256 _feeRate = IAdminContract(adminContract).getFlashLoanFee();
        return (_amount * _feeRate) / FEE_DENOMINATOR;
    }

    function sendFeeToCollector() private {
        address collector = IFeeCollector(feeCollector).getProtocolRevenueDestination();
        uint256 feeAmount = IDebtToken(debtToken).balanceOf(address(this));
        IDebtToken(debtToken).transfer(collector, feeAmount);
    }

    function mintTokens(uint256 _amount) private {
        IDebtToken(debtToken).mintFromWhitelistedContract(_amount);
    }

    function burnTokens(uint256 _amount) private {
        IDebtToken(debtToken).burnFromWhitelistedContract(_amount);
    }

    function swapTokens(address _tokenIn, uint256 _collAmountIn, uint256 _debtAmountOut) private {
        // Approve swapRouter to spend amountInMaximum
        IERC20(_tokenIn).approve(address(swapRouter), _collAmountIn);

        // The tokenIn/tokenOut field is the shared token between the two pools used in the multiple
        // pool swap. In this case stable coin is the "shared" token.
        // For an exactOutput swap, the first swap that occurs is the swap which returns the
        // eventual desired token.
        // In this case, our desired output token is debtToken so that swap happpens first, and is
        // encoded in the path accordingly.
        IUniswapRouterV3.ExactOutputParams memory params = IUniswapRouterV3.ExactOutputParams({
            path: abi.encodePacked(address(debtToken), uint24(3000), stableCoin, uint24(3000), _tokenIn),
            recipient: address(this),
            deadline: block.timestamp,
            amountOut: _debtAmountOut,
            amountInMaximum: _collAmountIn
        });

        // Executes the swap, returning the amountIn actually spent.
        uint256 amountIn = swapRouter.exactOutput(params);

        // If the swap did not require the full _collAmountIn to achieve the exact amountOut then we
        // refund msg.sender and approve the router to spend 0.
        if (amountIn < _collAmountIn) {
            IERC20(_tokenIn).approve(address(swapRouter), 0);
            IERC20(_tokenIn).transfer(msg.sender, _collAmountIn - amountIn);
        }
    }
}
