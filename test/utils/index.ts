import { network } from "hardhat";
import { Context } from "mocha";

import { TestUtils } from "../shared/types";
import { addCollateral } from "./addCollateral";
import { batchLiquidateTrenBoxes } from "./batchLiquidateTrenBoxes";
import { connectRedeployedContracts } from "./connectRedeployedContracts";
import { getActualDebtFromCompositeDebt } from "./getActualDebtFromCompositeDebt";
import { getAddressesForSetAddresses } from "./getAddressesForSetAddresses";
import { getCompositeDebt } from "./getCompositeDebt";
import { getNetBorrowingAmount } from "./getNetBorrowingAmount";
import { getOpenTrenBoxTotalDebt } from "./getOpenTrenBoxTotalDebt";
import { getTrenBoxColls } from "./getTrenBoxColls";
import { getTrenBoxDebts } from "./getTrenBoxDebts";
import { getTrenBoxStatuses } from "./getTrenBoxStatuses";
import { liquidate } from "./liquidate";
import { liquidateTrenBoxes } from "./liquidateTrenBoxes";
import { openTrenBox } from "./openTrenBox";
import { provideToStabilityPool } from "./provideToStabilityPool";
import { repayDebt } from "./repayDebt";
import { setUsers } from "./setUsers";
import { setupCollateralForTests } from "./setupCollateralForTests";
import { setupProtocolForTests } from "./setupProtocolForTests";
import { takeDebt } from "./takeDebt";
import { withdrawCollateral } from "./withdrawCollateral";
import { withdrawFromStabilityPool } from "./withdrawFromStabilityPool";

export function setupUtils(context: Context): TestUtils {
  return {
    revertToInitialSnapshot: async () => {
      await network.provider.send("evm_revert", [context.initialSnapshotId]);
    },
    getAddressesForSetAddresses: getAddressesForSetAddresses(context),
    getNetBorrowingAmount: getNetBorrowingAmount(context),
    getCompositeDebt: getCompositeDebt(context),
    getTrenBoxStatuses: getTrenBoxStatuses(context),
    getTrenBoxColls: getTrenBoxColls(context),
    getTrenBoxDebts: getTrenBoxDebts(context),
    getOpenTrenBoxTotalDebt: getOpenTrenBoxTotalDebt(context),
    getActualDebtFromCompositeDebt: getActualDebtFromCompositeDebt(context),
    openTrenBox: openTrenBox(context),
    setupCollateralForTests: setupCollateralForTests(context),
    connectRedeployedContracts: connectRedeployedContracts(context),
    setupProtocolForTests: setupProtocolForTests(context),
    setUsers: setUsers(context),
    addCollateral: addCollateral(context),
    withdrawCollateral: withdrawCollateral(context),
    takeDebt: takeDebt(context),
    repayDebt: repayDebt(context),
    provideToStabilityPool: provideToStabilityPool(context),
    withdrawFromStabilityPool: withdrawFromStabilityPool(context),
    liquidate: liquidate(context),
    batchLiquidateTrenBoxes: batchLiquidateTrenBoxes(context),
    liquidateTrenBoxes: liquidateTrenBoxes(context),
  };
}
