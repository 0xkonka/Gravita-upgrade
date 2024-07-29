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
import { ITrenBoxStorage } from "./Interfaces/ITrenBoxStorage.sol";

/**
 * @title AdminContract
 * @notice Contains all the functions to create a new collateral or modify its parameters.
 * It is called by other contracts to check if a collateral is valid and what are their parameters.
 */
contract AdminContract is
    IAdminContract,
    UUPSUpgradeable,
    OwnableUpgradeable,
    ConfigurableAddresses
{
    // Constants
    // --------------------------------------------------------------------------------------------------------

    /// @notice The contract name.
    string public constant NAME = "AdminContract";

    /// @notice The scaled number which means 100 percent, 1e18 == 100%.
    uint256 public constant _100pct = 1e18;

    /// @notice The default borrowing fee, 0.5%.
    uint256 public constant BORROWING_FEE_DEFAULT = 0.005 * 1e18;

    /// @notice The default critical collateral ratio, 150%.
    uint256 public constant CCR_DEFAULT = 1.5 * 1e18;

    /// @notice The default minimum collateral ratio, 110%.
    uint256 public constant MCR_DEFAULT = 1.1 * 1e18;

    /// @notice The default minimum amount of debt token to mint.
    uint256 public constant MIN_NET_DEBT_DEFAULT = 2000 * 1e18;

    /// @notice The default mint cap, 1 million trenUSD.
    uint256 public constant MINT_CAP_DEFAULT = 1_000_000 * 1e18;

    /// @notice The default liquidation fee, dividing by 200 yields 0.5%.
    uint256 public constant PERCENT_DIVISOR_DEFAULT = 200;

    /// @notice The default floor of redemption fee, 0.5%.
    uint256 public constant REDEMPTION_FEE_FLOOR_DEFAULT = 0.005 * 1e18;

    /// @notice The default block timestamp for redemption.
    uint256 public constant REDEMPTION_BLOCK_TIMESTAMP_DEFAULT = type(uint256).max;

    // State
    // ------------------------------------------------------------------------------------------------------------

    /**
     * @dev The mapping from collateral asset to its parameters.
     * Cannot be public as struct has too many variables for the stack.
     * Create special view structs/getters instead.
     */
    mapping(address collateral => CollateralParams params) internal collateralParams;

    /// @notice The storage struct variable to store flash loan parameters.
    FlashLoanParams public flashLoanParams;

    /// @notice list of all collateral types in collateralParams (active and deprecated).
    address[] public validCollateral;

    /// @notice Checks if all initial collaterals have been configured or not.
    bool public isSetupInitialized;

    /// @notice If true, collected fees go to stakers; if false, to the treasury.
    bool public routeToTRENStaking;

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

    /// @dev Modifier to check that the caller is timelock contract.
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

    /// @dev Modifier to check that the specific collateral is active and the input value is valid.
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

    /**
     * @dev Runs all the setup logic only once.
     * @param initialOwner The address of initial owner.
     */
    function initialize(address initialOwner) external initializer {
        __Ownable_init(initialOwner);
        __UUPSUpgradeable_init();
    }

    /**
     * @dev The deployment script will call this function when all initial collaterals
     * have been configured; after this is set to true,
     * all subsequent config/setters will need to go through the timelocks.
     */
    function setSetupIsInitialized() external onlyTimelock {
        isSetupInitialized = true;
    }

    // External Functions
    // -----------------------------------------------------------------------------------------------

    /// @inheritdoc IAdminContract
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

    /// @inheritdoc IAdminContract
    function setCollateralParameters(
        address _collateral,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor,
        uint256 _redemptionFeeFloor
    )
        external
        override
        onlyTimelock
    {
        collateralParams[_collateral].active = true;
        setBorrowingFee(_collateral, _borrowingFee);
        setCCR(_collateral, _ccr);
        setMCR(_collateral, _mcr);
        setMinNetDebt(_collateral, _minNetDebt);
        setMintCap(_collateral, _mintCap);
        setPercentDivisor(_collateral, _percentDivisor);
        setRedemptionFeeFloor(_collateral, _redemptionFeeFloor);
    }

    /// @inheritdoc IAdminContract
    function setIsActive(address _collateral, bool _active) external onlyTimelock {
        CollateralParams storage collParams = collateralParams[_collateral];
        collParams.active = _active;
    }

    /// @inheritdoc IAdminContract
    function setBorrowingFee(
        address _collateral,
        uint256 _borrowingFee
    )
        public
        override
        onlyTimelock
        safeCheck("Borrowing Fee", _collateral, _borrowingFee, 0, 0.1 ether) // 0% - 10%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldBorrowing = collParams.borrowingFee;
        collParams.borrowingFee = _borrowingFee;
        emit BorrowingFeeChanged(oldBorrowing, _borrowingFee);
    }

    /// @inheritdoc IAdminContract
    function setCCR(
        address _collateral,
        uint256 _newCCR
    )
        public
        override
        onlyTimelock
        safeCheck("CCR", _collateral, _newCCR, 1 ether, 10 ether) // 100% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldCCR = collParams.ccr;
        collParams.ccr = _newCCR;
        emit CCRChanged(oldCCR, _newCCR);
    }

    /// @inheritdoc IAdminContract
    function setMCR(
        address _collateral,
        uint256 _newMCR
    )
        public
        override
        onlyTimelock
        safeCheck("MCR", _collateral, _newMCR, 1.01 ether, 10 ether) // 101% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMCR = collParams.mcr;
        collParams.mcr = _newMCR;
        emit MCRChanged(oldMCR, _newMCR);
    }

    /// @inheritdoc IAdminContract
    function setMinNetDebt(
        address _collateral,
        uint256 _minNetDebt
    )
        public
        override
        onlyTimelock
        safeCheck("Min Net Debt", _collateral, _minNetDebt, 0, 2000 ether)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMinNet = collParams.minNetDebt;
        collParams.minNetDebt = _minNetDebt;
        emit MinNetDebtChanged(oldMinNet, _minNetDebt);
    }

    /// @inheritdoc IAdminContract
    function setMintCap(address _collateral, uint256 _mintCap) public override onlyTimelock {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMintCap = collParams.mintCap;
        collParams.mintCap = _mintCap;
        emit MintCapChanged(oldMintCap, _mintCap);
    }

    /// @inheritdoc IAdminContract
    function setPercentDivisor(
        address _collateral,
        uint256 _percentDivisor
    )
        public
        override
        onlyTimelock
        safeCheck("Percent Divisor", _collateral, _percentDivisor, 2, 200)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldPercent = collParams.percentDivisor;
        collParams.percentDivisor = _percentDivisor;
        emit PercentDivisorChanged(oldPercent, _percentDivisor);
    }

    /// @inheritdoc IAdminContract
    function setRedemptionFeeFloor(
        address _collateral,
        uint256 _redemptionFeeFloor
    )
        public
        override
        onlyTimelock
        safeCheck("Redemption Fee Floor", _collateral, _redemptionFeeFloor, 0.001 ether, 0.1 ether)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldRedemptionFeeFloor = collParams.redemptionFeeFloor;
        collParams.redemptionFeeFloor = _redemptionFeeFloor;
        emit RedemptionFeeFloorChanged(oldRedemptionFeeFloor, _redemptionFeeFloor);
    }

    /// @inheritdoc IAdminContract
    function setRedemptionBlockTimestamp(
        address _collateral,
        uint256 _blockTimestamp
    )
        external
        override
        onlyTimelock
    {
        collateralParams[_collateral].redemptionBlockTimestamp = _blockTimestamp;
        emit RedemptionBlockTimestampChanged(_collateral, _blockTimestamp);
    }

    /// @inheritdoc IAdminContract
    function setFeeForFlashLoan(uint256 _flashLoanFee) external onlyTimelock {
        uint256 oldFlashLoanFee = flashLoanParams.flashLoanFee;
        flashLoanParams.flashLoanFee = _flashLoanFee;

        emit FlashLoanFeeChanged(oldFlashLoanFee, _flashLoanFee);
    }

    /// @inheritdoc IAdminContract
    function setMinDebtForFlashLoan(uint256 _flashLoanMinDebt) external onlyTimelock {
        uint256 oldFlashLoanMinDebt = flashLoanParams.flashLoanMinDebt;
        flashLoanParams.flashLoanMinDebt = _flashLoanMinDebt;

        emit FlashLoanMinDebtChanged(oldFlashLoanMinDebt, _flashLoanMinDebt);
    }

    /// @inheritdoc IAdminContract
    function setMaxDebtForFlashLoan(uint256 _flashLoanMaxDebt) external onlyTimelock {
        uint256 oldFlashLoanMaxDebt = flashLoanParams.flashLoanMaxDebt;
        flashLoanParams.flashLoanMaxDebt = _flashLoanMaxDebt;

        emit FlashLoanMaxDebtChanged(oldFlashLoanMaxDebt, _flashLoanMaxDebt);
    }

    /// @inheritdoc IAdminContract
    function switchRouteToTRENStaking() external onlyTimelock {
        if (routeToTRENStaking) {
            routeToTRENStaking = false;
        } else {
            routeToTRENStaking = true;
        }
    }

    // View functions
    // ---------------------------------------------------------------------------------------------------

    /// @inheritdoc IAdminContract
    function DECIMAL_PRECISION() external pure returns (uint256) {
        return _DECIMAL_PRECISION;
    }

    /// @inheritdoc IAdminContract
    function getValidCollateral() external view override returns (address[] memory) {
        return validCollateral;
    }

    /// @inheritdoc IAdminContract
    function getIsActive(address _collateral)
        external
        view
        override
        exists(_collateral)
        returns (bool)
    {
        return collateralParams[_collateral].active;
    }

    /// @inheritdoc IAdminContract
    function getIndex(address _collateral)
        external
        view
        override
        exists(_collateral)
        returns (uint256)
    {
        return (collateralParams[_collateral].index);
    }

    /// @inheritdoc IAdminContract
    function getIndices(address[] memory _colls) external view returns (uint256[] memory indices) {
        uint256 len = _colls.length;
        indices = new uint256[](len);

        for (uint256 i; i < len;) {
            _exists(_colls[i]);
            indices[i] = collateralParams[_colls[i]].index;
            unchecked {
                ++i;
            }
        }
    }

    /// @inheritdoc IAdminContract
    function getMcr(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].mcr;
    }

    /// @inheritdoc IAdminContract
    function getCcr(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].ccr;
    }

    /// @inheritdoc IAdminContract
    function getDebtTokenGasCompensation(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralParams[_collateral].debtTokenGasCompensation;
    }

    /// @inheritdoc IAdminContract
    function getMinNetDebt(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].minNetDebt;
    }

    /// @inheritdoc IAdminContract
    function getPercentDivisor(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].percentDivisor;
    }

    /// @inheritdoc IAdminContract
    function getBorrowingFee(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].borrowingFee;
    }

    /// @inheritdoc IAdminContract
    function getRedemptionFeeFloor(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].redemptionFeeFloor;
    }

    /// @inheritdoc IAdminContract
    function getRedemptionBlockTimestamp(address _collateral)
        external
        view
        override
        returns (uint256)
    {
        return collateralParams[_collateral].redemptionBlockTimestamp;
    }

    /// @inheritdoc IAdminContract
    function getMintCap(address _collateral) external view override returns (uint256) {
        return collateralParams[_collateral].mintCap;
    }

    /// @inheritdoc IAdminContract
    function getTotalAssetDebt(address _asset) external view override returns (uint256) {
        return ITrenBoxStorage(trenBoxStorage).getTotalDebtBalance(_asset);
    }

    /// @inheritdoc IAdminContract
    function getFlashLoanFee() external view override returns (uint256) {
        return flashLoanParams.flashLoanFee;
    }

    /// @inheritdoc IAdminContract
    function getFlashLoanMinNetDebt() external view override returns (uint256) {
        return flashLoanParams.flashLoanMinDebt;
    }

    /// @inheritdoc IAdminContract
    function getFlashLoanMaxNetDebt() external view override returns (uint256) {
        return flashLoanParams.flashLoanMaxDebt;
    }

    /// @inheritdoc IAdminContract
    function getRouteToTRENStaking() external view override returns (bool) {
        return routeToTRENStaking;
    }

    // Internal Functions
    // -----------------------------------------------------------------------------------------------

    /**
     * @dev Checks if the specific collateral asset exists or not.
     * @param _collateral The address of collateral asset.
     */
    function _exists(address _collateral) private view {
        if (collateralParams[_collateral].mcr == 0) {
            revert AdminContract__CollateralDoesNotExist();
        }
    }

    function authorizeUpgrade(address newImplementation) external {
        _authorizeUpgrade(newImplementation);
    }

    function _authorizeUpgrade(address) internal override onlyOwner { }
}
