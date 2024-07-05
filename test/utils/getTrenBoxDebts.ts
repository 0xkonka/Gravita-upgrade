import { Context } from "mocha";

import type { GetTrenBoxDebtArgs } from "../shared/types";

export function getTrenBoxDebts(context: Context) {
  return async function (args: GetTrenBoxDebtArgs) {
    const { asset, borrowers, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const results = [];

    for (const borrower of borrowers) {
      const trenBoxDebt = await trenBoxManager.getTrenBoxDebt(asset, borrower);
      results.push(trenBoxDebt);
    }

    return results;
  };
}
