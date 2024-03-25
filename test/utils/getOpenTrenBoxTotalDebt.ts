import { Context } from "mocha";

import type { GetOpenTrenBoxTotalDebtArgs } from "../shared/types";

export function getOpenTrenBoxTotalDebt(context: Context) {
  return async (args: GetOpenTrenBoxTotalDebtArgs) => {
    const { asset, debtTokenAmount, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const fee = await trenBoxManager.getBorrowingFee(asset, debtTokenAmount);
    const compositeDebt = await context.utils.getCompositeDebt(args);

    return fee + compositeDebt;
  };
}
