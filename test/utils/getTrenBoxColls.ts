import { Context } from "mocha";

import type { GetTrenBoxCollArgs } from "../shared/types";

export function getTrenBoxColls(context: Context) {
  return async function (args: GetTrenBoxCollArgs) {
    const { asset, borrowers, overrideTrenBoxManager } = args;
    const trenBoxManager = overrideTrenBoxManager || context.contracts.trenBoxManager;

    const results = [];

    for (const borrower of borrowers) {
      const trenBoxDebt = await trenBoxManager.getTrenBoxColl(asset, borrower);
      results.push(trenBoxDebt);
    }

    return results;
  };
}
