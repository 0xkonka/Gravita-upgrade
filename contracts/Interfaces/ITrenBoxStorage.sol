// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

interface ITrenBoxStorage {
    struct Balance {
        uint256 active;
        uint256 liquidated;
    }

    event ActiveCollateralBalanceUpdated(address _collateral, uint256 _newBalance);
    event ActiveDebtBalanceUpdated(address _collateral, uint256 _newBalance);
    event LiquidatedCollateralBalanceUpdated(address _collateral, uint256 _newBalance);
    event LiquidatedDebtBalanceUpdated(address _collateral, uint256 _newBalance);
    event CollateralSent(address _to, address _collateral, uint256 _amount);

    error TrenBoxStorage__NotAuthorizedContract();
    error TrenBoxStorage__NotTrenBoxManager();

    function getActiveCollateralBalance(address _collateral) external view returns (uint256);
    function getActiveDebtBalance(address _collateral) external view returns (uint256);

    function getLiquidatedCollateralBalance(address _collateral) external view returns (uint256);
    function getLiquidatedDebtBalance(address _collateral) external view returns (uint256);

    function increaseActiveDebt(address _collateral, uint256 _amount) external;
    function decreaseActiveDebt(address _collateral, uint256 _amount) external;

    function increaseLiquidatedDebt(address _collateral, uint256 _amount) external;
    function decreaseLiquidatedDebt(address _collateral, uint256 _amount) external;

    function increaseActiveCollateral(address _collateral, uint256 _amount) external;
    function decreaseActiveCollateral(address _collateral, uint256 _amount) external;

    function increaseLiquidatedCollateral(address _collateral, uint256 _amount) external;
    function decreaseLiquidatedCollateral(address _collateral, uint256 _amount) external;

    function sendAsset(address _collateral, address _account, uint256 _amount) external;
}
