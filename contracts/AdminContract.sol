// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { UUPSUpgradeable } from
    "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import { OwnableUpgradeable } from
    "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";

import { ConfigurableAddresses } from "./Dependencies/ConfigurableAddresses.sol";
import { DECIMAL_PRECISION as _DECIMAL_PRECISION } from "./Dependencies/TrenMath.sol";
import { IAdminContract } from "./Interfaces/IAdminContract.sol";
import { IStabilityPool } from "./Interfaces/IStabilityPool.sol";
import { IActivePool } from "./Interfaces/IActivePool.sol";
import { IDefaultPool } from "./Interfaces/IDefaultPool.sol";

contract AdminContract is
    IAdminContract,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ConfigurableAddresses
{
    // Constants
    // --------------------------------------------------------------------------------------------------------
    string public constant NAME = "AdminContract";

    uint256 public constant _100pct = 1 ether; // 1e18 == 100%

    uint256 public constant BORROWING_FEE_DEFAULT = 0.005 ether; // 0.5%
    uint256 public constant CCR_DEFAULT = 1.5 ether; // 150%
    uint256 public constant MCR_DEFAULT = 1.1 ether; // 110%
    uint256 public constant MIN_NET_DEBT_DEFAULT = 2000 ether;
    uint256 public constant MINT_CAP_DEFAULT = 1_000_000 ether; // 1 million GRAI
    uint256 public constant PERCENT_DIVISOR_DEFAULT = 200; // dividing by 200 yields 0.5%
    uint256 public constant REDEMPTION_FEE_FLOOR_DEFAULT = 0.005 ether; // 0.5%
    uint256 public constant REDEMPTION_BLOCK_TIMESTAMP_DEFAULT = type(uint256).max; // never

    // State
    // ------------------------------------------------------------------------------------------------------------

    /**
     * @dev Cannot be public as struct has too many variables for the stack.
     * Create special view structs/getters instead.
     */
    mapping(address collateral => CollateralParams params) internal collateralParams;

    FlashLoanParams public flashLoanParams;

    /// @dev list of all collateral types in collateralParams (active and deprecated)
    address[] public validCollateral;
    /// @dev check if all initial collaterals have been configured or not
    bool public isSetupInitialized;
    /// @dev if true, collected fees go to stakers; if false, to the treasury
    bool public routeToTRENStaking = false;

    // Modifiers
    // --------------------------------------------------------------------------------------------------------

    /**
     * @dev Require that the collateral exists in the controller. If it is not the 0th index, and
     * the index is still 0 then it does not exist in the mapping.
     * no require here for valid collateral 0 index because that means it exists.
     */
    modifier exists(address _collateral) {
        _exists(_collateral);
        _;
    }

    modifier onlyTimelock() {
        if (isSetupInitialized) {
            if (msg.sender != timelockAddress) {
                revert AdminContract__OnlyTimelock();
            }
        } else {
            if (msg.sender != owner()) {
                revert AdminContract__OnlyOwner();
            }
        }
        _;
    }

    modifier safeCheck(
        string memory parameter,
        address _collateral,
        uint256 enteredValue,
        uint256 min,
        uint256 max
    ) {
        if (!collateralParams[_collateral].active) {
            revert AdminContract__CollateralNotConfigured();
        }

        if (enteredValue < min || enteredValue > max) {
            revert SafeCheckError(parameter, enteredValue, min, max);
        }
        _;
    }

    // Initializers
    // -----------------------------------------------------------------------------------------------------

    function initialize(address initialOwner) public initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    /**
     * @dev The deployment script will call this function when all initial collaterals have been
     * configured; after this is set to true,
     * all subsequent config/setters will need to go through the timelocks.
     */
    function setSetupIsInitialized() external onlyTimelock {
        isSetupInitialized = true;
    }

    // External Functions
    // -----------------------------------------------------------------------------------------------

    /**
     * @notice Add new collateral asset
     * @param _collateral asset address
     * @param _debtTokenGasCompensation amount of debtToken to be locked on opening TrenBoxes
     * as liquidation reserve.
     */
    function addNewCollateral(
        address _collateral,
        uint256 _debtTokenGasCompensation
    )
        external
        override
        onlyTimelock
    {
        if (collateralParams[_collateral].mcr != 0) {
            revert AdminContract__CollateralExists();
        }

        // require(_decimals == DEFAULT_DECIMALS, "collaterals must have the default decimals");
        validCollateral.push(_collateral);
        collateralParams[_collateral] = CollateralParams({
            index: validCollateral.length - 1,
            active: false,
            borrowingFee: BORROWING_FEE_DEFAULT,
            ccr: CCR_DEFAULT,
            mcr: MCR_DEFAULT,
            debtTokenGasCompensation: _debtTokenGasCompensation,
            minNetDebt: MIN_NET_DEBT_DEFAULT,
            mintCap: MINT_CAP_DEFAULT,
            percentDivisor: PERCENT_DIVISOR_DEFAULT,
            redemptionFeeFloor: REDEMPTION_FEE_FLOOR_DEFAULT,
            redemptionBlockTimestamp: REDEMPTION_BLOCK_TIMESTAMP_DEFAULT
        });

        emit CollateralAdded(_collateral);

        IStabilityPool(stabilityPool).addCollateralType(_collateral);
    }

    /**
     * @notice Set collateral parameters
     * @param _collateral asset address
     * @param borrowingFee one time fee charged on the loan amount and added to your debt
     * @param ccr critical collateral ratio to avoid liquidation during Recovery Mode
     * @param mcr minimum collateral ratio to avoid liquidation during Normal Mode
     * @param minNetDebt minimum amount of net debtToken a TrenBox must have
     * @param mintCap total TrenUSD amount to be allocated
     * @param percentDivisor divisor to be used in percent calculation
     * @param redemptionFeeFloor one time fee charged on the redeemed amount
     */
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
        public
        override
        onlyTimelock
    {
        collateralParams[_collateral].active = true;
        setBorrowingFee(_collateral, borrowingFee);
        setCCR(_collateral, ccr);
        setMCR(_collateral, mcr);
        setMinNetDebt(_collateral, minNetDebt);
        setMintCap(_collateral, mintCap);
        setPercentDivisor(_collateral, percentDivisor);
        setRedemptionFeeFloor(_collateral, redemptionFeeFloor);
    }

    /**
     * @notice Set the status of collateral
     * @param _collateral asset address
     * @param _active status of collateral; true or false
     */
    function setIsActive(address _collateral, bool _active) external onlyTimelock {
        CollateralParams storage collParams = collateralParams[_collateral];
        collParams.active = _active;
    }

    /**
     * @notice Set the borrowing fee
     * @param _collateral asset address
     * @param borrowingFee one time fee charged on the loan amount and added to your debt
     */
    function setBorrowingFee(
        address _collateral,
        uint256 borrowingFee
    )
        public
        override
        onlyTimelock
        safeCheck("Borrowing Fee", _collateral, borrowingFee, 0, 0.1 ether) // 0% - 10%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldBorrowing = collParams.borrowingFee;
        collParams.borrowingFee = borrowingFee;
        emit BorrowingFeeChanged(oldBorrowing, borrowingFee);
    }

    /**
     * @notice Set the critical collateral ratio
     * @param _collateral asset address
     * @param newCCR new collateral ratio to avoid liquidations during Recovery Mode
     */
    function setCCR(
        address _collateral,
        uint256 newCCR
    )
        public
        override
        onlyTimelock
        safeCheck("CCR", _collateral, newCCR, 1 ether, 10 ether) // 100% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldCCR = collParams.ccr;
        collParams.ccr = newCCR;
        emit CCRChanged(oldCCR, newCCR);
    }

    /**
     * @notice Set the minimum collateral ratio
     * @param _collateral asset address
     * @param newMCR new collateral ratio to avoid liquidations under normal operation
     */
    function setMCR(
        address _collateral,
        uint256 newMCR
    )
        public
        override
        onlyTimelock
        safeCheck("MCR", _collateral, newMCR, 1.01 ether, 10 ether) // 101% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMCR = collParams.mcr;
        collParams.mcr = newMCR;
        emit MCRChanged(oldMCR, newMCR);
    }

    /**
     * @notice Set the minimum amount of net debt
     * @param _collateral asset address
     * @param minNetDebt minimum amount of net debtToken a TrenBox must have
     */
    function setMinNetDebt(
        address _collateral,
        uint256 minNetDebt
    )
        public
        override
        onlyTimelock
        safeCheck("Min Net Debt", _collateral, minNetDebt, 0, 2000 ether)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMinNet = collParams.minNetDebt;
        collParams.minNetDebt = minNetDebt;
        emit MinNetDebtChanged(oldMinNet, minNetDebt);
    }

    /**
     * @notice Set the total loan amount to be allocated
     * @param _collateral asset address
     * @param mintCap total loan amount that can be minted
     */
    function setMintCap(address _collateral, uint256 mintCap) public override onlyTimelock {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMintCap = collParams.mintCap;
        collParams.mintCap = mintCap;
        emit MintCapChanged(oldMintCap, mintCap);
    }

    /**
     * @notice Set the percent divisor
     * @param _collateral asset address
     * @param percentDivisor divisor to be used in percent calculation; min 2, max 200
     */
    function setPercentDivisor(
        address _collateral,
        uint256 percentDivisor
    )
        public
        override
        onlyTimelock
        safeCheck("Percent Divisor", _collateral, percentDivisor, 2, 200)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldPercent = collParams.percentDivisor;
        collParams.percentDivisor = percentDivisor;
        emit PercentDivisorChanged(oldPercent, percentDivisor);
    }

    /**
     * @notice Set the redemption fee floor
     * @param _collateral asset address
     * @param redemptionFeeFloor fee charged on the redeemed amount(scaled by 1e18);
     * min 0.001(0.1%), max 0.1(10%)
     */
    function setRedemptionFeeFloor(
        address _collateral,
        uint256 redemptionFeeFloor
    )
        public
        override
        onlyTimelock
        safeCheck("Redemption Fee Floor", _collateral, redemptionFeeFloor, 0.001 ether, 0.1 ether)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldRedemptionFeeFloor = collParams.redemptionFeeFloor;
        collParams.redemptionFeeFloor = redemptionFeeFloor;
        emit RedemptionFeeFloorChanged(oldRedemptionFeeFloor, redemptionFeeFloor);
    }

    function setRedemptionBlockTimestamp(
        address _collateral,
        uint256 _blockTimestamp
    )
        public
        override
        onlyTimelock
    {
        collateralParams[_collateral].redemptionBlockTimestamp = _blockTimestamp;
        emit RedemptionBlockTimestampChanged(_collateral, _blockTimestamp);
    }

    function setFeeForFlashLoan(uint256 _flashLoanFee) external onlyTimelock {
        uint256 oldFlashLoanFee = flashLoanParams.flashLoanFee;
        flashLoanParams.flashLoanFee = _flashLoanFee;

        emit FlashLoanFeeChanged(oldFlashLoanFee, _flashLoanFee);
    }

    function setMinDebtForFlashLoan(uint256 _flashLoanMinDebt) external onlyTimelock {
        uint256 oldFlashLoanMinDebt = flashLoanParams.flashLoanMinDebt;
        flashLoanParams.flashLoanMinDebt = _flashLoanMinDebt;

        emit FlashLoanMinDebtChanged(oldFlashLoanMinDebt, _flashLoanMinDebt);
    }

    function setMaxDebtForFlashLoan(uint256 _flashLoanMaxDebt) external onlyTimelock {
        uint256 oldFlashLoanMaxDebt = flashLoanParams.flashLoanMaxDebt;
        flashLoanParams.flashLoanMaxDebt = _flashLoanMaxDebt;

        emit FlashLoanMaxDebtChanged(oldFlashLoanMaxDebt, _flashLoanMaxDebt);
    }

    function switchRouteToTRENStaking() external onlyTimelock {
        if (routeToTRENStaking) {
            routeToTRENStaking = false;
        } else {
            routeToTRENStaking = true;
        }
    }

    // View functions
    // ---------------------------------------------------------------------------------------------------
    function DECIMAL_PRECISION() external pure returns (uint256) {
        return _DECIMAL_PRECISION;
    }

    function getValidCollateral() external view override returns (address[] memory) {
        return validCollateral;
    }

    function getIsActive(address _collateral)
        external
        view
        override
        exists(_collateral)
        returns (bool)
    {
        return collateralParams[_collateral].active;
    }

    function getIndex(address _collateral)
        external
        view
        override
        exists(_collateral)
        returns (uint256)
    {
        return (collateralParams[_collateral].index);
    }

    function getIndices(address[] memory _colls) external view returns (uint256[] memory indices) {
        uint256 len = _colls.length;
        indices = new uint256[](len);

        for (uint256 i; i < len;) {
            _exists(_colls[i]);
            indices[i] = collateralParams[_colls[i]].index;
            unchecked {
                i++;
            }
        }
    }

    function getMcr(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].mcr;
    }

    function getCcr(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].ccr;
    }

    function getDebtTokenGasCompensation(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralParams[_collateral].debtTokenGasCompensation;
    }

    function getMinNetDebt(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].minNetDebt;
    }

    function getPercentDivisor(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].percentDivisor;
    }

    function getBorrowingFee(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].borrowingFee;
    }

    function getRedemptionFeeFloor(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].redemptionFeeFloor;
    }

    function getRedemptionBlockTimestamp(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralParams[_collateral].redemptionBlockTimestamp;
    }

    function getMintCap(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].mintCap;
    }

    function getTotalAssetDebt(address _asset) external view override returns (uint256) {
        return IActivePool(activePool).getDebtTokenBalance(_asset)
            + IDefaultPool(defaultPool).getDebtTokenBalance(_asset);
    }

    function getFlashLoanFee() external view override returns (uint256) {
        return flashLoanParams.flashLoanFee;
    }

    function getFlashLoanMinNetDebt() external view override returns (uint256) {
        return flashLoanParams.flashLoanMinDebt;
    }

    function getFlashLoanMaxNetDebt() external view override returns (uint256) {
        return flashLoanParams.flashLoanMaxDebt;
    }

    function getRouteToTRENStaking() external view override returns (bool) {
        return routeToTRENStaking;
    }

    // Internal Functions
    // -----------------------------------------------------------------------------------------------

    function _exists(address _collateral) internal view {
        if (collateralParams[_collateral].mcr == 0) {
            revert AdminContract__CollateralDoesNotExist();
        }
    }

    function authorizeUpgrade(address newImplementation) public {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
