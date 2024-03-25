import { Context } from "mocha";

import type { GetActualDebtFromCompositeDebtArgs } from "../shared/types";

export function getActualDebtFromCompositeDebt(context: Context) {
  return async (args: GetActualDebtFromCompositeDebtArgs) => {
    const { asset, compositeDebt, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const issuedDebt = await trenBoxManager.getNetDebt(asset, compositeDebt);

    return issuedDebt;
  };
}
