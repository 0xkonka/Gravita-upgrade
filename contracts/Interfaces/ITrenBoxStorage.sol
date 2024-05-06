// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ITrenBoxStorage {
    struct DebtBalances {
        uint256 active;
        uint256 liquidated;
    }

    struct CollBalances {
        uint256 active;
        uint256 liquidated;
        uint256 claimable;
    }

    event ActiveCollateralBalanceUpdated(address _collateral, uint256 _newBalance);
    event ActiveDebtBalanceUpdated(address _collateral, uint256 _newBalance);
    event LiquidatedCollateralBalanceUpdated(address _collateral, uint256 _newBalance);
    event LiquidatedDebtBalanceUpdated(address _collateral, uint256 _newBalance);
    event ClaimableCollateralBalanceUpdated(address _collateral, uint256 _newBalance);
    event CollateralSent(address _to, address _collateral, uint256 _amount);
    event UserClaimableCollateralBalanceUpdated(
        address _account, address _collateral, uint256 _newBalance
    );

    error TrenBoxStorage__NotAuthorizedContract();
    error TrenBoxStorage__TrenBoxManagerOnly();
    error TrenBoxStorage__BorrowerOperationsOnly();
    error TrenBoxStorage__BorrowerOperationsOrTrenBoxManagerOnly();
    error TrenBoxStorage__TrenBoxManagerOrTrenBoxManagerOpearationsOnly();
    error TrenBoxStorage__NoClaimableCollateral();

    function getActiveCollateralBalance(address _collateral) external view returns (uint256);
    function getActiveDebtBalance(address _collateral) external view returns (uint256);

    function getLiquidatedCollateralBalance(address _collateral) external view returns (uint256);
    function getLiquidatedDebtBalance(address _collateral) external view returns (uint256);

    function getClaimableCollateralBalance(address _collateral) external view returns (uint256);
    function getUserClaimableCollateralBalance(
        address _collateral,
        address _account
    )
        external
        view
        returns (uint256);

    function increaseActiveDebt(address _collateral, uint256 _amount) external;
    function decreaseActiveDebt(address _collateral, uint256 _amount) external;

    function increaseLiquidatedDebt(address _collateral, uint256 _amount) external;
    function decreaseLiquidatedDebt(address _collateral, uint256 _amount) external;

    function increaseActiveCollateral(address _collateral, uint256 _amount) external;
    function decreaseActiveCollateral(address _collateral, uint256 _amount) external;

    function increaseLiquidatedCollateral(address _collateral, uint256 _amount) external;
    function decreaseLiquidatedCollateral(address _collateral, uint256 _amount) external;

    function increaseClaimableCollateral(address _collateral, uint256 _amount) external;
    function updateUserClaimableBalance(
        address _collateral,
        address _account,
        uint256 _amount
    )
        external;

    function sendCollateral(address _collateral, address _account, uint256 _amount) external;

    function claimCollateral(address _collateral, address _account) external;
}
