// SPDX-License-Identifier: MIT

pragma solidity ^0.8.23;

import { IDeposit } from "./IDeposit.sol";

interface IStabilityPool is IDeposit {
    // --- Structs ---

    struct Snapshots {
        mapping(address => uint256) S;
        uint256 P;
        uint256 G;
        uint128 scale;
        uint128 epoch;
    }

    // --- Events ---

    event CommunityIssuanceAddressChanged(address newAddress);
    event DepositSnapshotUpdated(address indexed _depositor, uint256 _P, uint256 _G);
    event SystemSnapshotUpdated(uint256 _P, uint256 _G);

    event AssetSent(address _asset, address _to, uint256 _amount);
    event GainsWithdrawn(
        address indexed _depositor,
        address[] _collaterals,
        uint256[] _amounts,
        uint256 _debtTokenLoss
    );
    event TRENPaidToDepositor(address indexed _depositor, uint256 _TREN);
    event StabilityPoolAssetBalanceUpdated(address _asset, uint256 _newBalance);
    event StabilityPoolDebtTokenBalanceUpdated(uint256 _newBalance);
    event StakeChanged(uint256 _newSystemStake, address _depositor);
    event UserDepositChanged(address indexed _depositor, uint256 _newDeposit);

    event P_Updated(uint256 _P);
    event S_Updated(address _asset, uint256 _S, uint128 _epoch, uint128 _scale);
    event G_Updated(uint256 _G, uint128 _epoch, uint128 _scale);
    event EpochUpdated(uint128 _currentEpoch);
    event ScaleUpdated(uint128 _currentScale);

    // --- Errors ---

    error StabilityPool__ActivePoolOnly(address sender, address expected);
    error StabilityPool__AdminContractOnly(address sender, address expected);
    error StabilityPool__TrenBoxManagerOnly(address sender, address expected);
    error StabilityPool__ArrayNotInAscendingOrder();

    // --- Functions ---

    function addCollateralType(address _collateral) external;

    /*
     * Initial checks:
     * - _amount is not zero
     * ---
    * - Triggers a TREN issuance, based on time passed since the last issuance. The TREN issuance is
    shared between *all* depositors.
     * - Sends depositor's accumulated gains (TREN, assets) to depositor
     */
    function provideToSP(uint256 _amount, address[] calldata _assets) external;

    /*
     * Initial checks:
     * - _amount is zero or there are no under collateralized trenBoxes left in the system
     * - User has a non zero deposit
     * ---
    * - Triggers a TREN issuance, based on time passed since the last issuance. The TREN issuance is
    shared between *all* depositors.
     * - Sends all depositor's accumulated gains (TREN, assets) to depositor
     * - Decreases deposit's stake, and takes new snapshots.
     *
     * If _amount > userDeposit, the user withdraws all of their compounded deposit.
     */
    function withdrawFromSP(uint256 _amount, address[] calldata _assets) external;

    /*
    Initial checks:
    * - Caller is TrenBoxManager
    * ---
    * Cancels out the specified debt against the debt token contained in the Stability Pool (as far
    as possible)
    * and transfers the TrenBox's collateral from ActivePool to StabilityPool.
    * Only called by liquidation functions in the TrenBoxManager.
    */
    function offset(uint256 _debt, address _asset, uint256 _coll) external;

    /*
    * Returns debt tokens held in the pool. Changes when users deposit/withdraw, and when TrenBox
    debt is offset.
     */
    function getTotalDebtTokenDeposits() external view returns (uint256);

    /*
     * Calculates the asset gains earned by the deposit since its last snapshots were taken.
     */
    function getDepositorGains(
        address _depositor,
        address[] calldata _assets
    )
        external
        view
        returns (address[] memory, uint256[] memory);

    /*
     * Calculate the TREN gain earned by a deposit since its last snapshots were taken.
     */
    function getDepositorTRENGain(address _depositor) external view returns (uint256);

    /*
     * Return the user's compounded deposits.
     */
    function getCompoundedDebtTokenDeposits(address _depositor) external view returns (uint256);
}
