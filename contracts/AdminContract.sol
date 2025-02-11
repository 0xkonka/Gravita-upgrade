// SPDX-License-Identifier: MIT
pragma solidity =0.8.23;

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

    /// @notice The grace period for updating the collateral ratio during which old value is
    /// linearly changed to new value.
    uint256 public constant MCR_GRACE_PERIOD = 1 weeks;

    /// @notice The grace period for updating the collateral ratio during which old value is
    /// linearly changed to new value.
    uint256 public constant CCR_GRACE_PERIOD = 1 weeks;

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
        if (isSetupInitialized) {
            revert AdminContract__AlreadyInitialized();
        }

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
        _addNewCollateral(_collateral, _debtTokenGasCompensation);
    }

    /// @inheritdoc IAdminContract
    function addAndInitializeNewCollateral(
        address _collateral,
        uint256 _debtTokenGasCompensation,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor
    )
        external
        override
        onlyTimelock
    {
        _addNewCollateral(_collateral, _debtTokenGasCompensation);
        _setCollateralParameters(
            _collateral, _borrowingFee, _ccr, _mcr, _minNetDebt, _mintCap, _percentDivisor, false
        );
    }

    /// @inheritdoc IAdminContract
    function setCollateralParameters(
        address _collateral,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor
    )
        external
        override
        onlyTimelock
        exists(_collateral)
    {
        _setCollateralParameters(
            _collateral, _borrowingFee, _ccr, _mcr, _minNetDebt, _mintCap, _percentDivisor, true
        );
    }

    /// @inheritdoc IAdminContract
    function setIsActive(
        address _collateral,
        bool _active
    )
        external
        onlyTimelock
        exists(_collateral)
    {
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
    {
        _setBorrowingFee(_collateral, _borrowingFee);
    }

    /// @inheritdoc IAdminContract
    function setCCR(address _collateral, uint256 _newCCR) public override onlyTimelock {
        _setCCR(_collateral, _newCCR, true);
    }

    /// @inheritdoc IAdminContract
    function setMCR(address _collateral, uint256 _newMCR) public override onlyTimelock {
        _setMCR(_collateral, _newMCR, true);
    }

    /// @inheritdoc IAdminContract
    function setMinNetDebt(address _collateral, uint256 _minNetDebt) public override onlyTimelock {
        _setMinNetDebt(_collateral, _minNetDebt);
    }

    /// @inheritdoc IAdminContract
    function setMintCap(address _collateral, uint256 _mintCap) public override onlyTimelock {
        _setMintCap(_collateral, _mintCap);
    }

    /// @inheritdoc IAdminContract
    function setPercentDivisor(
        address _collateral,
        uint256 _percentDivisor
    )
        public
        override
        onlyTimelock
    {
        _setPercentDivisor(_collateral, _percentDivisor);
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
        return collateralParams[_collateral].index;
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
        return _getOrCalculateCurrentMCR(collateralParams[_collateral]);
    }

    /// @inheritdoc IAdminContract
    function getCcr(address _collateral) external view override returns (uint256) {
        return _getOrCalculateCurrentCCR(collateralParams[_collateral]);
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

    function authorizeUpgrade(address newImplementation) external {
        _authorizeUpgrade(newImplementation);
    }

    // Internal Functions
    // -----------------------------------------------------------------------------------------------

    function _authorizeUpgrade(address) internal override onlyOwner { }

    /**
     * @dev Checks if the specific collateral asset exists or not.
     * @param _collateral The address of collateral asset.
     */
    function _exists(address _collateral) private view {
        if (collateralParams[_collateral].mcr == 0) {
            revert AdminContract__CollateralDoesNotExist();
        }
    }

    function _addNewCollateral(address _collateral, uint256 _debtTokenGasCompensation) internal {
        if (collateralParams[_collateral].mcr != 0) {
            revert AdminContract__CollateralExists();
        }

        validCollateral.push(_collateral);
        collateralParams[_collateral] = CollateralParams({
            index: validCollateral.length - 1,
            active: false,
            borrowingFee: BORROWING_FEE_DEFAULT,
            ccr: CCR_DEFAULT,
            previousCcr: 0,
            ccrUpdateDeadline: 0,
            mcr: MCR_DEFAULT,
            previousMcr: 0,
            mcrUpdateDeadline: 0,
            debtTokenGasCompensation: _debtTokenGasCompensation,
            minNetDebt: MIN_NET_DEBT_DEFAULT,
            mintCap: MINT_CAP_DEFAULT,
            percentDivisor: PERCENT_DIVISOR_DEFAULT
        });

        emit CollateralAdded(_collateral);

        IStabilityPool(stabilityPool).addCollateralType(_collateral);
    }

    function _setBorrowingFee(
        address _collateral,
        uint256 _borrowingFee
    )
        internal
        safeCheck("Borrowing Fee", _collateral, _borrowingFee, 0, 0.1 ether) // 0% - 10%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldBorrowing = collParams.borrowingFee;
        collParams.borrowingFee = _borrowingFee;
        emit BorrowingFeeChanged(oldBorrowing, _borrowingFee);
    }

    function _getOrCalculateCurrentCCR(CollateralParams storage collParams)
        internal
        view
        returns (uint256 currentCcr)
    {
        if (collParams.ccrUpdateDeadline > block.timestamp) {
            uint256 impactPercentage =
                _100pct * (collParams.ccrUpdateDeadline - block.timestamp) / CCR_GRACE_PERIOD;

            if (collParams.ccr >= collParams.previousCcr) {
                currentCcr = collParams.ccr
                    - (impactPercentage * (collParams.ccr - collParams.previousCcr)) / _100pct;
            } else {
                currentCcr = collParams.ccr
                    + (impactPercentage * (collParams.previousCcr - collParams.ccr)) / _100pct;
            }
        } else {
            currentCcr = collParams.ccr;
        }
    }

    function _setCCR(
        address _collateral,
        uint256 _ccr,
        bool _applyGracePeriodDeadline
    )
        internal
        safeCheck("CCR", _collateral, _ccr, 1 ether, 10 ether) // 100% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];

        uint256 currentCcr = _getOrCalculateCurrentCCR(collParams);

        collParams.ccr = _ccr;
        collParams.previousCcr = currentCcr;

        if (_applyGracePeriodDeadline) {
            collParams.ccrUpdateDeadline = block.timestamp + CCR_GRACE_PERIOD;
        }

        emit CCRChanged(currentCcr, _ccr);
    }

    function _getOrCalculateCurrentMCR(CollateralParams storage collParams)
        internal
        view
        returns (uint256 currentMcr)
    {
        if (collParams.mcrUpdateDeadline > block.timestamp) {
            uint256 impactPercentage =
                _100pct * (collParams.mcrUpdateDeadline - block.timestamp) / MCR_GRACE_PERIOD;

            if (collParams.mcr >= collParams.previousMcr) {
                currentMcr = collParams.mcr
                    - (impactPercentage * (collParams.mcr - collParams.previousMcr)) / _100pct;
            } else {
                currentMcr = collParams.mcr
                    + (impactPercentage * (collParams.previousMcr - collParams.mcr)) / _100pct;
            }
        } else {
            currentMcr = collParams.mcr;
        }
    }

    function _setMCR(
        address _collateral,
        uint256 _mcr,
        bool _applyGracePeriodDeadline
    )
        internal
        safeCheck("MCR", _collateral, _mcr, 1.01 ether, 10 ether) // 101% - 1,000%
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 currentMcr = _getOrCalculateCurrentMCR(collParams);

        collParams.mcr = _mcr;
        collParams.previousMcr = currentMcr;
        if (_applyGracePeriodDeadline) {
            collParams.mcrUpdateDeadline = block.timestamp + MCR_GRACE_PERIOD;
        }

        emit MCRChanged(currentMcr, _mcr);
    }

    function _setMinNetDebt(
        address _collateral,
        uint256 _minNetDebt
    )
        internal
        safeCheck("Min Net Debt", _collateral, _minNetDebt, 0, 2000 ether)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMinNet = collParams.minNetDebt;
        collParams.minNetDebt = _minNetDebt;
        emit MinNetDebtChanged(oldMinNet, _minNetDebt);
    }

    function _setMintCap(address _collateral, uint256 _mintCap) internal {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldMintCap = collParams.mintCap;
        collParams.mintCap = _mintCap;
        emit MintCapChanged(oldMintCap, _mintCap);
    }

    function _setPercentDivisor(
        address _collateral,
        uint256 _percentDivisor
    )
        internal
        safeCheck("Percent Divisor", _collateral, _percentDivisor, 2, 200)
    {
        CollateralParams storage collParams = collateralParams[_collateral];
        uint256 oldPercent = collParams.percentDivisor;
        collParams.percentDivisor = _percentDivisor;
        emit PercentDivisorChanged(oldPercent, _percentDivisor);
    }

    function _setCollateralParameters(
        address _collateral,
        uint256 _borrowingFee,
        uint256 _ccr,
        uint256 _mcr,
        uint256 _minNetDebt,
        uint256 _mintCap,
        uint256 _percentDivisor,
        bool _applyGracePeriodDeadline
    )
        internal
    {
        collateralParams[_collateral].active = true;

        _setBorrowingFee(_collateral, _borrowingFee);
        _setCCR(_collateral, _ccr, _applyGracePeriodDeadline);
        _setMCR(_collateral, _mcr, _applyGracePeriodDeadline);
        _setMinNetDebt(_collateral, _minNetDebt);
        _setMintCap(_collateral, _mintCap);
        _setPercentDivisor(_collateral, _percentDivisor);
    }
}
