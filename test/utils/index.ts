import { network } from "hardhat";
import { Context } from "mocha";

import { TestUtils } from "../shared/types";
import { connectRedeployedContracts } from "./connectRedeployedContracts";
import { getActualDebtFromCompositeDebt } from "./getActualDebtFromCompositeDebt";
import { getAddressesForSetAddresses } from "./getAddressesForSetAddresses";
import { getCompositeDebt } from "./getCompositeDebt";
import { getNetBorrowingAmount } from "./getNetBorrowingAmount";
import { getOpenTrenBoxTotalDebt } from "./getOpenTrenBoxTotalDebt";
import { openTrenBox } from "./openTrenBox";
import { setUsers } from "./setUsers";
import { setupCollateralForTests } from "./setupCollateralForTests";
import { setupProtocolForTests } from "./setupProtocolForTests";

export function setupUtils(context: Context): TestUtils {
  return {
    revertToInitialSnapshot: async () => {
      await network.provider.send("evm_revert", [context.initialSnapshotId]);
    },
    getAddressesForSetAddresses: getAddressesForSetAddresses(context),
    getNetBorrowingAmount: getNetBorrowingAmount(context),
    getCompositeDebt: getCompositeDebt(context),
    getOpenTrenBoxTotalDebt: getOpenTrenBoxTotalDebt(context),
    getActualDebtFromCompositeDebt: getActualDebtFromCompositeDebt(context),
    openTrenBox: openTrenBox(context),
    setupCollateralForTests: setupCollateralForTests(context),
    connectRedeployedContracts: connectRedeployedContracts(context),
    setupProtocolForTests: setupProtocolForTests(context),
    setUsers: setUsers(context),
  };
}
