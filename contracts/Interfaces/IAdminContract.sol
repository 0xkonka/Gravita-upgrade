// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface IAdminContract {
    // Structs
    // ----------------------------------------------------------------------------------------------------------

    struct CollateralParams {
        uint256 index; // Maps to token address in validCollateral[]
        bool active;
        uint256 borrowingFee;
        uint256 ccr;
        uint256 mcr;
        uint256 debtTokenGasCompensation;
        uint256 minNetDebt; // Minimum amount of net debtToken a trenBox must have
        uint256 mintCap;
        uint256 percentDivisor;
        uint256 redemptionFeeFloor;
        uint256 redemptionBlockTimestamp;
    }

    struct FlashLoanParams {
        uint256 flashLoanFee; // 10 = 0,1%, 100 = 10% => 10 out of $1000 = $10
        uint256 flashLoanMinDebt; // min amount of trenUSD to mint for Flash Loan
        uint256 flashLoanMaxDebt; // max amount of trenUSD to mint for Flash Loan
    }

    // Custom Errors
    // ----------------------------------------------------------------------------------------------------

    error SafeCheckError(string parameter, uint256 valueEntered, uint256 minValue, uint256 maxValue);
    error AdminContract__OnlyOwner();
    error AdminContract__OnlyTimelock();
    error AdminContract__CollateralAlreadyInitialized();
    error AdminContract__CollateralExists();
    error AdminContract__CollateralDoesNotExist();
    error AdminContract__CollateralNotConfigured();

    // Events
    // -----------------------------------------------------------------------------------------------------------

    event CollateralAdded(address _collateral);
    event MCRChanged(uint256 oldMCR, uint256 newMCR);
    event CCRChanged(uint256 oldCCR, uint256 newCCR);
    event MinNetDebtChanged(uint256 oldMinNet, uint256 newMinNet);
    event PercentDivisorChanged(uint256 oldPercentDiv, uint256 newPercentDiv);
    event BorrowingFeeChanged(uint256 oldBorrowingFee, uint256 newBorrowingFee);
    event RedemptionFeeFloorChanged(uint256 oldRedemptionFeeFloor, uint256 newRedemptionFeeFloor);
    event MintCapChanged(uint256 oldMintCap, uint256 newMintCap);
    event RedemptionBlockTimestampChanged(address _collateral, uint256 _blockTimestamp);
    event FlashLoanFeeChanged(uint256 oldFee, uint256 newFee);
    event FlashLoanMinDebtChanged(uint256 oldMinDebt, uint256 newMinDebt);
    event FlashLoanMaxDebtChanged(uint256 oldMaxDebt, uint256 newMaxDebt);

    // Functions
    // --------------------------------------------------------------------------------------------------------

    function DECIMAL_PRECISION() external view returns (uint256);

    function _100pct() external view returns (uint256);

    function addNewCollateral(address _collateral, uint256 _debtTokenGasCompensation) external;

    function setCollateralParameters(
        address _collateral,
        uint256 borrowingFee,
        uint256 ccr,
        uint256 mcr,
        uint256 minNetDebt,
        uint256 mintCap,
        uint256 percentDivisor,
        uint256 redemptionFeeFloor
    )
        external;

    function setMCR(address _collateral, uint256 newMCR) external;

    function setCCR(address _collateral, uint256 newCCR) external;

    function setMinNetDebt(address _collateral, uint256 minNetDebt) external;

    function setPercentDivisor(address _collateral, uint256 percentDivisor) external;

    function setBorrowingFee(address _collateral, uint256 borrowingFee) external;

    function setRedemptionFeeFloor(address _collateral, uint256 redemptionFeeFloor) external;

    function setMintCap(address _collateral, uint256 mintCap) external;

    function setRedemptionBlockTimestamp(address _collateral, uint256 _blockTimestamp) external;

    function switchRouteToTRENStaking() external;

    function getIndex(address _collateral) external view returns (uint256);

    function getIsActive(address _collateral) external view returns (bool);

    function getValidCollateral() external view returns (address[] memory);

    function getMcr(address _collateral) external view returns (uint256);

    function getCcr(address _collateral) external view returns (uint256);

    function getDebtTokenGasCompensation(address _collateral) external view returns (uint256);

    function getMinNetDebt(address _collateral) external view returns (uint256);

    function getPercentDivisor(address _collateral) external view returns (uint256);

    function getBorrowingFee(address _collateral) external view returns (uint256);

    function getRedemptionFeeFloor(address _collateral) external view returns (uint256);

    function getRedemptionBlockTimestamp(address _collateral) external view returns (uint256);

    function getMintCap(address _collateral) external view returns (uint256);

    function getTotalAssetDebt(address _asset) external view returns (uint256);

    function getFlashLoanFee() external view returns (uint256);

    function getFlashLoanMinNetDebt() external view returns (uint256);

    function getFlashLoanMaxNetDebt() external view returns (uint256);

    function getRouteToTRENStaking() external view returns (bool);
}
